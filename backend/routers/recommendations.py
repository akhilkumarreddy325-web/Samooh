from fastapi import APIRouter, Query
from typing import Dict, Any, Optional
from services.recommendation import RecommendationEngine
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
    Retrieves active AI-generated group procurement recommendations.
    """
    recommendations = repo.get_all("recommendations")

    if product_id:
        recommendations = [r for r in recommendations if r.get("product_id") == product_id]
    if threshold_status:
        recommendations = [r for r in recommendations if r.get("threshold_status", "").upper() == threshold_status.upper()]

    return {
        "status": "success",
        "count": len(recommendations),
        "data": recommendations
    }


@router.post("/generate-recommendations")
def trigger_generate_recommendations() -> Dict[str, Any]:
    """
    Triggers the end-to-end AI workflow:
    Historical Sales -> Forecasting -> Retailer Matching -> Pool Formation -> Wholesale Threshold Check -> Savings Engine -> Recommendation Generation.
    """
    recs = recommendation_engine.generate_recommendations()

    return {
        "status": "success",
        "message": f"Successfully generated {len(recs)} group procurement recommendations.",
        "count": len(recs),
        "data": recs
    }


@router.post("/seed-data")
def trigger_seed_demo_data() -> Dict[str, Any]:
    """
    Resets and populates the database with 30 retailers, 20 catalog products, 
    4 suppliers, and 6 months of historical daily sales records.
    Automatically generates initial forecasts & recommendations.
    """
    seed_result = seed_demo_data()
    # Trigger downstream pipelines
    recommendation_engine.generate_recommendations()

    return {
        "status": "success",
        "seed_info": seed_result,
        "message": "Demo data successfully seeded and AI recommendation pipeline executed."
    }
