import datetime
import logging
from typing import List, Dict, Any, Optional
from backend.database.repository import repo
from services.transport import transport_engine
from services.supplier import supplier_service

logger = logging.getLogger("samooh.services.procurement")


class ProcurementEngine:
    """
    Procurement Pool Formation Engine.
    Aggregates matched retailer demands into official procurement pools.
    Dynamically evaluates supplier feasibility (MOQ, Inventory, Distance Radius, Pricing Tiers).
    Selects optimal supplier with full explainability, generates transport plans,
    and automatically creates pending Supplier Orders.
    """

    def evaluate_supplier_feasibility(
        self,
        product: Dict[str, Any],
        pooled_quantity: float,
        delivery_distance_km: float
    ) -> Dict[str, Any]:
        """
        Evaluates candidate suppliers for a product given pooled demand and delivery distance.
        Finds all suppliers offering this product or category, checks:
        1. Product active / availability
        2. Inventory sufficiency (available >= pooled_quantity)
        3. MOQ satisfaction (pooled_quantity >= MOQ)
        4. Delivery radius (delivery_distance <= service_radius)
        5. Effective quantity-tier price
        Returns selected supplier, selection reasons, and list of evaluated candidates.
        """
        all_products = repo.get_all("products")
        all_suppliers = {s['id']: s for s in repo.get_all("suppliers")}

        target_name = product.get("name", "").strip().lower()
        target_cat = product.get("category", "").strip().lower()

        # Find matching product records (same product name or exact ID)
        candidate_offerings = [
            p for p in all_products
            if p.get("id") == product.get("id") or p.get("name", "").strip().lower() == target_name
        ]
        if not candidate_offerings:
            candidate_offerings = [product]

        evaluated_candidates = []
        feasible_candidates = []

        for cand in candidate_offerings:
            sup_id = cand.get("supplier_id", "sup_01")
            sup_name = cand.get("supplier_name") or all_suppliers.get(sup_id, {}).get("name", f"Supplier {sup_id}")
            moq = float(cand.get("min_wholesale_quantity", 30.0))
            available_stock = float(cand.get("available_quantity", 500.0))
            radius_km = float(cand.get("service_radius_km", 50.0))
            is_active = cand.get("is_available", True)

            # Pricing tier calculation
            tier_pricing = supplier_service.calculate_tiered_price(cand, pooled_quantity)
            unit_price = tier_pricing["final_unit_price"]
            total_value = tier_pricing["final_order_value"]

            # Feasibility checks
            rejection_reasons = []
            if not is_active:
                rejection_reasons.append("✗ Product marked unavailable by supplier")
            if pooled_quantity < moq:
                deficit = round(moq - pooled_quantity, 1)
                rejection_reasons.append(f"✗ MOQ not satisfied (Requires {moq}, Pooled {pooled_quantity} - Deficit: {deficit})")
            if pooled_quantity > available_stock:
                shortage = round(pooled_quantity - available_stock, 1)
                rejection_reasons.append(f"✗ Insufficient inventory (Available {available_stock}, Requested {pooled_quantity} - Shortage: {shortage})")
            if delivery_distance_km > radius_km:
                rejection_reasons.append(f"✗ Outside delivery radius (Distance {delivery_distance_km:.1f} km > Radius {radius_km:.1f} km)")

            is_feasible = (len(rejection_reasons) == 0)

            eval_entry = {
                "supplier_id": sup_id,
                "supplier_name": sup_name,
                "product_id": cand.get("id"),
                "moq": moq,
                "available_stock": available_stock,
                "service_radius_km": radius_km,
                "base_price": tier_pricing["base_price"],
                "unit_price": unit_price,
                "final_order_value": total_value,
                "is_feasible": is_feasible,
                "rejection_reasons": rejection_reasons,
                "tier_applied": tier_pricing["tier_applied"]
            }
            evaluated_candidates.append(eval_entry)

            if is_feasible:
                feasible_candidates.append(eval_entry)

        # Selection strategy:
        # If feasible suppliers exist, select the one with lowest final_unit_price.
        # If none are feasible, select candidate with least deficit/shortage for transparency.
        if feasible_candidates:
            # Sort by lowest unit price
            feasible_candidates.sort(key=lambda x: (x["unit_price"], -x["available_stock"]))
            winner = feasible_candidates[0]
            selection_reasons = [
                f"✓ Product active and verified available",
                f"✓ Inventory sufficient ({winner['available_stock']} units in stock for {pooled_quantity} demand)",
                f"✓ Wholesale MOQ satisfied ({pooled_quantity} >= {winner['moq']} threshold)",
                f"✓ Within supplier delivery radius ({delivery_distance_km:.1f} km <= {winner['service_radius_km']:.1f} km)",
                f"✓ Lowest net procurement wholesale cost: ₹{winner['unit_price']:,.2f}/unit"
            ]
        else:
            # Fallback to closest/first candidate
            winner = evaluated_candidates[0]
            selection_reasons = [
                f"⚠ Supplier conditionally selected but feasibility constraints active: " + "; ".join(winner["rejection_reasons"])
            ]

        return {
            "selected_supplier_id": winner["supplier_id"],
            "selected_supplier_name": winner["supplier_name"],
            "selected_product_id": winner["product_id"],
            "unit_price": winner["unit_price"],
            "final_order_value": winner["final_order_value"],
            "supplier_moq": winner["moq"],
            "available_stock": winner["available_stock"],
            "is_feasible": winner["is_feasible"],
            "selection_reasons": selection_reasons,
            "evaluated_suppliers": evaluated_candidates
        }

    def create_procurement_pools(self, matched_clusters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transforms candidate clusters into validated procurement pools.
        Dynamically matches suppliers, validates MOQ and inventory, generates transport plans,
        and saves pools + pending supplier orders in database.
        """
        products_map = {p['id']: p for p in repo.get_all("products")}
        created_pools = []
        created_supplier_orders = []
        pool_counter = 0

        for cluster in matched_clusters:
            pool_counter += 1
            prod_id = cluster["product_id"]
            product = products_map.get(prod_id, {})
            retailer_demands = cluster.get("retailer_demands", {})
            avg_dist = float(cluster.get("average_distance_km", 2.5))
            num_retailers = len(cluster.get("retailer_ids", []))

            # 1. Calculate raw pooled demand
            raw_pooled_qty = sum(float(v) for v in retailer_demands.values() if isinstance(v, (int, float)) and v > 0)

            # 2. Evaluate Dynamic Multi-Supplier Feasibility
            supplier_eval = self.evaluate_supplier_feasibility(
                product=product,
                pooled_quantity=raw_pooled_qty,
                delivery_distance_km=avg_dist
            )

            # Active supplier terms
            effective_moq = supplier_eval["supplier_moq"]
            selected_sup_id = supplier_eval["selected_supplier_id"]
            selected_sup_name = supplier_eval["selected_supplier_name"]

            # 3. Calculate pooled physical inventory using supplier's actual configured MOQ
            pooled_inv = transport_engine.calculate_pooled_inventory(
                retailer_demands=retailer_demands,
                product=product,
                moq_threshold=effective_moq
            )

            total_dem = pooled_inv["total_quantity"]
            is_met = pooled_inv["moq_satisfied"]
            prog_pct = round((total_dem / effective_moq) * 100, 1) if effective_moq > 0 else 100.0

            # 4. Compute deterministic constraint-based transport plan
            transport_rec = transport_engine.recommend_transport(
                pooled_inventory=pooled_inv,
                delivery_distance_km=avg_dist,
                delivery_stops_count=num_retailers
            )

            pool_id = f"pool_{pool_counter:03d}"
            now_iso = datetime.datetime.utcnow().isoformat() + "Z"

            pool_data = {
                "id": pool_id,
                "product_id": prod_id,
                "product_name": product.get("name", "Product"),
                "supplier_id": selected_sup_id,
                "supplier_name": selected_sup_name,
                "retailer_ids": cluster["retailer_ids"],
                "retailer_demands": cluster["retailer_demands"],
                "total_demand": total_dem,
                "threshold_quantity": effective_moq,
                "is_threshold_met": is_met,
                "progress_percentage": prog_pct,
                "average_distance_km": avg_dist,
                "pooled_inventory": pooled_inv,
                "transport": transport_rec,
                "supplier_evaluation": supplier_eval,
                "created_at": now_iso
            }
            created_pools.append(pool_data)

            # 5. Create Supplier Order record linked to this pool
            tier_calc = supplier_service.calculate_tiered_price(product, total_dem)
            s_order_id = f"sord_{pool_counter:03d}"
            order_no = f"SORD-2026-{8000 + pool_counter}"

            supplier_order = {
                "id": s_order_id,
                "order_no": order_no,
                "supplier_id": selected_sup_id,
                "pool_id": pool_id,
                "product_id": prod_id,
                "product_name": product.get("name", "Product"),
                "category": product.get("category", "General"),
                "retailer_count": num_retailers,
                "pooled_quantity": total_dem,
                "unit": product.get("unit_of_measure", "units"),
                "unit_weight_kg": float(product.get("unit_weight_kg", 1.0) or 1.0),
                "total_weight_kg": float(pooled_inv.get("total_weight_kg", total_dem)),
                "supplier_moq": effective_moq,
                "moq_status": "SATISFIED" if is_met else "DEFICIT",
                "base_wholesale_price": tier_calc["base_price"],
                "quantity_tier_price": tier_calc["quantity_tier_price"],
                "discount_pct": tier_calc["discount_pct"],
                "additional_discount": tier_calc["additional_discount"],
                "final_unit_price": tier_calc["final_unit_price"],
                "gross_order_value": tier_calc["gross_order_value"],
                "discount_amount": tier_calc["discount_amount"],
                "final_order_value": tier_calc["final_order_value"],
                "moq_at_acceptance": None,
                "price_at_acceptance": None,
                "accepted_at": None,
                "delivery_cluster": f"Hyderabad Cluster #{pool_counter}",
                "delivery_distance_km": avg_dist,
                "estimated_delivery_time_days": int(product.get("lead_time_days", 2)),
                "transport_info": transport_rec,
                "status": "PENDING",
                "rejection_reason": None,
                "timeline": [
                    {
                        "status": "PENDING",
                        "timestamp": now_iso,
                        "description": f"Pooled order formed by Samooh AI with {num_retailers} Kirana stores.",
                        "actor": "SAMOOH_PROCUREMENT_ENGINE"
                    }
                ],
                "created_at": now_iso,
                "updated_at": now_iso
            }
            created_supplier_orders.append(supplier_order)

        # Save pools and supplier orders to database
        repo.save_bulk("procurementPools", created_pools)
        repo.save_bulk("supplierOrders", created_supplier_orders)
        logger.info(f"Created {len(created_pools)} pools and {len(created_supplier_orders)} supplier orders.")
        return created_pools


procurement_engine = ProcurementEngine()
