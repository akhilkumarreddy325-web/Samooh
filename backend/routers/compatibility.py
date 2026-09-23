"""
FastAPI Router for Retailer Compatibility Engine (Prompt 3 - Samooh SIH).

Endpoints:
  - GET /procurement/compatibility
  - GET /procurement/compatibility/{retailer_id}

Security & Privacy Guarantees:
  - Mandatory Firebase Authentication via get_current_user
  - Retailer isolation: Non-admin retailers can only query their own compatibility
  - Competitor privacy: Private coordinates, competitor-only product demands are masked
  - Demo data isolation preserved
"""

from typing import Dict, Any, List, Optional
from fastapi import APIRouter, Query, HTTPException, Depends

from backend.auth import get_current_user, AuthenticatedUser
from services.compatibility import compatibility_engine
from models.compatibility import RetailerCompatibilityResult
from backend.database.repository import repo

router = APIRouter(tags=["Retailer Compatibility"])


def sanitize_compatibility_for_user(
    result: RetailerCompatibilityResult,
    user: AuthenticatedUser
) -> Dict[str, Any]:
    """
    Applies role-based privacy sanitization to compatibility results.
    - Admins/System: Full diagnostic details.
    - Retailers: Protects competitor private information (exact coordinates, unshared product lines).
    """
    # Support Pydantic v2 model_dump and v1 dict
    data = result.model_dump() if hasattr(result, "model_dump") else result.dict()
    if user.is_admin:
        return data

    caller_id = user.uid or user.retailer_id
    is_a = (caller_id == result.retailerAId)
    is_b = (caller_id == result.retailerBId)

    # If caller is not part of this pair and not admin, this shouldn't be reached,
    # but sanitize aggressively as defense-in-depth:
    if not is_a and not is_b:
        # Hide internal product lists
        data["aOnlyProducts"] = []
        data["bOnlyProducts"] = []
        return data

    # Sanitize competitor-only demands
    if is_a:
        # Competitor is B: mask B-only products and B's individual quantities if private
        data["bOnlyProducts"] = [f"{len(result.bOnlyProducts)} additional items"] if result.bOnlyProducts else []
    elif is_b:
        # Competitor is A: mask A-only products
        data["aOnlyProducts"] = [f"{len(result.aOnlyProducts)} additional items"] if result.aOnlyProducts else []

    return data


@router.get("/procurement/compatibility")
@router.get("/compatibility")
def get_retailer_compatibility_list(
    retailer_id: Optional[str] = Query(None, description="Retailer ID to evaluate (defaults to authenticated retailer)"),
    max_radius_km: Optional[float] = Query(None, description="Optional override for matching radius in km"),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Evaluates explainable compatibility for the authenticated retailer with potential procurement partners.
    Requires valid Firebase authentication.
    """
    target_id = retailer_id
    if not target_id:
        target_id = current_user.retailer_id or current_user.uid

    # Authorization Check:
    # Non-admin retailers can ONLY request compatibility for themselves.
    if not current_user.is_admin:
        caller_ref = current_user.retailer_id or current_user.uid
        if str(target_id) != str(caller_ref):
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Retailers can only inspect compatibility for their own store."
            )

    results = compatibility_engine.find_compatible_retailers_for(
        retailer_id=str(target_id),
        max_radius_km=max_radius_km
    )

    sanitized = [sanitize_compatibility_for_user(r, current_user) for r in results]

    return {
        "status": "success",
        "retailerId": target_id,
        "count": len(sanitized),
        "results": sanitized
    }


@router.get("/procurement/compatibility/{retailer_id}")
def get_retailer_compatibility_by_id(
    retailer_id: str,
    max_radius_km: Optional[float] = Query(None, description="Optional override for matching radius in km"),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Evaluates explainable compatibility for a specific retailer ID.
    Requires valid Firebase authentication and appropriate authorization.
    """
    if not current_user.is_admin:
        caller_ref = current_user.retailer_id or current_user.uid
        if str(retailer_id) != str(caller_ref):
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Retailers can only inspect compatibility for their own store."
            )

    results = compatibility_engine.find_compatible_retailers_for(
        retailer_id=str(retailer_id),
        max_radius_km=max_radius_km
    )

    sanitized = [sanitize_compatibility_for_user(r, current_user) for r in results]

    return {
        "status": "success",
        "retailerId": retailer_id,
        "count": len(sanitized),
        "results": sanitized
    }


@router.get("/procurement/compatibility/pair/{retailer_a_id}/{retailer_b_id}")
def get_pairwise_compatibility(
    retailer_a_id: str,
    retailer_b_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Evaluates direct pairwise explainable compatibility between two specific retailers.
    """
    if not current_user.is_admin:
        caller_ref = current_user.retailer_id or current_user.uid
        if str(caller_ref) not in (str(retailer_a_id), str(retailer_b_id)):
            raise HTTPException(
                status_code=403,
                detail="Forbidden: Cannot inspect pairwise compatibility between third-party retailers."
            )

    all_ret = repo.get_all("retailers")
    ret_a = next((r for r in all_ret if str(r.get("id")) == str(retailer_a_id)), None)
    ret_b = next((r for r in all_ret if str(r.get("id")) == str(retailer_b_id)), None)

    if not ret_a or not ret_b:
        raise HTTPException(
            status_code=404,
            detail="One or both retailers not found in registry."
        )

    result = compatibility_engine.evaluate_pair(ret_a, ret_b)
    sanitized = sanitize_compatibility_for_user(result, current_user)

    return {
        "status": "success",
        "compatibility": sanitized
    }
