import datetime
import logging
from typing import List, Dict, Any
from ai.forecasting import DemandForecastingEngine
from ai.matching import RetailerMatchingEngine
from services.procurement import ProcurementEngine
from services.savings import SavingsEngine
from backend.database.repository import repo

logger = logging.getLogger("samooh.services.recommendation")


class RecommendationEngine:
    """
    End-to-end Recommendation Engine.
    Orchestrates Forecasting -> Matching -> Pooling -> Savings -> AI Natural Language Explanation.
    """
    def __init__(self):
        self.forecasting_engine = DemandForecastingEngine()
        self.matching_engine = RetailerMatchingEngine(max_radius_km=10.0)
        self.procurement_engine = ProcurementEngine()
        self.savings_engine = SavingsEngine()

    def generate_recommendations(self) -> List[Dict[str, Any]]:
        """
        Runs complete Samooh workflow and generates recommendations saved to DB.
        """
        # 1. Run / load forecasts
        forecasts = repo.get_all("forecasts")
        if not forecasts:
            forecasts = self.forecasting_engine.run_all_forecasts()

        retailers = repo.get_all("retailers")
        products = repo.get_all("products")
        retailer_map = {r['id']: r['name'] for r in retailers}

        # 2. Match retailers per product
        all_clusters = []
        for prod in products:
            prod_id = prod['id']
            min_thresh = float(prod.get('min_wholesale_quantity', 30.0))
            clusters = self.matching_engine.find_retailer_clusters_for_product(
                product_id=prod_id,
                forecasts=forecasts,
                retailers=retailers,
                min_threshold_qty=min_thresh
            )
            all_clusters.extend(clusters)

        # 3. Form procurement pools
        pools = self.procurement_engine.create_procurement_pools(all_clusters)

        # 4. Calculate savings & generate recommendations
        recommendations = []
        rec_counter = 0

        for pool in pools:
            rec_counter += 1
            savings_info = self.savings_engine.calculate_pool_savings(pool)
            
            prod_id = pool["product_id"]
            prod_name = pool["product_name"]
            prod_obj = repo.get_by_id("products", prod_id) or {}

            r_ids = pool["retailer_ids"]
            r_names = [retailer_map.get(rid, f"Store {rid}") for rid in r_ids]

            # Determine threshold status
            is_met = pool["is_threshold_met"]
            prog = pool["progress_percentage"]
            if is_met:
                status = "ACHIEVED"
            elif prog >= 75.0:
                status = "NEAR_THRESHOLD"
            else:
                status = "IN_PROGRESS"

            # Formulate explainable recommendation narrative
            uom = prod_obj.get("unit_of_measure", "units")
            tot_dem = pool["total_demand"]
            thresh_qty = pool["threshold_quantity"]
            dist_km = pool["average_distance_km"]
            sav_pct = savings_info["total_savings_percentage"]
            sav_amt = savings_info["total_savings_amount"]
            num_stores = len(r_ids)

            explanation = (
                f"A cluster of {num_stores} nearby stores (within {dist_km} km radius) "
                f"has a combined 30-day forecast demand of {tot_dem} {uom}. "
            )
            if is_met:
                explanation += (
                    f"This exceeds the supplier threshold of {thresh_qty} {uom}, "
                    f"unlocking an estimated total savings of ₹{sav_amt:,.2f} ({sav_pct}% discount)."
                )
            else:
                remaining = round(thresh_qty - tot_dem, 1)
                explanation += (
                    f"The pool is at {prog}% of the {thresh_qty} {uom} threshold (needs {remaining} more {uom}). "
                    f"Joining this group unlocks potential savings of ₹{sav_amt:,.2f} ({sav_pct}% discount)."
                )

            # Priority scoring formula
            score = round(min(0.99, 0.40 * (prog / 100.0) + 0.40 * (sav_pct / 30.0) + 0.20 * (1.0 / max(1.0, dist_km))), 2)

            rec = {
                "id": f"rec_{rec_counter:03d}",
                "product_id": prod_id,
                "product_name": prod_name,
                "category": prod_obj.get("category", "General"),
                "pool_id": pool["id"],
                "retailer_ids": r_ids,
                "retailer_names": r_names,
                "threshold_status": status,
                "threshold_quantity": thresh_qty,
                "current_pool_quantity": tot_dem,
                "estimated_total_savings": sav_amt,
                "estimated_savings_percentage": sav_pct,
                "average_cluster_distance_km": dist_km,
                "explanation": explanation,
                "score": score,
                "created_at": datetime.datetime.utcnow().isoformat() + "Z"
            }
            recommendations.append(rec)

        # Sort recommendations by priority score descending
        recommendations.sort(key=lambda x: x["score"], reverse=True)
        repo.save_bulk("recommendations", recommendations)
        logger.info(f"Generated and saved {len(recommendations)} recommendations.")
        return recommendations
