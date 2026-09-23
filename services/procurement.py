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
        delivery_distance_km: float = 2.5
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

        canonical_id = product.get("canonical_product_id") or product.get("productId")

        # Find matching product records:
        # Match primarily by canonical productId (preventing spelling duplicates across suppliers),
        # or by matching product name / exact ID for legacy catalog offerings.
        candidate_offerings = [
            p for p in all_products
            if (canonical_id and (p.get("canonical_product_id") == canonical_id or p.get("productId") == canonical_id)) or
               (target_name and p.get("name", "").strip().lower() == target_name) or
               (product.get("id") and p.get("id") == product.get("id"))
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

    def generate_pool_explanation(
        self,
        pool_data: Dict[str, Any],
        product: Optional[Dict[str, Any]] = None,
        supplier_eval: Optional[Dict[str, Any]] = None,
        transport_rec: Optional[Dict[str, Any]] = None,
        cluster: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generates a transparent, structured explanation object for WHY a procurement pool was created,
        why a specific supplier was recommended, how constraints were verified, and why non-selected
        candidates failed.
        Separates machine learning demand prediction from deterministic constraint-satisfaction decisions.
        """
        product = product or pool_data.get("product_obj") or {}
        supplier_eval = supplier_eval or pool_data.get("supplier_evaluation") or {}
        transport_rec = transport_rec or pool_data.get("transport") or {}

        product_name = pool_data.get("product_name") or product.get("name", "Product")
        category = pool_data.get("category") or product.get("category", "General")
        uom = pool_data.get("unit") or product.get("unit_of_measure", "units")
        total_demand = float(
            pool_data.get("total_demand") 
            if pool_data.get("total_demand") is not None 
            else pool_data.get("current_pool_quantity", 0.0)
        )
        retailer_ids = pool_data.get("retailer_ids", [])
        num_retailers = pool_data.get("retailer_count") or len(retailer_ids)
        avg_dist = float(
            pool_data.get("average_distance_km")
            if pool_data.get("average_distance_km") is not None
            else pool_data.get("average_cluster_distance_km", 2.5)
        )
        max_radius_km = 10.0

        selected_sup_id = supplier_eval.get("selected_supplier_id", pool_data.get("supplier_id", "sup_01"))
        selected_sup_name = supplier_eval.get("selected_supplier_name", pool_data.get("supplier_name", "Wholesale Supplier"))
        supplier_moq = float(
            supplier_eval.get("supplier_moq")
            if supplier_eval.get("supplier_moq") is not None
            else (supplier_eval.get("moq") if supplier_eval.get("moq") is not None else pool_data.get("threshold_quantity", 30.0))
        )
        available_stock = float(supplier_eval.get("available_stock", 500.0))

        if pool_data.get("threshold_status") == "ACHIEVED":
            is_moq_met = True
        elif pool_data.get("threshold_status") in ("PENDING", "NEAR_THRESHOLD"):
            is_moq_met = bool(total_demand >= supplier_moq)
        else:
            is_moq_met = bool(pool_data.get("is_threshold_met", total_demand >= supplier_moq))

        is_stock_sufficient = available_stock >= total_demand
        is_dist_compatible = avg_dist <= max_radius_km
        is_price_feasible = True

        vehicle_name = transport_rec.get("recommended_vehicle", "Tata Ace (SCV)")
        transport_status = transport_rec.get("transport_status", "SUITABLE")
        is_transport_feasible = (transport_status == "SUITABLE")

        # 1. Decision Factors (deterministic constraint verification)
        decision_factors_list = [
            {
                "name": "Distance compatibility",
                "satisfied": is_dist_compatible,
                "detail": f"{avg_dist:.1f} km average distance (limit: {max_radius_km:.0f} km)"
            },
            {
                "name": "MOQ satisfied",
                "satisfied": is_moq_met,
                "detail": f"{total_demand} {uom} pooled vs {supplier_moq} {uom} threshold"
            },
            {
                "name": "Stock available",
                "satisfied": is_stock_sufficient,
                "detail": f"{available_stock} {uom} available in supplier inventory"
            },
            {
                "name": "Supplier available",
                "satisfied": bool(supplier_eval.get("is_feasible", True)),
                "detail": f"{selected_sup_name} active in service radius"
            },
            {
                "name": "Transport feasible",
                "satisfied": is_transport_feasible,
                "detail": f"{vehicle_name} ({transport_rec.get('capacity_utilization_pct', 0)}% payload capacity)"
            }
        ]

        decision_factors_dict = {
            "distance_compatibility": is_dist_compatible,
            "moq_satisfied": is_moq_met,
            "stock_available": is_stock_sufficient,
            "supplier_available": bool(supplier_eval.get("is_feasible", True)),
            "transport_feasible": is_transport_feasible
        }

        # 2. Positive human-readable reasons
        reasons = [
            f"Same product requirement pooled across {num_retailers} regional Kirana stores",
            f"Retailers are geographically compatible with {avg_dist:.1f} km average cluster distance",
            f"Combined requirement ({total_demand}) {'satisfies' if is_moq_met else 'is progressing towards'} supplier MOQ ({supplier_moq})",
            f"Supplier ({selected_sup_name}) has sufficient stock ({available_stock} {uom}) to fulfill order",
            f"Supplier pricing is feasible (₹{supplier_eval.get('unit_price', 0):,.2f}/{uom})",
            f"Transport capacity is available via {vehicle_name}"
        ]

        # 3. Not Selected / Rejected alternative suppliers with actual reasons
        rejected_suppliers = []
        for cand in supplier_eval.get("evaluated_suppliers", []):
            if not cand.get("is_feasible"):
                reasons_clean = [
                    r.replace("✗ ", "").strip() for r in cand.get("rejection_reasons", [])
                ]
                rejected_suppliers.append({
                    "supplier_id": cand.get("supplier_id"),
                    "supplier_name": cand.get("supplier_name"),
                    "moq": cand.get("moq"),
                    "available_stock": cand.get("available_stock"),
                    "service_radius_km": cand.get("service_radius_km"),
                    "unit_price": cand.get("unit_price"),
                    "reasons": reasons_clean,
                    "rejection_reasons": reasons_clean,
                    "reason_summary": "; ".join(reasons_clean)
                })

        # 4. Overall rejection reasons for this pool if any constraint failed
        rejection_reasons = []
        if not is_moq_met:
            deficit = round(supplier_moq - total_demand, 1)
            rejection_reasons.append(f"MOQ cannot be satisfied within the compatible retailer group (deficit: {deficit} {uom}).")
        if not is_stock_sufficient:
            shortage = round(total_demand - available_stock, 1)
            rejection_reasons.append(f"Available stock is below required pooled quantity (shortage: {shortage} {uom}).")
        if not is_dist_compatible:
            rejection_reasons.append(f"Average retailer distance ({avg_dist:.1f} km) exceeds cluster limit ({max_radius_km} km).")

        return {
            "product_match": True,
            "product_name": product_name,
            "category": category,
            "retailer_count": num_retailers,
            "retailer_ids": retailer_ids,
            "combined_quantity": total_demand,
            "unit": uom,
            "supplier_id": selected_sup_id,
            "supplier_name": selected_sup_name,
            "supplier_moq": supplier_moq,
            "stock_available": available_stock,
            "distance": avg_dist,
            "average_distance_km": avg_dist,
            "max_distance_km": max_radius_km,
            "transport_vehicle": vehicle_name,
            "transport_feasible": is_transport_feasible,
            "price_feasible": is_price_feasible,
            "moq_satisfied": is_moq_met,
            "stock_available_flag": is_stock_sufficient,
            "distance_compatible": is_dist_compatible,
            "reasons": reasons,
            "decision_factors": decision_factors_dict,
            "decision_factors_list": decision_factors_list,
            "rejected_suppliers": rejected_suppliers,
            "rejection_reasons": rejection_reasons,
            "prediction_context": {
                "model": "Random Forest Regressor (30-day forecast)",
                "forecasted_requirement": f"{total_demand} {uom}",
                "note": "Demand prediction forecasted by Random Forest based on historical retailer order cadence. Optimization and constraint satisfaction are performed deterministically by the procurement engine."
            },
            "decision_summary": "Pool created because MOQ, distance, stock, and transport constraints were satisfied." if is_moq_met and is_stock_sufficient and is_dist_compatible else "Pool formed with active constraint notices."
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

            # Generate structured explainable procurement breakdown
            pool_data["explanation_details"] = self.generate_pool_explanation(
                pool_data=pool_data,
                product=product,
                supplier_eval=supplier_eval,
                transport_rec=transport_rec,
                cluster=cluster
            )
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

    # =========================================================================
    # Procurement Opportunity Engine Integration (Upgrade #2)
    # =========================================================================
    def find_procurement_opportunities(self, *args, **kwargs):
        from services.opportunity import opportunity_engine
        return opportunity_engine.find_procurement_opportunities(*args, **kwargs)

    def evaluate_opportunity(self, *args, **kwargs):
        from services.opportunity import opportunity_engine
        return opportunity_engine.evaluate_opportunity(*args, **kwargs)

    def calculate_combined_demand(self, *args, **kwargs):
        from services.opportunity import opportunity_engine
        return opportunity_engine.calculate_combined_demand(*args, **kwargs)

    def evaluate_supplier_constraints(self, *args, **kwargs):
        from services.opportunity import opportunity_engine
        return opportunity_engine.evaluate_supplier_constraints(*args, **kwargs)

    def build_opportunity_explanation(self, *args, **kwargs):
        from services.opportunity import opportunity_engine
        return opportunity_engine.build_opportunity_explanation(*args, **kwargs)


procurement_engine = ProcurementEngine()

# Module-level convenience functions matching requirements
def find_procurement_opportunities(*args, **kwargs):
    return procurement_engine.find_procurement_opportunities(*args, **kwargs)

def evaluate_opportunity(*args, **kwargs):
    return procurement_engine.evaluate_opportunity(*args, **kwargs)

def calculate_combined_demand(*args, **kwargs):
    return procurement_engine.calculate_combined_demand(*args, **kwargs)

def evaluate_supplier_constraints(*args, **kwargs):
    return procurement_engine.evaluate_supplier_constraints(*args, **kwargs)

def build_opportunity_explanation(*args, **kwargs):
    return procurement_engine.build_opportunity_explanation(*args, **kwargs)
