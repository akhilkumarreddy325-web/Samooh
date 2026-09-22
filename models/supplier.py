from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class PricingTier(BaseModel):
    min_quantity: float = Field(..., description="Minimum quantity to unlock this tier")
    max_quantity: Optional[float] = Field(default=None, description="Maximum quantity for this tier (None for unbound / 500+)")
    price_per_unit: float = Field(..., description="Wholesale price per unit for this quantity tier (INR)")


class SupplierProfile(BaseModel):
    id: str = Field(..., description="Unique supplier ID (e.g. sup_01)")
    name: str = Field(..., description="Business / Company name")
    contact_person: str = Field(..., description="Primary contact person name")
    email: str = Field(..., description="Supplier email address")
    phone: str = Field(..., description="Contact phone number")
    address: str = Field(..., description="Warehouse or business facility address")
    categories: List[str] = Field(default_factory=list, description="Categories supplied")
    service_radius_km: float = Field(default=50.0, description="Delivery or service radius in kilometers")
    lead_time_days: int = Field(default=2, description="Standard fulfillment lead time in days")
    rating: float = Field(default=4.8, description="Supplier reliability rating (out of 5)")
    status: str = Field(default="ACTIVE", description="Account status (ACTIVE, PENDING_VERIFICATION, SUSPENDED)")
    password: Optional[str] = Field(default="samooh123", description="Hashed or credential token")
    created_at: Optional[str] = Field(default=None, description="Account creation timestamp")


class SupplierProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit_of_measure: Optional[str] = None
    wholesale_price: Optional[float] = None
    min_wholesale_quantity: Optional[float] = Field(default=None, description="MOQ")
    max_order_quantity: Optional[float] = None
    available_quantity: Optional[float] = None
    unit_weight_kg: Optional[float] = None
    quantity_tiers: Optional[List[PricingTier]] = None
    discount_pct: Optional[float] = None
    lead_time_days: Optional[int] = None
    service_radius_km: Optional[float] = None
    is_available: Optional[bool] = None


class SupplierOrder(BaseModel):
    id: str = Field(..., description="Unique supplier order ID (e.g. sord_001)")
    order_no: str = Field(..., description="Human-readable invoice/order number (e.g. SORD-2026-8801)")
    supplier_id: str = Field(..., description="ID of the supplier fulfilling the order")
    pool_id: str = Field(..., description="Procurement pool ID")
    product_id: str = Field(..., description="Target product ID")
    product_name: str = Field(..., description="Product name")
    category: str = Field(default="General", description="Product category")
    retailer_count: int = Field(..., description="Number of participating retailers in this group")
    pooled_quantity: float = Field(..., description="Total aggregate quantity requested")
    unit: str = Field(default="units", description="Unit of measure")
    unit_weight_kg: float = Field(default=1.0, description="Weight of single unit in kg")
    total_weight_kg: float = Field(default=1.0, description="Total physical load weight in kg")
    
    # Commercial Terms & MOQ
    supplier_moq: float = Field(..., description="Supplier MOQ at order generation")
    moq_status: str = Field(default="SATISFIED", description="SATISFIED or DEFICIT")
    base_wholesale_price: float = Field(..., description="Standard wholesale base price (INR)")
    quantity_tier_price: float = Field(..., description="Price unlocked by pooled volume tier (INR)")
    discount_pct: float = Field(default=0.0, description="Percentage discount applied (%)")
    additional_discount: float = Field(default=0.0, description="Additional discount amount per unit (INR)")
    final_unit_price: float = Field(..., description="Final effective wholesale price per unit (INR)")
    gross_order_value: float = Field(..., description="Gross order amount before discounts (INR)")
    discount_amount: float = Field(default=0.0, description="Total discount savings granted (INR)")
    final_order_value: float = Field(..., description="Net payable order value (INR)")
    
    # Immutable Snapshots at Acceptance Time
    moq_at_acceptance: Optional[float] = Field(default=None, description="Frozen MOQ locked when supplier accepted")
    price_at_acceptance: Optional[float] = Field(default=None, description="Frozen unit price locked when supplier accepted")
    accepted_at: Optional[str] = Field(default=None, description="Timestamp of supplier acceptance")
    
    # Delivery & Transport Linkage
    delivery_cluster: str = Field(default="Hyderabad Cluster", description="Target delivery cluster hub")
    delivery_distance_km: float = Field(default=5.0, description="Estimated delivery distance from warehouse")
    estimated_delivery_time_days: int = Field(default=2, description="Estimated transit and delivery days")
    transport_info: Optional[Dict[str, Any]] = Field(default=None, description="Deterministic transport optimization recommendation")
    
    # Status Lifecycle: PENDING, ACCEPTED, PROCESSING, READY_FOR_DISPATCH, DISPATCHED, DELIVERED, REJECTED
    status: str = Field(default="PENDING", description="Order lifecycle status")
    rejection_reason: Optional[str] = Field(default=None, description="Reason if rejected by supplier")
    
    timeline: List[Dict[str, Any]] = Field(default_factory=list, description="Audit trail of status transitions")
    created_at: str = Field(..., description="Creation timestamp")
    updated_at: str = Field(..., description="Last update timestamp")
