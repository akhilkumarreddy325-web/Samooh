import os
import json
import base64
import logging
from typing import Optional, Dict, Any
from pydantic import BaseModel
from fastapi import Header, HTTPException, Depends

from backend.config import settings

logger = logging.getLogger("samooh.auth")


class AuthenticatedUser(BaseModel):
    uid: str
    email: Optional[str] = None
    role: str = "retailer"
    is_admin: bool = False
    supplier_id: Optional[str] = None
    retailer_id: Optional[str] = None


def decode_jwt_unverified_payload(token: str) -> Dict[str, Any]:
    """
    Decodes the payload of a JWT without signature verification
    for testing, fallback, and extracting user claims when running in mock/offline mode.
    """
    parts = token.split(".")
    if len(parts) < 2:
        raise ValueError("Invalid JWT token format.")
    payload_b64 = parts[1]
    # Handle padding
    rem = len(payload_b64) % 4
    if rem > 0:
        payload_b64 += "=" * (4 - rem)
    decoded_bytes = base64.urlsafe_b64decode(payload_b64)
    return json.loads(decoded_bytes.decode("utf-8"))


def parse_bearer_token(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts Bearer token from the Authorization header.
    Rejects requests without credentials with 401 Unauthorized.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required: No Authorization header provided."
        )
    
    parts = authorization.strip().split()
    if len(parts) == 1 and parts[0]:
        # Token directly provided
        return parts[0]
    elif len(parts) == 2 and parts[0].lower() == "bearer":
        return parts[1]
    else:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed: Header must be in 'Bearer <token>' format."
        )


def get_current_user(token: str = Depends(parse_bearer_token)) -> AuthenticatedUser:
    """
    Validates Firebase Auth token and resolves caller identity.
    In production (settings.USE_MOCK_FIRESTORE is False or ENVIRONMENT == 'production'),
    cryptographic verification via Firebase Admin SDK is mandatory.
    If verification fails, the request is immediately rejected with HTTP 401.
    Fallback to unverified JWT decoding is strictly prohibited in production.
    """
    is_production = (
        not settings.USE_MOCK_FIRESTORE or
        getattr(settings, "ENVIRONMENT", "").lower() == "production" or
        os.getenv("ENVIRONMENT", "").lower() == "production"
    )

    payload = None
    is_verified = False

    if is_production:
        # PRODUCTION PATH: Cryptographically verify token via Firebase Admin SDK
        try:
            import firebase_admin
            from firebase_admin import auth as fb_auth

            if not firebase_admin._apps:
                from backend.database.firestore import get_firestore_client
                get_firestore_client()

            if not firebase_admin._apps:
                logger.error("Firebase Admin SDK is not initialized in production environment.")
                raise HTTPException(
                    status_code=401,
                    detail="Authentication failed: Firebase Admin verification service is unavailable."
                )

            # Cryptographically verify Firebase ID token (validates signature, expiration, audience)
            verified_claims = fb_auth.verify_id_token(token)
            payload = verified_claims
            is_verified = True
        except HTTPException:
            raise
        except Exception as e:
            logger.warning(f"Production Firebase token cryptographic verification failed: {e}")
            raise HTTPException(
                status_code=401,
                detail="Authentication failed: Invalid token signature."
            )

        if not payload or not isinstance(payload, dict):
            raise HTTPException(
                status_code=401,
                detail="Authentication failed: Invalid token signature."
            )

    else:
        # CONTROLLED LOCAL DEVELOPMENT / TEST MOCK PATH
        # Permitted ONLY when settings.USE_MOCK_FIRESTORE is True and ENVIRONMENT != 'production'

        # 1. Try real Firebase Admin verification if configured
        try:
            import firebase_admin
            from firebase_admin import auth as fb_auth
            if firebase_admin._apps:
                payload = fb_auth.verify_id_token(token)
                is_verified = True
        except Exception:
            pass

        # 2. Local test / mock token decode
        if payload is None:
            # Check structured test tokens like 'test_token_retailer_ret_001'
            if token.startswith("test_token_"):
                parts = token.split("_")
                role = parts[2] if len(parts) > 2 else "retailer"
                uid = "_".join(parts[3:]) if len(parts) > 3 else "test_user"
                payload = {
                    "uid": uid,
                    "role": role,
                    "email": f"{uid}@samooh.in",
                    "admin": (role in ("admin", "system"))
                }
                is_verified = (role in ("admin", "system"))

            # Check JSON test tokens
            elif token.startswith("{") and token.endswith("}"):
                try:
                    payload = json.loads(token)
                except Exception:
                    pass

            # Check standard 3-part JWT in local dev/mock mode
            elif "." in token:
                try:
                    payload = decode_jwt_unverified_payload(token)
                except Exception:
                    pass

        if not payload or not isinstance(payload, dict):
            raise HTTPException(
                status_code=401,
                detail="Authentication failed: Invalid or unparseable token."
            )

    uid = payload.get("uid") or payload.get("user_id") or payload.get("sub")
    if not uid:
        raise HTTPException(
            status_code=401,
            detail="Authentication failed: Token is missing user identification (uid)."
        )

    role = payload.get("role") or payload.get("user_role") or "retailer"
    email = payload.get("email")

    # Only grant admin privileges if claims were cryptographically verified or from trusted test tokens
    is_admin = bool(
        is_verified and (
            payload.get("admin") is True or 
            payload.get("is_admin") is True or 
            role in ("admin", "system")
        )
    )

    supplier_id = payload.get("supplier_id") or (uid if role == "supplier" else None)
    retailer_id = payload.get("retailer_id") or (uid if role == "retailer" else None)

    return AuthenticatedUser(
        uid=uid,
        email=email,
        role=role,
        is_admin=is_admin,
        supplier_id=supplier_id,
        retailer_id=retailer_id
    )


