from typing import Optional, List
from pydantic import BaseModel, Field
from models.supplier import PricingTier


class Supplier(BaseModel):
    id: str = Field(..., description="Unique supplier ID")
    name: str = Field(..., description="Supplier business name")
    location: str = Field(..., description="Warehouse hub location")
    rating: float = Field(default=4.7, description="Supplier reliability rating")
    lead_time_days: int = Field(default=2, description="Fulfillment lead time in days")


class Product(BaseModel):
    id: str = Field(..., description="Unique product ID")
    name: str = Field(..., description="Product name")
    category: str = Field(..., description="Category (Grains, Oils, Spices, Beverages, Personal Care)")
    unit_of_measure: str = Field(..., description="Unit (kg, liters, packs, boxes)")
    retail_price: float = Field(..., description="Standard single-unit price (INR)")
    wholesale_price: float = Field(..., description="Discounted bulk price (INR)")
    min_wholesale_quantity: float = Field(..., description="Minimum group aggregate quantity required for wholesale discount (MOQ)")
    supplier_id: str = Field(..., description="ID of the primary wholesale supplier")
    supplier_name: str = Field(..., description="Name of the primary wholesale supplier")
    unit_weight_kg: Optional[float] = Field(default=None, description="Physical weight of a single unit in kilograms")
    image_url: Optional[str] = Field(default=None, description="Product display image URL")
    
    # Commercial Terms & Inventory
    available_quantity: float = Field(default=500.0, description="Available warehouse inventory quantity")
    max_order_quantity: Optional[float] = Field(default=None, description="Maximum permitted order quantity")
    quantity_tiers: List[PricingTier] = Field(default_factory=list, description="Quantity-based volume pricing tiers")
    discount_pct: float = Field(default=0.0, description="Additional percentage discount applied on top of tier price")
    lead_time_days: int = Field(default=2, description="Fulfillment lead time in days")
    service_radius_km: float = Field(default=50.0, description="Maximum delivery radius from warehouse in km")
    is_available: bool = Field(default=True, description="Whether product is active and open for group procurement")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "prod_001",
                "name": "Sona Masoori Rice (25kg)",
                "category": "Grains",
                "unit_of_measure": "bag",
                "retail_price": 1450.0,
                "wholesale_price": 1180.0,
                "min_wholesale_quantity": 40.0,
                "supplier_id": "sup_01",
                "supplier_name": "Deccan Wholesale Grains",
                "available_quantity": 850.0,
                "service_radius_km": 60.0,
                "image_url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500"
            }
        }

