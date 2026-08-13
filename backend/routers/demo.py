from fastapi import APIRouter
from typing import Dict, Any
from backend.database.demo_seed import seed_deterministic_demo
from backend.database.repository import repo

router = APIRouter(prefix="/demo", tags=["Hackathon Demo"])


@router.post("/scenario")
def trigger_demo_scenario() -> Dict[str, Any]:
    """
    Triggers the deterministic hackathon demo scenario:
    - Product: Parle-G 800g
    - 5 Retailers (Demands: 32, 24, 27, 21, 8 = 112 units)
    - Threshold: 100 units (ACHIEVED, 112%)
    - Total Savings: ₹2,800.00 (20.83% OFF)
    """
    res = seed_deterministic_demo()
    return res


@router.get("/scenario")
def get_demo_scenario() -> Dict[str, Any]:
    """
    Fetches the current active hackathon demo scenario state.
    """
    rec = repo.get_by_id("recommendations", "rec_demo_parle_g")
    pool = repo.get_by_id("procurementPools", "pool_demo_parle_g")

    return {
        "status": "success",
        "scenario_name": "Parle-G 800g Hackathon Scenario",
        "recommendation": rec,
        "procurement_pool": pool,
        "metrics": {
            "total_demand": 112.0,
            "threshold_quantity": 100.0,
            "progress_percentage": 112.0,
            "retail_price": 120.0,
            "wholesale_price": 95.0,
            "total_individual_cost": 13440.0,
            "total_pooled_cost": 10640.0,
            "total_savings_inr": 2800.0,
            "savings_percentage": 20.83
        }
    }
