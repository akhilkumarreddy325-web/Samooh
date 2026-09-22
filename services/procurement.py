import datetime
import logging
from typing import List, Dict, Any
from backend.database.repository import repo
from services.transport import transport_engine

logger = logging.getLogger("samooh.services.procurement")


class ProcurementEngine:
    """
    Procurement Pool Formation Engine.
    Aggregates matched retailer demands into official procurement pools and checks wholesale eligibility.
    Computes pooled physical inventory and deterministic transport recommendations.
    """

    def create_procurement_pools(self, matched_clusters: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Transforms candidate clusters into validated procurement pools.
        Stores them in the procurementPools database collection.
        """
        products_map = {p['id']: p for p in repo.get_all("products")}
        created_pools = []
        pool_counter = 0

        for cluster in matched_clusters:
            pool_counter += 1
            prod_id = cluster["product_id"]
            product = products_map.get(prod_id, {})
            
            threshold = float(product.get("min_wholesale_quantity", 30.0))
            retailer_demands = cluster.get("retailer_demands", {})
            avg_dist = cluster.get("average_distance_km", 2.5)

            # 1. Calculate detailed pooled inventory (quantities, weights, MOQ status)
            pooled_inv = transport_engine.calculate_pooled_inventory(
                retailer_demands=retailer_demands,
                product=product,
                moq_threshold=threshold
            )

            total_dem = pooled_inv["total_quantity"]
            is_met = pooled_inv["moq_satisfied"]
            prog_pct = round((total_dem / threshold) * 100, 1) if threshold > 0 else 100.0

            # 2. Compute deterministic constraint-based transport plan
            transport_rec = transport_engine.recommend_transport(
                pooled_inventory=pooled_inv,
                delivery_distance_km=avg_dist,
                delivery_stops_count=len(cluster["retailer_ids"])
            )

            pool_id = f"pool_{pool_counter:03d}"
            pool_data = {
                "id": pool_id,
                "product_id": prod_id,
                "product_name": product.get("name", "Product"),
                "supplier_id": product.get("supplier_id", "sup_01"),
                "retailer_ids": cluster["retailer_ids"],
                "retailer_demands": cluster["retailer_demands"],
                "total_demand": total_dem,
                "threshold_quantity": threshold,
                "is_threshold_met": is_met,
                "progress_percentage": prog_pct,
                "average_distance_km": avg_dist,
                "pooled_inventory": pooled_inv,
                "transport": transport_rec,
                "created_at": datetime.datetime.utcnow().isoformat() + "Z"
            }
            created_pools.append(pool_data)

        # Save to database
        repo.save_bulk("procurementPools", created_pools)
        logger.info(f"Created and saved {len(created_pools)} procurement pools with pooled inventory and transport plans.")
        return created_pools
