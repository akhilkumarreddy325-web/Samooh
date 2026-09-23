"""
Retailer Compatibility Engine (Prompt 3 - Samooh SIH).

Determines: "Why should Retailer A be considered compatible with Retailer B for joint procurement pooling?"
Evaluates real, available data deterministically:
  - Canonical product catalog matching
  - Geographic distance (Haversine) within configurable radius
  - Demand quantity synergy
  - Restock timing alignment (or UNKNOWN if not specified)
  - Business sector synergy (allows cross-sector for shared products)
  - Demo data isolation
  - Transparent explainability (reasons, constraints, exclusions)

Conceptually sits upstream of the Procurement Opportunity Engine:
Retailer Data -> Retailer Compatibility Engine -> Compatible Retailer Groups -> Opportunity Engine -> Supplier Feasibility -> Procurement Plan
"""

import datetime
from typing import List, Dict, Any, Optional, Tuple, Set

from backend.config import settings
from backend.database.repository import repo
from ai.matching import haversine_distance
from models.compatibility import RetailerCompatibilityResult, CompatibleProductDemand


class RetailerCompatibilityEngine:
    """
    Deterministic, explainable compatibility evaluation engine between retailers.
    Strictly decoupled from supplier feasibility and MOQ logic (handled downstream).
    """

    def __init__(self, max_radius_km: Optional[float] = None):
        self.max_radius_km = max_radius_km or getattr(settings, "MAX_MATCHING_RADIUS_KM", 10.0)

    # ------------------------------------------------------------------
    # Data extraction helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _extract_retailer_coords(retailer: Dict[str, Any]) -> Tuple[Optional[float], Optional[float]]:
        """Extracts latitude and longitude from various retailer schemas."""
        loc = retailer.get("location") or {}
        lat = (
            loc.get("latitude")
            or loc.get("lat")
            or retailer.get("latitude")
            or retailer.get("lat")
        )
        lng = (
            loc.get("longitude")
            or loc.get("lng")
            or retailer.get("longitude")
            or retailer.get("lng")
        )
        try:
            if lat is not None and lng is not None:
                return float(lat), float(lng)
        except (ValueError, TypeError):
            pass
        return None, None

    @staticmethod
    def _extract_product_needs(retailer: Dict[str, Any]) -> Dict[str, Dict[str, Any]]:
        """
        Extracts standardized product needs map: canonical_id -> {name, qty, unit, raw_entry}.
        Prefers canonical_product_id or productId.
        """
        needs_list = (
            retailer.get("procurement_profile", {}).get("products_needed")
            or retailer.get("productsNeeded")
            or retailer.get("products")
            or []
        )
        
        needs_map = {}
        for entry in needs_list:
            if not isinstance(entry, dict):
                continue
            
            pid = (
                entry.get("canonical_product_id")
                or entry.get("productId")
                or entry.get("id")
            )
            name = (
                entry.get("product_name")
                or entry.get("name")
                or entry.get("title")
                or pid
                or "Unknown Product"
            )
            qty = (
                entry.get("typical_quantity")
                or entry.get("typicalQuantity")
                or entry.get("quantity")
                or entry.get("amount")
                or 0.0
            )
            unit = entry.get("unit") or entry.get("unit_of_measure") or "units"

            try:
                qty_val = float(qty) if qty else 0.0
            except (ValueError, TypeError):
                qty_val = 0.0

            key = str(pid).strip() if pid else str(name).strip().lower()
            needs_map[key] = {
                "productId": str(pid) if pid else key,
                "canonicalProductId": str(pid) if pid else None,
                "productName": name,
                "quantity": qty_val,
                "unit": unit,
                "timing": (
                    entry.get("procurement_window")
                    or entry.get("required_date")
                    or entry.get("target_date")
                    or entry.get("restock_frequency")
                )
            }
        return needs_map

    @staticmethod
    def _extract_sector(retailer: Dict[str, Any]) -> Optional[str]:
        """Extracts standardized sector ID."""
        return (
            retailer.get("business_sector_id")
            or retailer.get("businessSectorId")
            or retailer.get("sector_id")
            or retailer.get("sectorId")
            or retailer.get("business_category")
            or retailer.get("businessType")
        )

    @staticmethod
    def _is_demo_retailer(retailer: Dict[str, Any]) -> bool:
        """Determines if the retailer record is sample/demo data."""
        return bool(
            retailer.get("isDemo") or
            retailer.get("is_demo") or
            str(retailer.get("id", "")).startswith("demo_")
        )

    # ------------------------------------------------------------------
    # Core Deterministic Evaluation for a Pair of Retailers
    # ------------------------------------------------------------------

    def evaluate_pair(
        self,
        retailer_a: Dict[str, Any],
        retailer_b: Dict[str, Any],
        max_radius_km: Optional[float] = None
    ) -> RetailerCompatibilityResult:
        """
        Evaluates deterministic compatibility between two retailers.
        Answers: 'Why should Retailer A be considered compatible with Retailer B?'
        """
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()
        ret_a_id = str(retailer_a.get("id", "retailer_a"))
        ret_b_id = str(retailer_b.get("id", "retailer_b"))
        comp_id = f"comp_{min(ret_a_id, ret_b_id)}_{max(ret_a_id, ret_b_id)}"
        
        radius_limit = max_radius_km or self.max_radius_km
        
        # 1. Demo isolation check
        is_demo_a = self._is_demo_retailer(retailer_a)
        is_demo_b = self._is_demo_retailer(retailer_b)
        is_pair_demo = is_demo_a or is_demo_b

        reasons: List[str] = []
        constraints: List[str] = []
        exclusions: List[str] = []

        # If mixing real and demo data, strictly reject
        if is_demo_a != is_demo_b:
            exclusions.append("Demo data isolation: Real and sample/demo retailers cannot be combined.")
            return RetailerCompatibilityResult(
                compatibilityId=comp_id,
                retailerAId=ret_a_id,
                retailerBId=ret_b_id,
                retailerAName=retailer_a.get("store_name") or retailer_a.get("name"),
                retailerBName=retailer_b.get("store_name") or retailer_b.get("name"),
                compatibilityStatus="NOT_COMPATIBLE",
                compatibilityScore=0.0,
                scoreLabel="Not Compatible",
                reasons=[],
                constraints=["Demo data isolation active."],
                exclusions=exclusions,
                calculatedAt=now_iso,
                isDemo=is_pair_demo
            )

        # 2. Canonical Product Matching
        needs_a = self._extract_product_needs(retailer_a)
        needs_b = self._extract_product_needs(retailer_b)

        shared_keys = set(needs_a.keys()).intersection(set(needs_b.keys()))
        a_only_keys = list(set(needs_a.keys()) - shared_keys)
        b_only_keys = list(set(needs_b.keys()) - shared_keys)

        compatible_products: List[CompatibleProductDemand] = []
        total_shared_demand = 0.0

        for key in shared_keys:
            item_a = needs_a[key]
            item_b = needs_b[key]
            combined_qty = item_a["quantity"] + item_b["quantity"]
            total_shared_demand += combined_qty
            
            compatible_products.append(
                CompatibleProductDemand(
                    productId=item_a["productId"],
                    canonicalProductId=item_a.get("canonicalProductId"),
                    productName=item_a["productName"],
                    unit=item_a.get("unit", "units"),
                    retailerAQuantity=item_a["quantity"],
                    retailerBQuantity=item_b["quantity"],
                    combinedQuantity=round(combined_qty, 2)
                )
            )

        if not compatible_products:
            exclusions.append("No shared standardized products in procurement needs.")
            product_match_score = 0.0
        else:
            # Ratio of shared products relative to combined unique product requirements
            total_unique = len(shared_keys) + len(a_only_keys) + len(b_only_keys)
            product_match_score = round((len(shared_keys) / max(total_unique, 1)) * 100.0, 1)
            shared_names = ", ".join([p.productName for p in compatible_products[:3]])
            if len(compatible_products) > 3:
                shared_names += f" and {len(compatible_products) - 3} more"
            reasons.append(f"Both retailers require standardized products: {shared_names}.")

        # 3. Geographic Compatibility (Haversine)
        lat_a, lng_a = self._extract_retailer_coords(retailer_a)
        lat_b, lng_b = self._extract_retailer_coords(retailer_b)
        
        distance_km: Optional[float] = None
        geo_status = "COMPATIBLE"
        distance_score = 0.0

        if lat_a is None or lng_a is None or lat_b is None or lng_b is None:
            geo_status = "LOCATION_REQUIRED"
            distance_score = 40.0  # Neutral fallback for unmapped locations
            constraints.append("Geographic distance unknown: Store coordinates missing for one or both retailers.")
        else:
            distance_km = haversine_distance(lat_a, lng_a, lat_b, lng_b)
            if distance_km <= radius_limit:
                geo_status = "COMPATIBLE"
                # Linear decay from 100 at 0km to 50 at max_radius
                distance_score = round(max(50.0, 100.0 - (50.0 * (distance_km / max(radius_limit, 1.0)))), 1)
                reasons.append(f"Stores are {distance_km} km apart, within the {radius_limit} km procurement radius.")
            else:
                geo_status = "EXCEEDS_RADIUS"
                distance_score = 0.0
                exclusions.append(f"Distance of {distance_km} km exceeds configured procurement radius of {radius_limit} km.")

        # 4. Quantity Compatibility
        quantity_score = 0.0
        if compatible_products:
            # Assess demand volume synergy
            # If both have non-zero demand, check quantity balance ratio
            ratios = []
            for cp in compatible_products:
                qa = cp.retailerAQuantity or 0.0
                qb = cp.retailerBQuantity or 0.0
                if qa > 0 and qb > 0:
                    ratio = min(qa, qb) / max(qa, qb)
                    ratios.append(ratio)
                elif (qa + qb) > 0:
                    ratios.append(0.5)
            
            avg_ratio = sum(ratios) / len(ratios) if ratios else 0.5
            # Score scaled 50 to 100 based on demand balance
            quantity_score = round(50.0 + (50.0 * avg_ratio), 1)
            reasons.append(f"Aggregated volume of {round(total_shared_demand, 1)} units provides combined buying leverage.")
        else:
            quantity_score = 0.0

        # 5. Restock Timing Compatibility
        # Inspect demand timing windows if present
        timing_status = "UNKNOWN"
        timing_score = 50.0  # Neutral default for missing timing data
        
        timing_a = [item.get("timing") for item in needs_a.values() if item.get("timing")]
        timing_b = [item.get("timing") for item in needs_b.values() if item.get("timing")]

        if not timing_a and not timing_b:
            timing_status = "UNKNOWN"
            timing_score = 50.0
            constraints.append("Insufficient timing data: Restock schedule alignment to be confirmed downstream.")
        else:
            # Check for overlapping windows or frequencies
            overlap = set(timing_a).intersection(set(timing_b))
            if overlap:
                timing_status = "COMPATIBLE"
                timing_score = 100.0
                reasons.append(f"Procurement timing windows align ({', '.join([str(o) for o in list(overlap)[:2]])}).")
            elif timing_a and timing_b:
                timing_status = "INCOMPATIBLE"
                timing_score = 20.0
                constraints.append("Restock timing windows differ; schedule coordination needed.")
            else:
                timing_status = "UNKNOWN"
                timing_score = 50.0
                constraints.append("Partial timing data available.")

        # 6. Business Sector Synergy
        sector_a = self._extract_sector(retailer_a)
        sector_b = self._extract_sector(retailer_b)
        is_same_sector = bool(sector_a and sector_b and sector_a.lower() == sector_b.lower())

        if is_same_sector:
            sector_score = 100.0
            reasons.append(f"Both stores operate in the same sector ({sector_a.replace('_', ' ').title()}).")
        else:
            if compatible_products:
                # Valid cross-sector procurement of shared standardized products
                sector_score = 75.0
                sec_a_disp = sector_a.replace('_', ' ').title() if sector_a else 'General Retail'
                sec_b_disp = sector_b.replace('_', ' ').title() if sector_b else 'General Retail'
                reasons.append(f"Cross-sector synergy: {sec_a_disp} and {sec_b_disp} share standardized items.")
            else:
                sector_score = 30.0

        # 7. Downstream Constraint Note
        constraints.append("Supplier wholesale feasibility and MOQ verification evaluated downstream by Opportunity Engine.")

        # 8. Deterministic Weighted Scoring
        # Explicit Weights:
        # Product match: 40%
        # Geographic proximity: 30%
        # Quantity synergy: 15%
        # Timing alignment: 10%
        # Sector synergy: 5%
        if not compatible_products:
            overall_score = 0.0
            status = "NOT_COMPATIBLE"
        elif geo_status == "EXCEEDS_RADIUS":
            overall_score = round(
                (product_match_score * 0.40) +
                (0.0 * 0.30) +
                (quantity_score * 0.15) +
                (timing_score * 0.10) +
                (sector_score * 0.05),
                1
            )
            status = "NOT_COMPATIBLE"
        elif geo_status == "LOCATION_REQUIRED":
            overall_score = round(
                (product_match_score * 0.40) +
                (distance_score * 0.30) +
                (quantity_score * 0.15) +
                (timing_score * 0.10) +
                (sector_score * 0.05),
                1
            )
            status = "LOCATION_REQUIRED"
        else:
            overall_score = round(
                (product_match_score * 0.40) +
                (distance_score * 0.30) +
                (quantity_score * 0.15) +
                (timing_score * 0.10) +
                (sector_score * 0.05),
                1
            )
            if overall_score >= 70.0:
                status = "COMPATIBLE"
            elif overall_score >= 45.0:
                status = "PARTIALLY_COMPATIBLE"
            else:
                status = "NOT_COMPATIBLE"

        # Deterministic Score Label
        if overall_score >= 80.0:
            score_label = "Strong Compatibility"
        elif overall_score >= 50.0:
            score_label = "Moderate Compatibility"
        elif overall_score > 0.0:
            score_label = "Limited Compatibility"
        else:
            score_label = "Not Compatible"

        return RetailerCompatibilityResult(
            compatibilityId=comp_id,
            retailerAId=ret_a_id,
            retailerBId=ret_b_id,
            retailerAName=retailer_a.get("store_name") or retailer_a.get("name") or ret_a_id,
            retailerBName=retailer_b.get("store_name") or retailer_b.get("name") or ret_b_id,
            sectorAId=sector_a,
            sectorBId=sector_b,
            isSameSector=is_same_sector,
            compatibilityStatus=status,
            compatibilityScore=overall_score,
            scoreLabel=score_label,
            productMatchScore=product_match_score,
            distanceScore=distance_score,
            quantityCompatibilityScore=quantity_score,
            timingCompatibilityScore=timing_score,
            sectorCompatibilityScore=sector_score,
            distanceKm=distance_km,
            maxRadiusKm=radius_limit,
            geographicStatus=geo_status,
            compatibleProducts=compatible_products,
            aOnlyProducts=a_only_keys,
            bOnlyProducts=b_only_keys,
            totalSharedDemand=round(total_shared_demand, 2),
            timingCompatibility=timing_status,
            reasons=reasons,
            constraints=constraints,
            exclusions=exclusions,
            calculatedAt=now_iso,
            isDemo=is_pair_demo
        )

    # ------------------------------------------------------------------
    # Batch & Discovery Engine (Optimized Candidate Search)
    # ------------------------------------------------------------------

    def find_compatible_retailers_for(
        self,
        retailer_id: str,
        all_retailers: Optional[List[Dict[str, Any]]] = None,
        max_radius_km: Optional[float] = None
    ) -> List[RetailerCompatibilityResult]:
        """
        Finds all compatible partner retailers for a specific retailer.
        Avoids unnecessary computation by pre-filtering candidates on demo isolation
        and product need overlap.
        """
        all_retailers = all_retailers or repo.get_all("retailers")
        target = next((r for r in all_retailers if str(r.get("id")) == str(retailer_id)), None)
        if not target:
            return []

        target_demo = self._is_demo_retailer(target)
        target_needs = self._extract_product_needs(target)
        target_keys = set(target_needs.keys())

        results: List[RetailerCompatibilityResult] = []

        for candidate in all_retailers:
            cand_id = str(candidate.get("id"))
            if cand_id == str(retailer_id):
                continue

            # 1. Demo isolation pre-filter: real and demo never mix
            if self._is_demo_retailer(candidate) != target_demo:
                continue

            # 2. Fast product intersection pre-filter
            cand_needs = self._extract_product_needs(candidate)
            if not target_keys.intersection(set(cand_needs.keys())):
                continue

            # 3. Evaluate candidate pair
            result = self.evaluate_pair(target, candidate, max_radius_km=max_radius_km)
            results.append(result)

        # Sort deterministically: highest compatibility score first, then smallest distance
        results.sort(key=lambda r: (-r.compatibilityScore, r.distanceKm if r.distanceKm is not None else 999.0))
        return results

    def find_all_compatible_pairs(
        self,
        retailers: Optional[List[Dict[str, Any]]] = None,
        max_radius_km: Optional[float] = None
    ) -> List[RetailerCompatibilityResult]:
        """
        Evaluates all eligible retailer pairs in the dataset.
        Uses indexed canonical product inverted-lists to avoid raw O(n^2) operations.
        """
        retailers = retailers or repo.get_all("retailers")
        
        # Build inverted index: product_key -> list of retailer indices
        product_to_retailers: Dict[str, List[int]] = {}
        retailer_needs_list = []
        is_demo_list = []

        for idx, ret in enumerate(retailers):
            needs = self._extract_product_needs(ret)
            retailer_needs_list.append(needs)
            is_demo_list.append(self._is_demo_retailer(ret))
            for pkey in needs.keys():
                product_to_retailers.setdefault(pkey, []).append(idx)

        # Find candidate pairs that share at least one canonical product
        candidate_pairs: Set[Tuple[int, int]] = set()
        for pkey, r_indices in product_to_retailers.items():
            n = len(r_indices)
            for i in range(n):
                for j in range(i + 1, n):
                    idx_a, idx_b = r_indices[i], r_indices[j]
                    # Demo isolation filter
                    if is_demo_list[idx_a] == is_demo_list[idx_b]:
                        candidate_pairs.add((min(idx_a, idx_b), max(idx_a, idx_b)))

        results = []
        for idx_a, idx_b in candidate_pairs:
            res = self.evaluate_pair(retailers[idx_a], retailers[idx_b], max_radius_km=max_radius_km)
            results.append(res)

        results.sort(key=lambda r: (-r.compatibilityScore, r.distanceKm if r.distanceKm is not None else 999.0))
        return results

    def find_compatible_groups(
        self,
        retailers: Optional[List[Dict[str, Any]]] = None,
        canonical_product_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Clusters compatible retailers into joint procurement pools/groups
        to feed into the downstream Procurement Opportunity Engine.
        """
        pairs = self.find_all_compatible_pairs(retailers=retailers)
        # Filter for viable compatibility
        viable_pairs = [p for p in pairs if p.compatibilityStatus in ("COMPATIBLE", "PARTIALLY_COMPATIBLE")]
        
        groups: List[Dict[str, Any]] = []
        for pair in viable_pairs:
            for p in pair.compatibleProducts:
                if canonical_product_id and p.productId != canonical_product_id:
                    continue
                groups.append({
                    "productId": p.productId,
                    "productName": p.productName,
                    "retailerIds": [pair.retailerAId, pair.retailerBId],
                    "combinedQuantity": p.combinedQuantity,
                    "compatibilityScore": pair.compatibilityScore,
                    "isDemo": pair.isDemo
                })
        return groups


# Global Singleton Instance
compatibility_engine = RetailerCompatibilityEngine()
