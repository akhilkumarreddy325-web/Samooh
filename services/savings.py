import logging
from typing import Dict, Any, List
from backend.database.repository import repo

logger = logging.getLogger("samooh.services.savings")


class SavingsEngine:
    """
    Savings Calculation Engine.
    Calculates single-store individual purchasing cost vs Samooh pooled wholesale cost,
    quantifying gross savings in INR and percentage discount.
    """

    def calculate_pool_savings(self, pool_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Computes itemized financial savings for a procurement pool.
        """
        prod_id = pool_data["product_id"]
        product = repo.get_by_id("products", prod_id) or {}
        retailers_map = {r['id']: r['name'] for r in repo.get_all("retailers")}

        retail_price = float(product.get("retail_price", 100.0))
        wholesale_price = float(product.get("wholesale_price", 80.0))

        retailer_demands: Dict[str, float] = pool_data["retailer_demands"]
        total_quantity = float(pool_data["total_demand"])

        total_individual_cost = round(total_quantity * retail_price, 2)
        total_pooled_cost = round(total_quantity * wholesale_price, 2)
        total_savings_amount = round(total_individual_cost - total_pooled_cost, 2)
        
        total_savings_pct = round(
            ((total_individual_cost - total_pooled_cost) / total_individual_cost) * 100, 1
        ) if total_individual_cost > 0 else 0.0

        retailer_breakdown = {}
        for ret_id, dem in retailer_demands.items():
            ind_cost = round(dem * retail_price, 2)
            pool_cost = round(dem * wholesale_price, 2)
            sav_amt = round(ind_cost - pool_cost, 2)
            sav_pct = round(((ind_cost - pool_cost) / ind_cost) * 100, 1) if ind_cost > 0 else 0.0

            retailer_breakdown[ret_id] = {
                "retailer_id": ret_id,
                "retailer_name": retailers_map.get(ret_id, f"Retailer {ret_id}"),
                "demand": dem,
                "individual_cost": ind_cost,
                "pooled_cost": pool_cost,
                "savings_amount": sav_amt,
                "savings_percentage": sav_pct
            }

        return {
            "product_id": prod_id,
            "product_name": product.get("name", "Product"),
            "unit_retail_price": retail_price,
            "unit_wholesale_price": wholesale_price,
            "total_quantity": total_quantity,
            "total_individual_cost": total_individual_cost,
            "total_pooled_cost": total_pooled_cost,
            "total_savings_amount": total_savings_amount,
            "total_savings_percentage": total_savings_pct,
            "retailer_breakdown": retailer_breakdown
        }
