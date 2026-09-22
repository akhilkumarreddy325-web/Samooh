import datetime
import logging
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, HTTPException, Query, Body
from backend.database.repository import repo
from models.supplier import SupplierProfile, SupplierOrder, SupplierProductUpdate
from models.product import Product
from services.supplier import supplier_service

logger = logging.getLogger("samooh.routers.suppliers")
router = APIRouter(prefix="/api/suppliers", tags=["Suppliers"])


# 1. Supplier Authentication & Registration
@router.get("/", response_model=List[Dict[str, Any]])
def list_suppliers():
    """List all registered suppliers."""
    return repo.get_all("suppliers")


@router.post("/register")
def register_supplier(data: Dict[str, Any] = Body(...)):
    """
    Registers a new wholesale supplier in the Samooh ecosystem.
    """
    email = data.get("email", "").strip().lower()
    name = data.get("name", "").strip()
    if not email or not name:
        raise HTTPException(status_code=400, detail="Supplier name and email are required.")

    # Check for existing
    existing = [s for s in repo.get_all("suppliers") if s.get("email", "").lower() == email]
    if existing:
        raise HTTPException(status_code=400, detail="A supplier with this email already exists.")

    sup_id = f"sup_{int(datetime.datetime.utcnow().timestamp())}"
    now_iso = datetime.datetime.utcnow().isoformat() + "Z"

    supplier_record = {
        "id": sup_id,
        "name": name,
        "contact_person": data.get("contact_person", name),
        "email": email,
        "phone": data.get("phone", "+91 98480 00000"),
        "address": data.get("address", "Hyderabad Industrial Zone"),
        "location": data.get("location", "Hyderabad"),
        "categories": data.get("categories", ["Grains", "Oils"]),
        "service_radius_km": float(data.get("service_radius_km", 50.0)),
        "lead_time_days": int(data.get("lead_time_days", 2)),
        "rating": 4.8,
        "status": "ACTIVE",
        "password": data.get("password", "samooh_supplier"),
        "created_at": now_iso
    }

    repo.set_document("suppliers", sup_id, supplier_record)
    logger.info(f"Registered new supplier: {name} ({sup_id})")
    return {"status": "success", "supplier": supplier_record}


@router.post("/login")
def login_supplier(credentials: Dict[str, str] = Body(...)):
    """
    Supplier authentication entry point.
    """
    email = credentials.get("email", "").strip().lower()
    password = credentials.get("password", "")

    suppliers = repo.get_all("suppliers")
    match = next((s for s in suppliers if s.get("email", "").lower() == email), None)

    if not match:
        raise HTTPException(status_code=401, detail="Supplier account not found with this email.")

    if match.get("password") and match.get("password") != password:
        raise HTTPException(status_code=401, detail="Invalid supplier credentials.")

    # Sanitize password out of response
    safe_profile = dict(match)
    safe_profile.pop("password", None)
    return {"status": "success", "supplier": safe_profile}


