from fastapi import APIRouter, Query, HTTPException, Body, Depends
from typing import Dict, Any, Optional, List
from services.opportunity import opportunity_engine
from backend.database.repository import repo
from backend.auth import (
    get_current_user,
    require_admin_or_system,
    sanitize_opportunity_for_user,
    AuthenticatedUser
)

router = APIRouter(tags=["Procurement Opportunities"])


@router.get("/procurement/opportunities")
@router.get("/opportunities")
def get_procurement_opportunities(
    sector_id: Optional[str] = Query(None, description="Filter by business sector ID (e.g. grocery, bakery)"),
    canonical_product_id: Optional[str] = Query(None, description="Filter by canonical product ID (e.g. grocery_rice_basmati)"),
    supplier_id: Optional[str] = Query(None, description="Filter by candidate wholesale supplier ID"),
    retailer_id: Optional[str] = Query(None, description="Filter by participating retailer ID"),
    status: Optional[str] = Query(None, description="Filter by feasibility status (FEASIBLE, BELOW_MOQ, INSUFFICIENT_STOCK, ALREADY_IN_POOL, etc.)"),
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieves real procurement opportunities evaluated across eligible retailers and suppliers.
    Requires valid Firebase authentication.
    Applies role-based privacy masking (competitor store demands and private inventory).
    """
    sec = None if hasattr(sector_id, "default") else sector_id
    canon_pid = None if hasattr(canonical_product_id, "default") else canonical_product_id
    sup_id = None if hasattr(supplier_id, "default") else supplier_id
    ret_id = None if hasattr(retailer_id, "default") else retailer_id
    stat = None if hasattr(status, "default") else status

    # Query from cached repository or evaluate live
    cached_opps = repo.get_all("procurementOpportunities")
    if not cached_opps:
        cached_opps = opportunity_engine.find_procurement_opportunities(
            sector_id=sec,
            canonical_product_id=canon_pid,
            supplier_id=sup_id,
            retailer_id=ret_id,
            status=stat
        )
    else:
        # Filter existing
        if sec:
            cached_opps = [o for o in cached_opps if o.get("sectorId", "").lower() == sec.lower()]
        if canon_pid:
            cached_opps = [o for o in cached_opps if o.get("canonicalProductId") == canon_pid]
        if sup_id:
            cached_opps = [o for o in cached_opps if o.get("supplierId") == sup_id]
        if ret_id:
            cached_opps = [o for o in cached_opps if ret_id in o.get("retailerIds", [])]
        if stat and stat.upper() != "ALL":
            cached_opps = [o for o in cached_opps if o.get("status", "").upper() == stat.upper()]

    # Apply data privacy sanitization
    sanitized_opps = [sanitize_opportunity_for_user(opp, current_user) for opp in cached_opps]

    return {
        "status": "success",
        "count": len(sanitized_opps),
        "data": sanitized_opps
    }


@router.post("/procurement/opportunities/recalculate")
def recalculate_procurement_opportunities(
    sector_id: Optional[str] = Query(None, description="Optional sector filter"),
    canonical_product_id: Optional[str] = Query(None, description="Optional canonical product filter"),
    admin_user: AuthenticatedUser = Depends(require_admin_or_system)
) -> Dict[str, Any]:
    """
    Triggers deterministic recalculation of all procurement opportunities.
    Restricted to system administrators and authorized system paths.
    """
    sec = None if hasattr(sector_id, "default") else sector_id
    canon_pid = None if hasattr(canonical_product_id, "default") else canonical_product_id

    fresh_opps = opportunity_engine.find_procurement_opportunities(
        sector_id=sec,
        canonical_product_id=canon_pid
    )

    sanitized_opps = [sanitize_opportunity_for_user(opp, admin_user) for opp in fresh_opps]

    return {
        "status": "success",
        "message": f"Successfully evaluated {len(sanitized_opps)} procurement opportunities.",
        "count": len(sanitized_opps),
        "data": sanitized_opps
    }


@router.get("/procurement/opportunities/{opp_id}")
def get_opportunity_by_id(
    opp_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Retrieves details and explainability breakdown for a single procurement opportunity.
    Requires valid Firebase authentication.
    Applies role-based privacy masking.
    """
    opp = repo.get_by_id("procurementOpportunities", opp_id)
    if not opp:
        all_opps = repo.get_all("procurementOpportunities")
        opp = next((o for o in all_opps if o.get("opportunityId") == opp_id or o.get("id") == opp_id), None)

    if not opp:
        raise HTTPException(status_code=404, detail=f"Procurement opportunity '{opp_id}' not found.")

    sanitized = sanitize_opportunity_for_user(opp, current_user)

    return {
        "status": "success",
        "data": sanitized
    }