def require_admin_or_system(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
    """
    Restricts access to system administrators or trusted backend processes.
    Rejects unauthorized callers with 403 Forbidden.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=403,
            detail="Forbidden: Opportunity recalculation is restricted to system or admin roles."
        )
    return current_user


def sanitize_opportunity_for_user(opp: Dict[str, Any], user: AuthenticatedUser) -> Dict[str, Any]:
    """
    Sanitizes opportunity data according to role-based visibility and privacy principles:
    - Admins/System: Full internal access.
    - Retailers: Aggregated demand is visible; per-store competitor demands are masked/stripped.
    - Suppliers: Aggregated demand is visible; private retailer demand mapping is completely stripped.
      Competitor suppliers cannot see another supplier's inventory stock.
    """
    # Create clean shallow copy
    safe_opp = dict(opp)

    if user.is_admin:
        return safe_opp

    ret_demands = safe_opp.get("retailerDemands", {})
    ret_ids = safe_opp.get("retailerIds", [])

    if user.role == "retailer":
        # 1. Retailer Privacy: Strip competitors' exact demand mapping
        if user.uid in ret_ids:
            # Participant sees their own demand
            safe_opp["myDemand"] = ret_demands.get(user.uid)
        
        # Strip granular competitor demand mapping
        safe_opp.pop("retailerDemands", None)

        # Mask competitor store names to prevent competitor reconnaissance
        safe_opp.pop("retailerNames", None)
        safe_opp.pop("retailerIds", None)

    elif user.role == "supplier":
        # 2. Supplier Privacy: Never expose private retailer demand breakdown
        safe_opp.pop("retailerDemands", None)
        safe_opp.pop("retailerNames", None)
        safe_opp.pop("retailerIds", None)

        # If not the candidate supplier, mask competitor supplier available stock
        target_supplier_id = safe_opp.get("supplierId")
        if target_supplier_id and target_supplier_id != user.uid and target_supplier_id != user.supplier_id:
            safe_opp["supplierAvailableQuantity"] = None

    else:
        # Default restricted visibility
        safe_opp.pop("retailerDemands", None)
        safe_opp.pop("retailerNames", None)
        safe_opp.pop("retailerIds", None)

    return safe_opp
