from fastapi import APIRouter, Query
from typing import List, Dict, Any, Optional
from backend.database.repository import repo

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
def get_products(
    category: Optional[str] = Query(None, description="Filter products by category (Grains, Oils, Spices, Beverages, Personal Care)")
) -> Dict[str, Any]:
    """
    Retrieves catalog of products with wholesale threshold pricing.
    """
    products = repo.get_all("products")

    if category:
        products = [p for p in products if p.get("category", "").lower() == category.lower()]

    return {
        "status": "success",
        "count": len(products),
        "data": products
    }


@router.get("/{product_id}")
def get_product_by_id(product_id: str) -> Dict[str, Any]:
    """
    Retrieves product details by product ID.
    """
    product = repo.get_by_id("products", product_id)
    if not product:
        return {"status": "error", "message": f"Product with ID '{product_id}' not found"}

    return {
        "status": "success",
        "data": product
    }
