from fastapi import APIRouter
from typing import Dict, Any
from backend.database.repository import repo

router = APIRouter(tags=["Dashboard & Impact"])


@router.get("/dashboard")
def get_dashboard_summary() -> Dict[str, Any]:
    """
    Returns executive dashboard summary metrics including total retailers,
    active procurement pools, gross community savings, top recommended pools,
    and product category breakdown.
    """
    retailers = repo.get_all("retailers")
    products = repo.get_all("products")
    pools = repo.get_all("procurementPools")
    recommendations = repo.get_all("recommendations")
    forecasts = repo.get_all("forecasts")

    total_savings = sum(r.get("estimated_total_savings", 0.0) for r in recommendations)
    achieved_pools = [p for p in pools if p.get("is_threshold_met")]

    # Category breakdown
    cat_counts = {}
    for p in products:
        c = p.get("category", "Other")
        cat_counts[c] = cat_counts.get(c, 0) + 1

    return {
        "status": "success",
        "metrics": {
            "total_retailers": len(retailers),
            "total_catalog_products": len(products),
            "total_active_pools": len(pools),
            "pools_achieved_threshold": len(achieved_pools),
            "total_community_savings_inr": round(total_savings, 2),
            "total_forecasts_generated": len(forecasts),
            "total_recommendations": len(recommendations)
        },
        "category_breakdown": cat_counts,
        "top_recommendations": recommendations[:5] if recommendations else []
    }


@router.get("/impact")
def get_community_impact() -> Dict[str, Any]:
    """
    Returns environmental, logistics, and economic impact metrics for Samooh.
    """
    recommendations = repo.get_all("recommendations")
    pools = repo.get_all("procurementPools")
    retailers = repo.get_all("retailers")

    total_savings = sum(r.get("estimated_total_savings", 0.0) for r in recommendations)
    avg_discount = (
        sum(r.get("estimated_savings_percentage", 0.0) for r in recommendations) / len(recommendations)
    ) if recommendations else 0.0

    total_pools = len(pools)
    met_pools = len([p for p in pools if p.get("is_threshold_met")])
    success_rate = round((met_pools / total_pools) * 100, 1) if total_pools > 0 else 0.0

    # Logistics efficiency calculation (consolidated deliveries)
    # Individual deliveries = sum of retailers across pools
    individual_deliveries = sum(len(p.get("retailer_ids", [])) for p in pools)
    consolidated_deliveries = total_pools
    deliveries_saved = max(0, individual_deliveries - consolidated_deliveries)
    co2_saved_kg = round(deliveries_saved * 4.2, 1)  # ~4.2 kg CO2 saved per avoided delivery trip

    return {
        "status": "success",
        "impact": {
            "total_community_savings_inr": round(total_savings, 2),
            "average_group_discount_percentage": round(avg_discount, 1),
            "wholesale_threshold_success_rate": success_rate,
            "retailers_empowered": len(retailers),
            "logistics_trips_consolidated": deliveries_saved,
            "estimated_co2_reduction_kg": co2_saved_kg,
            "average_roi_per_retailer_inr": round(total_savings / max(1, len(retailers)), 2)
        }
    }
