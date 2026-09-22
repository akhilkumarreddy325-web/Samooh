from fastapi import APIRouter, Query, HTTPException, Body
from typing import Dict, Any, Optional
from services.recommendation import RecommendationEngine
from services.transport import transport_engine, PROTOTYPE_VEHICLE_FLEET
from backend.database.seed_data import seed_demo_data
from backend.database.repository import repo

router = APIRouter(tags=["Recommendations & Seeding"])
recommendation_engine = RecommendationEngine()


@router.get("/recommendations")
def get_recommendations(
    product_id: Optional[str] = Query(None, description="Filter recommendations by product ID"),
    threshold_status: Optional[str] = Query(None, description="Filter by status (ACHIEVED, NEAR_THRESHOLD, IN_PROGRESS)")
) -> Dict[str, Any]:
    """
    Retrieves active AI-generated group procurement recommendations
    with detailed pooled inventory calculations and deterministic transport plans.
    """
    recommendations = repo.get_all("recommendations")

    prod_id = None if hasattr(product_id, "default") else product_id
    t_status = None if hasattr(threshold_status, "default") else threshold_status

    if prod_id:
        recommendations = [r for r in recommendations if r.get("product_id") == prod_id]
    if t_status:
        recommendations = [r for r in recommendations if r.get("threshold_status", "").upper() == t_status.upper()]

    return {
        "status": "success",
        "count": len(recommendations),
        "data": recommendations
    }


@router.post("/generate-recommendations")
def trigger_generate_recommendations() -> Dict[str, Any]:
    """
    Triggers the end-to-end workflow:
    Historical Sales -> Forecasting -> Retailer Matching -> Pool Formation -> 
    Pooled Inventory Aggregation -> MOQ Validation -> Transport Capacity Analysis -> 
    Savings Engine -> Final Procurement Recommendations.
    """
    recs = recommendation_engine.generate_recommendations()

    return {
        "status": "success",
        "message": f"Successfully generated {len(recs)} group procurement recommendations with transport plans.",
        "count": len(recs),
        "data": recs
    }


@router.post("/seed-data")
def trigger_seed_demo_data() -> Dict[str, Any]:
    """
    Resets and populates the database with 30 retailers, 20 catalog products (with weights), 
    4 suppliers, and 6 months of historical daily sales records.
    Automatically generates initial forecasts & recommendations.
    """
    seed_result = seed_demo_data()
    recommendation_engine.generate_recommendations()

    return {
        "status": "success",
        "seed_info": seed_result,
        "message": "Demo data successfully seeded and procurement & transport pipeline executed."
    }


@router.get("/transport/fleet")
def get_vehicle_fleet() -> Dict[str, Any]:
    """
    Retrieves the available commercial goods vehicle fleet configuration.
    """
    return {
        "status": "success",
        "fleet_count": len(PROTOTYPE_VEHICLE_FLEET),
        "fleet": PROTOTYPE_VEHICLE_FLEET
    }


@router.post("/recommendations/{pool_id}/recalculate-transport")
def recalculate_pool_transport(
    pool_id: str,
    payload: Dict[str, Any] = Body(default={}, description="Optional updated retailer demands and distance")
) -> Dict[str, Any]:
    """
    Dynamically recalculates pooled inventory and transport recommendation for a pool.
    Handles dynamic scenario changes:
    - Retailer joining or leaving group
    - Retailer demand quantity modification
    - Alternative delivery distance simulation
    """
    pool = repo.get_by_id("procurementPools", pool_id)
    if not pool:
        # Check recommendations collection as well
        recs = repo.get_all("recommendations")
        matched_rec = next((r for r in recs if r.get("pool_id") == pool_id or r.get("id") == pool_id), None)
        if matched_rec:
            pool = repo.get_by_id("procurementPools", matched_rec.get("pool_id"))
    
    if not pool:
        raise HTTPException(status_code=404, detail=f"Procurement pool '{pool_id}' not found.")

    prod_id = pool["product_id"]
    product = repo.get_by_id("products", prod_id) or {
        "id": prod_id,
        "name": pool.get("product_name", "Product"),
        "min_wholesale_quantity": pool.get("threshold_quantity", 30.0)
    }

    # Use updated retailer demands if provided, else use pool's existing demands
    custom_demands = payload.get("retailer_demands", pool.get("retailer_demands", {}))
    custom_distance = payload.get("delivery_distance_km", pool.get("average_distance_km", 3.0))

    threshold = float(product.get("min_wholesale_quantity", pool.get("threshold_quantity", 30.0)))
    pooled_inv = transport_engine.calculate_pooled_inventory(
        retailer_demands=custom_demands,
        product=product,
        moq_threshold=threshold
    )

    transport_rec = transport_engine.recommend_transport(
        pooled_inventory=pooled_inv,
        delivery_distance_km=custom_distance,
        delivery_stops_count=pooled_inv["retailer_count"]
    )

    return {
        "status": "success",
        "pool_id": pool_id,
        "product_id": prod_id,
        "product_name": product.get("name", "Product"),
        "pooled_inventory": pooled_inv,
        "transport": transport_rec
    }


@router.post("/transport/evaluate")
def evaluate_custom_transport(
    payload: Dict[str, Any] = Body(..., description="Ad-hoc group demands and product details")
) -> Dict[str, Any]:
    """
    Evaluates ad-hoc pooled inventory and vehicle transport without requiring a saved pool.
    Useful for interactive scenario testing and what-if simulation.
    """
    product = payload.get("product", {})
    if not product and payload.get("product_id"):
        product = repo.get_by_id("products", payload["product_id"]) or {}

    demands = payload.get("retailer_demands", {})
    distance = payload.get("delivery_distance_km", 4.0)

    pooled_inv = transport_engine.calculate_pooled_inventory(
        retailer_demands=demands,
        product=product,
        moq_threshold=payload.get("min_wholesale_quantity")
    )

    transport_rec = transport_engine.recommend_transport(
        pooled_inventory=pooled_inv,
        delivery_distance_km=distance,
        delivery_stops_count=len(demands)
    )

    return {
        "status": "success",
        "pooled_inventory": pooled_inv,
        "transport": transport_rec
    }