@router.get("/{supplier_id}/profile")
def get_supplier_profile(supplier_id: str):
    """Fetch supplier profile details."""
    supplier = repo.get_by_id("suppliers", supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")
    safe = dict(supplier)
    safe.pop("password", None)
    return safe


@router.put("/{supplier_id}/profile")
def update_supplier_profile(supplier_id: str, updates: Dict[str, Any] = Body(...)):
    """Update supplier business profile."""
    supplier = repo.get_by_id("suppliers", supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    for k in ["name", "contact_person", "phone", "address", "categories", "service_radius_km", "lead_time_days"]:
        if k in updates:
            supplier[k] = updates[k]

    repo.set_document("suppliers", supplier_id, supplier)
    return {"status": "success", "supplier": supplier}


# 2. Supplier Dashboard & Analytics
@router.get("/{supplier_id}/dashboard")
def get_supplier_dashboard(supplier_id: str):
    """
    Aggregated dashboard KPI metrics, inventory alerts, and recent orders.
    """
    supplier = repo.get_by_id("suppliers", supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    return supplier_service.get_supplier_dashboard_metrics(supplier_id)


@router.get("/{supplier_id}/analytics")
def get_supplier_analytics(supplier_id: str):
    """
    Supplier revenue analytics, discount metrics, and product breakdown.
    """
    supplier = repo.get_by_id("suppliers", supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    return supplier_service.get_supplier_analytics(supplier_id)


# 3. Supplier Products & Inventory Management (Enforcing Data Isolation)
@router.get("/{supplier_id}/products")
def get_supplier_products(supplier_id: str):
    """
    Returns only the products owned by the specified supplier.
    Ensures Supplier A cannot view or edit Supplier B's catalog.
    """
    all_products = repo.get_all("products")
    supplier_products = [p for p in all_products if p.get("supplier_id") == supplier_id]
    return supplier_products


@router.post("/{supplier_id}/products")
def add_supplier_product(supplier_id: str, product_data: Dict[str, Any] = Body(...)):
    """
    Supplier adds a new product to their catalog.
    """
    supplier = repo.get_by_id("suppliers", supplier_id)
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    prod_id = product_data.get("id") or f"prod_{int(datetime.datetime.utcnow().timestamp())}"
    
    new_product = {
        "id": prod_id,
        "name": product_data.get("name", "New Product"),
        "category": product_data.get("category", "General"),
        "unit_of_measure": product_data.get("unit_of_measure", "units"),
        "unit_weight_kg": float(product_data.get("unit_weight_kg", 1.0) or 1.0),
        "retail_price": float(product_data.get("retail_price", 100.0)),
        "wholesale_price": float(product_data.get("wholesale_price", 80.0)),
        "min_wholesale_quantity": float(product_data.get("min_wholesale_quantity", 30.0)),
        "available_quantity": float(product_data.get("available_quantity", 500.0)),
        "max_order_quantity": product_data.get("max_order_quantity"),
        "supplier_id": supplier_id,
        "supplier_name": supplier.get("name", f"Supplier {supplier_id}"),
        "quantity_tiers": product_data.get("quantity_tiers", []),
        "discount_pct": float(product_data.get("discount_pct", 0.0)),
        "lead_time_days": int(product_data.get("lead_time_days", supplier.get("lead_time_days", 2))),
        "service_radius_km": float(product_data.get("service_radius_km", supplier.get("service_radius_km", 50.0))),
        "is_available": product_data.get("is_available", True),
        "image_url": product_data.get("image_url", "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80")
    }

    repo.set_document("products", prod_id, new_product)
    logger.info(f"Supplier {supplier_id} added product: {new_product['name']} ({prod_id})")
    return {"status": "success", "product": new_product}


@router.put("/{supplier_id}/products/{product_id}")
def update_supplier_product(supplier_id: str, product_id: str, updates: Dict[str, Any] = Body(...)):
    """
    Supplier edits commercial terms of their product:
    wholesale price, MOQ, inventory, quantity tiers, radius, lead time, availability.
    Enforces that the product belongs to this supplier!
    """
    product = repo.get_by_id("products", product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if product.get("supplier_id") != supplier_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this product.")

    # Update allowed commercial attributes
    allowed_fields = [
        "name", "category", "unit_of_measure", "unit_weight_kg",
        "retail_price", "wholesale_price", "min_wholesale_quantity",
        "available_quantity", "max_order_quantity", "quantity_tiers",
        "discount_pct", "lead_time_days", "service_radius_km", "is_available", "image_url"
    ]

    for field in allowed_fields:
        if field in updates:
            product[field] = updates[field]

    repo.set_document("products", product_id, product)
    logger.info(f"Supplier {supplier_id} updated product {product_id}")
    return {"status": "success", "product": product}


@router.delete("/{supplier_id}/products/{product_id}")
def delete_supplier_product(supplier_id: str, product_id: str):
    """Soft disable or delete product owned by supplier."""
    product = repo.get_by_id("products", product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found.")

    if product.get("supplier_id") != supplier_id:
        raise HTTPException(status_code=403, detail="Forbidden: You do not own this product.")

    product["is_available"] = False
    repo.set_document("products", product_id, product)
    return {"status": "success", "message": f"Product {product_id} disabled."}


# 4. Supplier Orders Management
@router.get("/{supplier_id}/orders")
def get_supplier_orders(supplier_id: str, status: Optional[str] = Query(None)):
    """
    Returns orders assigned to this supplier.
    Ensures Supplier A cannot see Supplier B's orders.
    """
    all_orders = repo.get_all("supplierOrders")
    supplier_orders = [o for o in all_orders if o.get("supplier_id") == supplier_id]

    if status and status.upper() != "ALL":
        supplier_orders = [o for o in supplier_orders if o.get("status", "").upper() == status.upper()]

    # Sort newest first
    supplier_orders.sort(key=lambda x: x.get("created_at", ""), reverse=True)
    return supplier_orders


@router.get("/{supplier_id}/orders/{order_id}")
def get_supplier_order_detail(supplier_id: str, order_id: str):
    """Get single order details with security verification."""
    order = repo.get_by_id("supplierOrders", order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.get("supplier_id") != supplier_id:
        raise HTTPException(status_code=403, detail="Forbidden: Access to another supplier's order is denied.")

    return order


@router.post("/{supplier_id}/orders/{order_id}/validate-inventory")
def pre_validate_order_inventory(supplier_id: str, order_id: str):
    """
    Pre-checks warehouse inventory against order requested quantity.
    Returns sufficiency status and shortage details without mutating order.
    """
    order = repo.get_by_id("supplierOrders", order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")

    if order.get("supplier_id") != supplier_id:
        raise HTTPException(status_code=403, detail="Forbidden.")

    prod_id = order.get("product_id")
    product = repo.get_by_id("products", prod_id) or {}
    avail_stock = float(product.get("available_quantity", 0.0))
    req_qty = float(order.get("pooled_quantity", 0.0))

    check = supplier_service.validate_inventory(avail_stock, req_qty)
    return check


@router.post("/{supplier_id}/orders/{order_id}/status")
def update_order_status(
    supplier_id: str,
    order_id: str,
    payload: Dict[str, Any] = Body(...)
):
    """
    Updates order status:
    PENDING -> ACCEPTED / REJECTED -> PROCESSING -> READY_FOR_DISPATCH -> DISPATCHED -> DELIVERED.
    Validates warehouse inventory before accepting and locks acceptance snapshots!
    """
    new_status = payload.get("status", "").upper()
    reason = payload.get("reason")

    if not new_status:
        raise HTTPException(status_code=400, detail="New status is required.")

    try:
        updated_order = supplier_service.transition_order_status(
            order_id=order_id,
            supplier_id=supplier_id,
            new_status=new_status,
            rejection_reason=reason
        )
        return {"status": "success", "order": updated_order}
    except PermissionError as pe:
        raise HTTPException(status_code=403, detail=str(pe))
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        logger.error(f"Error transitioning order {order_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))
