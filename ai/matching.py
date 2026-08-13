import math
import logging
from typing import List, Dict, Any, Tuple

logger = logging.getLogger("samooh.ai.matching")


def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculates the great circle distance between two points 
    on the earth in kilometers using the Haversine formula.
    """
    R = 6371.0  # Earth radius in kilometers

    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    
    a = (math.sin(dlat / 2) ** 2 +
         math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2)
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    distance = R * c
    return round(distance, 2)


class RetailerMatchingEngine:
    """
    Retailer Matching Engine.
    Clusters retailers by spatial proximity (Haversine distance), product need overlap,
    and demand compatibility for joint procurement pooling.
    """
    def __init__(self, max_radius_km: float = 8.0):
        self.max_radius_km = max_radius_km

    def find_retailer_clusters_for_product(
        self,
        product_id: str,
        forecasts: List[Dict[str, Any]],
        retailers: List[Dict[str, Any]],
        min_threshold_qty: float
    ) -> List[Dict[str, Any]]:
        """
        Identifies spatial and demand-compatible clusters of retailers for a specific product.
        Returns candidate clusters with explainable matching reasons.
        """
        retailer_map = {r['id']: r for r in retailers}
        
        # Filter forecasts for target product
        product_forecasts = [f for f in forecasts if f['product_id'] == product_id and f['predicted_demand'] > 0]
        
        if len(product_forecasts) < 2:
            return []

        clusters = []
        visited = set()

        for i, base_fc in enumerate(product_forecasts):
            base_ret_id = base_fc['retailer_id']
            if base_ret_id in visited or base_ret_id not in retailer_map:
                continue

            base_ret = retailer_map[base_ret_id]
            current_cluster_ids = [base_ret_id]
            current_demands = {base_ret_id: base_fc['predicted_demand']}
            distances = []

            for j, candidate_fc in enumerate(product_forecasts):
                cand_ret_id = candidate_fc['retailer_id']
                if cand_ret_id == base_ret_id or cand_ret_id in visited or cand_ret_id not in retailer_map:
                    continue

                cand_ret = retailer_map[cand_ret_id]
                dist = haversine_distance(
                    base_ret['latitude'], base_ret['longitude'],
                    cand_ret['latitude'], cand_ret['longitude']
                )

                if dist <= self.max_radius_km:
                    current_cluster_ids.append(cand_ret_id)
                    current_demands[cand_ret_id] = candidate_fc['predicted_demand']
                    distances.append(dist)

            total_cluster_demand = sum(current_demands.values())

            # Only consider clusters with at least 2 retailers
            if len(current_cluster_ids) >= 2:
                for rid in current_cluster_ids:
                    visited.add(rid)

                avg_dist = round(sum(distances) / len(distances), 2) if distances else 0.5
                progress_pct = round((total_cluster_demand / min_threshold_qty) * 100, 1)

                # Formulate explainable reasons
                reasons = []
                reasons.append(f"Geographic proximity: Retailers located within an average radius of {avg_dist} km.")
                reasons.append(f"High product demand alignment: Combined demand reaches {total_cluster_demand} units.")
                if progress_pct >= 100:
                    reasons.append(f"Threshold Achieved: Group demand exceeds supplier requirement of {min_threshold_qty} units.")
                else:
                    reasons.append(f"Near Threshold: Currently at {progress_pct}% of the required {min_threshold_qty} unit threshold.")

                cluster_info = {
                    "product_id": product_id,
                    "retailer_ids": current_cluster_ids,
                    "retailer_demands": current_demands,
                    "total_demand": total_cluster_demand,
                    "average_distance_km": avg_dist,
                    "progress_percentage": progress_pct,
                    "is_threshold_met": total_cluster_demand >= min_threshold_qty,
                    "explainable_reasons": reasons
                }
                clusters.append(cluster_info)

        return clusters
