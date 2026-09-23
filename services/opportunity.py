import hashlib
import datetime
import logging
from typing import List, Dict, Any, Optional, Tuple

from backend.database.repository import repo
from ai.matching import haversine_distance
from services.supplier import supplier_service

logger = logging.getLogger("samooh.services.opportunity")


class ProcurementOpportunityEngine:
    """
    Procurement Opportunity Engine (Upgrade #2).
    
    Continuously identifies, evaluates, and scores real group buying opportunities
    from existing retailer demand signals and wholesale supplier offerings.
    
    Deterministic rule & constraint satisfaction engine (strictly decoupled from ML forecasts).
    """

    def __init__(self, max_cluster_radius_km: float = 10.0):
        self.max_cluster_radius_km = max_cluster_radius_km

    def calculate_combined_demand(
        self,
        product: Dict[str, Any],
        retailers: List[Dict[str, Any]],
        forecasts: Optional[List[Dict[str, Any]]] = None
    ) -> Tuple[Dict[str, float], str, bool]:
        """
        Extracts actual demand requirements from existing retailer profile needs and forecasts.
        Returns:
            - retailer_demands: Dict[retailer_id, demand_qty]
            - primary_unit: str
            - is_unit_valid: bool (False if incompatible units are mixed)
        """
        prod_id = product.get("id")
        canonical_id = product.get("canonical_product_id") or product.get("productId")
        target_name = product.get("name", "").strip().lower()
        default_unit = product.get("unit_of_measure") or product.get("unit") or "units"

        forecasts = forecasts or repo.get_all("forecasts")
        forecast_map = {}
        for f in forecasts:
            if f.get("product_id") == prod_id and f.get("predicted_demand", 0) > 0:
                forecast_map[f.get("retailer_id")] = float(f.get("predicted_demand"))

        retailer_demands: Dict[str, float] = {}
        detected_units = set()

        for ret in retailers:
            ret_id = ret.get("id")
            if not ret_id:
                continue

            # 1. Check retailer procurement profile (onboarding or custom demand)
            needed_list = (
                ret.get("procurement_profile", {}).get("products_needed")
                or ret.get("productsNeeded")
                or []
            )
            
            matched_entry = None
            for entry in needed_list:
                entry_pid = entry.get("productId") or entry.get("canonical_product_id") or entry.get("id")
                entry_name = (entry.get("name") or entry.get("product_name") or "").strip().lower()
                
                # Check canonical match first, then legacy name
                if canonical_id and (entry_pid == canonical_id or entry.get("canonical_product_id") == canonical_id):
                    matched_entry = entry
                    break
                elif entry_pid == prod_id or (target_name and entry_name == target_name):
                    matched_entry = entry
                    break

            if matched_entry:
                qty = matched_entry.get("typical_quantity") or matched_entry.get("typicalQuantity") or matched_entry.get("quantity")
                unit = matched_entry.get("unit") or default_unit
                if qty is not None:
                    try:
                        numeric_qty = float(qty)
                        if numeric_qty > 0:
                            retailer_demands[ret_id] = numeric_qty
                            detected_units.add(unit.lower())
                            continue
                    except (ValueError, TypeError):
                        pass

            # 2. Fall back to 30-day forecasted demand if available
            if ret_id in forecast_map:
                retailer_demands[ret_id] = forecast_map[ret_id]
                detected_units.add(default_unit.lower())

        # Check unit consistency
        is_unit_valid = True
        if len(detected_units) > 1:
            # If units are conflicting and non-convertible (e.g. kg vs litres vs units)
            is_unit_valid = False

        primary_unit = list(detected_units)[0] if detected_units else default_unit
        return retailer_demands, primary_unit, is_unit_valid

    def calculate_cluster_distance(
        self,
        retailer_ids: List[str],
        retailer_map: Dict[str, Dict[str, Any]]
    ) -> Tuple[Optional[float], str]:
        """
        Calculates average spatial distance between retailers using existing coordinates.
        Returns:
            - avg_distance_km: float or None
            - geo_feasibility: "COMPATIBLE", "LOCATION_REQUIRED", or "EXCEEDS_RADIUS"
        """
        valid_coords = []
        for rid in retailer_ids:
            ret = retailer_map.get(rid, {})
            lat = ret.get("latitude") or ret.get("businessLocation", {}).get("latitude")
            lon = ret.get("longitude") or ret.get("businessLocation", {}).get("longitude")
            if lat is not None and lon is not None:
                try:
                    valid_coords.append((float(lat), float(lon)))
                except (ValueError, TypeError):
                    pass

        # If any retailer lacks location, mark LOCATION_REQUIRED
        if len(valid_coords) < len(retailer_ids):
            return None, "LOCATION_REQUIRED"

        if len(valid_coords) <= 1:
            return 1.5, "COMPATIBLE"

        # Calculate average pairwise Haversine distance
        distances = []
        for i in range(len(valid_coords)):
            for j in range(i + 1, len(valid_coords)):
                d = haversine_distance(
                    valid_coords[i][0], valid_coords[i][1],
                    valid_coords[j][0], valid_coords[j][1]
                )
                distances.append(d)

        avg_dist = round(sum(distances) / max(1, len(distances)), 2)
        if avg_dist > self.max_cluster_radius_km:
            return avg_dist, "EXCEEDS_RADIUS"

        return avg_dist, "COMPATIBLE"

    def match_candidate_suppliers(
        self,
        product: Dict[str, Any],
        all_products: List[Dict[str, Any]],
        all_suppliers: Dict[str, Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """
        Identifies active suppliers offering this canonical product.
        Prioritizes canonical product ID, preserves exact-name legacy matching.
        Strictly prevents cross-product bleeding (e.g. basmati != sona masuri).
        """
        canonical_id = product.get("canonical_product_id") or product.get("productId")
        target_name = product.get("name", "").strip().lower()
        prod_id = product.get("id")

        matched_offerings = []
        for p in all_products:
            p_canon = p.get("canonical_product_id") or p.get("productId")
            p_name = p.get("name", "").strip().lower()
            p_id = p.get("id")

            # 1. Canonical Match (Highest priority)
            if canonical_id and p_canon and canonical_id == p_canon:
                matched_offerings.append(p)
            # 2. Legacy Exact ID Match
            elif prod_id and p_id == prod_id:
                matched_offerings.append(p)
            # 3. Legacy Exact Name Match (Only if canonical ID is not set on either)
            elif not canonical_id and not p_canon and target_name and p_name == target_name:
                matched_offerings.append(p)

        return matched_offerings

    def calculate_opportunity_score(
        self,
        combined_quantity: float,
        supplier_moq: float,
        supplier_stock: float,
        retailer_count: int,
        distance_km: Optional[float],
        estimated_unit_price: Optional[float],
        status: str
    ) -> Tuple[float, str]:
        """
        Calculates a deterministic opportunity score (0.0 to 100.0) based on
        concrete operational metrics.
        Formula documented explicitly:
        - MOQ Satisfaction (40 pts): min(1.0, combined_quantity / MOQ) * 40
        - Stock Coverage (25 pts): min(1.0, supplier_stock / max(1.0, combined_quantity)) * 25
        - Retailer Density (15 pts): min(1.0, retailer_count / 4.0) * 15
        - Geographic Proximity (10 pts): max(0.0, 1.0 - (distance / max_radius)) * 10
        - Pricing Feasibility (10 pts): 10 pts if valid wholesale unit price exists
        """
        moq_ratio = min(1.0, combined_quantity / max(1.0, supplier_moq))
        moq_score = moq_ratio * 40.0

        stock_ratio = min(1.0, supplier_stock / max(1.0, combined_quantity)) if supplier_stock > 0 else 0.0
        stock_score = stock_ratio * 25.0

        density_score = min(1.0, retailer_count / 4.0) * 15.0

        if distance_km is not None:
            dist_factor = max(0.0, 1.0 - (distance_km / self.max_cluster_radius_km))
            dist_score = dist_factor * 10.0
        else:
            dist_score = 5.0  # neutral if location pending

        price_score = 10.0 if (estimated_unit_price and estimated_unit_price > 0) else 0.0

        total_score = round(moq_score + stock_score + density_score + dist_score + price_score, 1)

        # Descriptive label based on status
        if status == "FEASIBLE":
            label = "Feasible"
        elif status == "BELOW_MOQ":
            shortfall = round(max(0.0, supplier_moq - combined_quantity), 1)
            label = f"Needs {shortfall:g} more demand"
        elif status == "INSUFFICIENT_STOCK":
            label = "Limited by supplier stock"
        elif status == "ALREADY_IN_POOL":
            label = "Committed to active pool"
        elif status == "LOCATION_REQUIRED":
            label = "Location required"
        elif status == "NO_SUPPLIER":
            label = "No active supplier"
        else:
            label = "Pending verification"

        return total_score, label

    def build_opportunity_explanation(
        self,
        product_name: str,
        retailer_count: int,
        combined_quantity: float,
        unit: str,
        supplier_name: Optional[str],
        supplier_moq: Optional[float],
        supplier_stock: Optional[float],
        moq_shortfall: float,
        distance_km: Optional[float],
        status: str,
        is_already_in_pool: bool,
        existing_pool_id: Optional[str]
    ) -> Tuple[List[str], List[str]]:
        """
        Generates structured, explainable reasons and constraint summaries from real values.
        """
        reasons = []
        constraints = []

        # Retailer demand reason
        reasons.append(f"{retailer_count} retailers require the same product ({product_name})")
        reasons.append(f"Combined demand is {combined_quantity:g} {unit}")

        if supplier_name and supplier_moq is not None:
            if combined_quantity >= supplier_moq:
                reasons.append(f"Combined demand ({combined_quantity:g} {unit}) satisfies supplier MOQ ({supplier_moq:g} {unit})")
            else:
                reasons.append(f"Combined demand is below supplier MOQ ({combined_quantity:g} < {supplier_moq:g} {unit})")
                constraints.append(f"Needs {moq_shortfall:g} {unit} additional compatible demand")

            constraints.append(f"Supplier MOQ: {supplier_moq:g} {unit}")

        if supplier_name and supplier_stock is not None:
            if supplier_stock >= combined_quantity:
                reasons.append(f"Supplier ({supplier_name}) has sufficient stock ({supplier_stock:g} {unit}) available")
            else:
                shortage = round(combined_quantity - supplier_stock, 1)
                reasons.append(f"Supplier stock is below pooled requirement ({supplier_stock:g} < {combined_quantity:g} {unit})")
                constraints.append(f"Inventory shortage of {shortage:g} {unit}")

            constraints.append(f"Available Supplier Stock: {supplier_stock:g} {unit}")

        if distance_km is not None:
            reasons.append(f"Retailers are geographically compatible with {distance_km:.1f} km average cluster distance")
            constraints.append(f"Average Cluster Distance: {distance_km:.1f} km (Max Radius: {self.max_cluster_radius_km:.1f} km)")
        else:
            constraints.append("Retailer or supplier geographic coordinates missing (Location Required)")

        if is_already_in_pool:
            reasons.append(f"Demand is already committed to active procurement pool {existing_pool_id}")
            constraints.append(f"Locked in Pool: {existing_pool_id}")

        return reasons, constraints

    def evaluate_opportunity(
        self,
        product: Dict[str, Any],
        retailer_ids: List[str],
        retailer_demands: Dict[str, float],
        unit: str,
        supplier_offering: Optional[Dict[str, Any]],
        supplier_obj: Optional[Dict[str, Any]],
        retailer_map: Dict[str, Dict[str, Any]],
        existing_pools: List[Dict[str, Any]],
        is_unit_valid: bool = True
    ) -> Dict[str, Any]:
        """
        Evaluates a candidate retailer group against a supplier offering for a product.
        Outputs a fully populated ProcurementOpportunity dictionary.
        """
        prod_id = product.get("id", "prod_unknown")
        canonical_id = product.get("canonical_product_id") or product.get("productId")
        prod_name = product.get("name") or "Standard Product"
        sector_id = product.get("sectorId") or product.get("sector_id") or "grocery"
        category = product.get("category") or product.get("groupName") or "General"

        combined_quantity = sum(retailer_demands.values())
        retailer_count = len(retailer_ids)
        retailer_names = [retailer_map.get(rid, {}).get("name", f"Store {rid}") for rid in retailer_ids]

        # 1. Geographic distance check
        distance_km, geo_feasibility = self.calculate_cluster_distance(retailer_ids, retailer_map)

        # 2. Check if demand is already locked in an active procurement pool
        is_already_in_pool = False
        existing_pool_id = None
        for pool in existing_pools:
            pool_prod_id = pool.get("product_id")
            pool_retailer_ids = set(pool.get("retailer_ids", []))
            
            # If same product and significant retailer overlap
            if pool_prod_id == prod_id or (canonical_id and pool.get("canonical_product_id") == canonical_id):
                overlap = pool_retailer_ids.intersection(set(retailer_ids))
                if len(overlap) >= min(2, len(retailer_ids)):
                    is_already_in_pool = True
                    existing_pool_id = pool.get("id")
                    break

        # 3. Supplier feasibility and constraints
        supplier_id = None
        supplier_name = None
        supplier_stock = 0.0
        supplier_moq = 0.0
        moq_shortfall = 0.0
        unit_price = None
        total_value = None

        if not is_unit_valid or combined_quantity <= 0:
            status = "INVALID_DATA"
        elif not supplier_offering:
            status = "NO_SUPPLIER"
        elif is_already_in_pool:
            status = "ALREADY_IN_POOL"
        else:
            supplier_id = supplier_offering.get("supplier_id") or supplier_offering.get("supplierId")
            supplier_name = supplier_offering.get("supplier_name") or (supplier_obj.get("name") if supplier_obj else f"Supplier {supplier_id}")
            supplier_stock = float(supplier_offering.get("available_quantity", 0.0))
            supplier_moq = float(supplier_offering.get("min_wholesale_quantity", 0.0))

            # Tiered price calculation
            tier_calc = supplier_service.calculate_tiered_price(supplier_offering, combined_quantity)
            unit_price = tier_calc["final_unit_price"]
            total_value = tier_calc["final_order_value"]

            # Feasibility decision matrix
            if combined_quantity < supplier_moq:
                status = "BELOW_MOQ"
                moq_shortfall = round(supplier_moq - combined_quantity, 1)
            elif supplier_stock < combined_quantity:
                status = "INSUFFICIENT_STOCK"
            elif geo_feasibility == "LOCATION_REQUIRED":
                status = "LOCATION_REQUIRED"
            elif geo_feasibility == "EXCEEDS_RADIUS":
                status = "BELOW_MOQ"  # Infeasible due to spatial fragmentation
            else:
                status = "FEASIBLE"

        # 4. Score and Explainability
        score, score_label = self.calculate_opportunity_score(
            combined_quantity=combined_quantity,
            supplier_moq=supplier_moq,
            supplier_stock=supplier_stock,
            retailer_count=retailer_count,
            distance_km=distance_km,
            estimated_unit_price=unit_price,
            status=status
        )

        reasons, constraints = self.build_opportunity_explanation(
            product_name=prod_name,
            retailer_count=retailer_count,
            combined_quantity=combined_quantity,
            unit=unit,
            supplier_name=supplier_name,
            supplier_moq=supplier_moq if supplier_offering else None,
            supplier_stock=supplier_stock if supplier_offering else None,
            moq_shortfall=moq_shortfall,
            distance_km=distance_km,
            status=status,
            is_already_in_pool=is_already_in_pool,
            existing_pool_id=existing_pool_id
        )

        # 5. Deterministic Opportunity Deduplication Key
        sorted_ret_ids = sorted(retailer_ids)
        dedup_raw = f"{canonical_id or prod_id}:{supplier_id or 'none'}:{':'.join(sorted_ret_ids)}"
        opp_hash = hashlib.sha256(dedup_raw.encode("utf-8")).hexdigest()[:10]
        opportunity_id = f"opp_{opp_hash}"

        now_iso = datetime.datetime.utcnow().isoformat() + "Z"

        opportunity_data = {
            "opportunityId": opportunity_id,
            "id": opportunity_id,
            "productId": prod_id,
            "canonicalProductId": canonical_id,
            "productName": prod_name,
            "sectorId": sector_id,
            "category": category,
            "retailerIds": retailer_ids,
            "retailerCount": retailer_count,
            "retailerDemands": retailer_demands,
            "retailerNames": retailer_names,
            "supplierId": supplier_id,
            "supplierName": supplier_name,
            "combinedQuantity": combined_quantity,
            "unit": unit,
            "supplierAvailableQuantity": supplier_stock if supplier_offering else None,
            "supplierMOQ": supplier_moq if supplier_offering else None,
            "moqShortfall": moq_shortfall,
            "estimatedUnitPrice": unit_price,
            "estimatedTotalValue": total_value,
            "geographicDistanceKm": distance_km,
            "geographicFeasibility": geo_feasibility,
            "feasibility": status,
            "status": status,
            "opportunityScore": score,
            "scoreLabel": score_label,
            "reasons": reasons,
            "constraints": constraints,
            "isAlreadyInPool": is_already_in_pool,
            "existingPoolId": existing_pool_id,
            "isDemo": False,
            "createdAt": now_iso,
            "updatedAt": now_iso
        }

        return opportunity_data

    def find_procurement_opportunities(
        self,
        sector_id: Optional[str] = None,
        canonical_product_id: Optional[str] = None,
        supplier_id: Optional[str] = None,
        retailer_id: Optional[str] = None,
        status: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Continuously scans the repository to identify and evaluate real procurement opportunities.
        """
        all_products = repo.get_all("products")
        all_retailers = repo.get_all("retailers")
        all_suppliers = {s['id']: s for s in repo.get_all("suppliers")}
        all_forecasts = repo.get_all("forecasts")
        existing_pools = repo.get_all("procurementPools")
        retailer_map = {r['id']: r for r in all_retailers}

        # Deduplicate products by canonical ID or ID to form evaluation batches
        eval_products = []
        seen_pids = set()
        for p in all_products:
            key = p.get("canonical_product_id") or p.get("productId") or p.get("id")
            if key and key not in seen_pids:
                seen_pids.add(key)
                eval_products.append(p)

        opportunities: List[Dict[str, Any]] = []

        for product in eval_products:
            p_sector = product.get("sectorId") or product.get("sector_id") or "grocery"
            p_canon = product.get("canonical_product_id") or product.get("productId")

            # Apply sector and canonical product filters
            if sector_id and p_sector.lower() != sector_id.lower():
                continue
            if canonical_product_id and p_canon != canonical_product_id:
                continue

            # Extract actual retailer demands for this product
            retailer_demands, unit, is_unit_valid = self.calculate_combined_demand(
                product=product,
                retailers=all_retailers,
                forecasts=all_forecasts
            )

            # If filtered by specific retailer, verify participation
            if retailer_id and retailer_id not in retailer_demands:
                continue

            # If no demanding retailers exist, skip
            if not retailer_demands:
                continue

            demanding_retailers = list(retailer_demands.keys())

            # Find candidate supplier offerings
            candidate_offerings = self.match_candidate_suppliers(
                product=product,
                all_products=all_products,
                all_suppliers=all_suppliers
            )

            if not candidate_offerings:
                # Evaluate as NO_SUPPLIER opportunity
                opp = self.evaluate_opportunity(
                    product=product,
                    retailer_ids=demanding_retailers,
                    retailer_demands=retailer_demands,
                    unit=unit,
                    supplier_offering=None,
                    supplier_obj=None,
                    retailer_map=retailer_map,
                    existing_pools=existing_pools,
                    is_unit_valid=is_unit_valid
                )
                opportunities.append(opp)
            else:
                for offering in candidate_offerings:
                    cand_sup_id = offering.get("supplier_id") or offering.get("supplierId")
                    if supplier_id and cand_sup_id != supplier_id:
                        continue

                    cand_sup_obj = all_suppliers.get(cand_sup_id)
                    opp = self.evaluate_opportunity(
                        product=product,
                        retailer_ids=demanding_retailers,
                        retailer_demands=retailer_demands,
                        unit=unit,
                        supplier_offering=offering,
                        supplier_obj=cand_sup_obj,
                        retailer_map=retailer_map,
                        existing_pools=existing_pools,
                        is_unit_valid=is_unit_valid
                    )
                    opportunities.append(opp)

        # Apply status filter
        if status and status.upper() != "ALL":
            opportunities = [o for o in opportunities if o.get("status", "").upper() == status.upper()]

        # Sort opportunities deterministically:
        # Highest opportunityScore first, then lowest shortfall
        opportunities.sort(
            key=lambda x: (
                0 if x.get("status") == "FEASIBLE" else 1 if x.get("status") == "BELOW_MOQ" else 2,
                -x.get("opportunityScore", 0.0),
                x.get("moqShortfall", 0.0)
            )
        )

        # Persist evaluated opportunities into repository collection
        repo.save_bulk("procurementOpportunities", opportunities, id_key="opportunityId")
        return opportunities


# Singleton instance
opportunity_engine = ProcurementOpportunityEngine()

# Module-level convenience functions matching requirements
def find_procurement_opportunities(*args, **kwargs):
    return opportunity_engine.find_procurement_opportunities(*args, **kwargs)

def evaluate_opportunity(*args, **kwargs):
    return opportunity_engine.evaluate_opportunity(*args, **kwargs)

def calculate_combined_demand(*args, **kwargs):
    return opportunity_engine.calculate_combined_demand(*args, **kwargs)

def evaluate_supplier_constraints(*args, **kwargs):
    return opportunity_engine.evaluate_opportunity(*args, **kwargs)

def build_opportunity_explanation(*args, **kwargs):
    return opportunity_engine.build_opportunity_explanation(*args, **kwargs)
