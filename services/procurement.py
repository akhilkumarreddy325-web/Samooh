import datetime
import logging
from typing import List, Dict, Any
from backend.database.repository import repo

logger = logging.getLogger("samooh.services.procurement")


class ProcurementEngine:
    """
    Procurement Pool Formation Engine.
    Aggregates matched retailer demands into official procurement pools and checks wholesale eligibility.
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
            
            total_dem = cluster["total_demand"]
            threshold = product.get("min_wholesale_quantity", 30.0)
            is_met = total_dem >= threshold
            prog_pct = round((total_dem / threshold) * 100, 1)

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
                "average_distance_km": cluster["average_distance_km"],
                "created_at": datetime.datetime.utcnow().isoformat() + "Z"
            }
            created_pools.append(pool_data)

        # Save to database
        repo.save_bulk("procurementPools", created_pools)
        logger.info(f"Created and saved {len(created_pools)} procurement pools.")
        return created_pools
