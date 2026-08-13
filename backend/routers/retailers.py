from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from backend.database.repository import repo

router = APIRouter(prefix="/retailers", tags=["Retailers"])


@router.get("")
def get_retailers(
    store_type: Optional[str] = Query(None, description="Filter by store type (e.g. Kirana, Superette)"),
    city: Optional[str] = Query(None, description="Filter by city")
) -> Dict[str, Any]:
    """
    Retrieves list of all registered retailers with optional store_type and city filtering.
    """
    retailers = repo.get_all("retailers")

    if store_type:
        retailers = [r for r in retailers if r.get("store_type", "").lower() == store_type.lower()]
    if city:
        retailers = [r for r in retailers if r.get("city", "").lower() == city.lower()]

    return {
        "status": "success",
        "count": len(retailers),
        "data": retailers
    }


@router.get("/{retailer_id}")
def get_retailer_by_id(retailer_id: str) -> Dict[str, Any]:
    """
    Retrieves single retailer profile by ID.
    """
    retailer = repo.get_by_id("retailers", retailer_id)
    if not retailer:
        return {"status": "error", "message": f"Retailer with ID '{retailer_id}' not found"}

    return {
        "status": "success",
        "data": retailer
    }
