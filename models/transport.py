from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class VehicleFleetOption(BaseModel):
    """
    Fleet vehicle specification model for logistics planning.
    """
    id: str = Field(..., description="Unique vehicle model identifier")
    name: str = Field(..., description="Commercial vehicle model name")
    vehicle_type: str = Field(..., description="Category: 3W_ELECTRIC, SCV, MGV, HCV")
    capacity_kg: float = Field(..., description="Maximum payload weight in kilograms")
    base_rate_inr: float = Field(..., description="Base starting hire/dispatch fee")
    per_km_rate_inr: float = Field(..., description="Per-kilometer transit fee")
    max_service_radius_km: float = Field(..., description="Operational service radius from supplier hub")
    avg_speed_kmh: float = Field(..., description="Average transit speed including city congestion")
    is_available: bool = Field(default=True, description="Fleet vehicle operational availability")
    available_units: int = Field(default=5, description="Count of units currently available in cluster fleet")


class PooledInventorySummary(BaseModel):
    """
    Aggregated inventory summary for a finalized procurement group.
    """
    product_id: str = Field(..., description="Catalog product ID")
    product_name: str = Field(..., description="Product name")
    unit: str = Field(..., description="Unit of measure (e.g. bag, tin, pack, carton)")
    retailer_count: int = Field(..., description="Number of participating retailers")
    total_quantity: float = Field(..., description="Total aggregated units ordered across retailers")
    unit_weight_kg: Optional[float] = Field(default=None, description="Weight of single unit in kilograms")
    total_weight_kg: Optional[float] = Field(default=None, description="Total aggregated weight in kilograms")
    is_weight_estimated: bool = Field(default=False, description="Whether weight was estimated due to missing catalog weight")
    supplier_moq: float = Field(..., description="Supplier Minimum Order Quantity threshold")
    moq_satisfied: bool = Field(..., description="Whether pooled total meets or exceeds supplier MOQ")
    moq_deficit: float = Field(default=0.0, description="Shortfall quantity required to reach MOQ if not satisfied")
    retailer_demands: Dict[str, float] = Field(default_factory=dict, description="Itemized demand per retailer")
    retailer_weights: Dict[str, float] = Field(default_factory=dict, description="Itemized weight per retailer in kg")


class VehicleComparison(BaseModel):
    """
    Evaluation metrics for an evaluated fleet vehicle option.
    """
    vehicle_id: str
    vehicle_name: str
    capacity_kg: float
    capacity_utilization_pct: float
    is_feasible: bool
    estimated_cost_inr: float
    rejection_reason: Optional[str] = None


class TransportRecommendation(BaseModel):
    """
    Deterministic constraint-based transport plan for the pooled procurement group.
    """
    total_load_kg: float = Field(..., description="Total cargo weight in kilograms to be transported")
    total_quantity: float = Field(..., description="Total cargo units")
    unit: str = Field(..., description="Unit of measure")
    recommended_vehicle: str = Field(..., description="Primary recommended vehicle model")
    vehicle_type: str = Field(..., description="Vehicle category: 3W_ELECTRIC, SCV, MGV, HCV")
    vehicle_capacity_kg: float = Field(..., description="Capacity of single vehicle in kilograms")
    capacity_utilization: float = Field(..., description="Fraction of vehicle capacity utilized (0.0 - 1.0)")
    capacity_utilization_pct: float = Field(..., description="Percentage of vehicle capacity utilized")
    vehicles_required: int = Field(default=1, description="Number of vehicles needed to fulfill load")
    estimated_distance_km: float = Field(..., description="Delivery distance from supplier hub / cluster radius")
    estimated_transit_time_mins: int = Field(..., description="Estimated total transit and drop-off time in minutes")
    delivery_stops_count: int = Field(..., description="Number of retail store delivery locations")
    estimated_total_cost_inr: float = Field(..., description="Total estimated logistics cost for the pooled delivery")
    cost_per_retailer_inr: float = Field(..., description="Shared delivery cost per participating retailer")
    individual_transport_cost_inr: float = Field(..., description="Estimated cost if each retailer booked transport individually")
    transport_savings_inr: float = Field(..., description="Savings achieved from pooling transport")
    transport_status: str = Field(..., description="Status: SUITABLE, MULTI_VEHICLE_REQUIRED, UNDERUTILIZED, CAPACITY_SHORTFALL")
    reason: str = Field(..., description="Deterministic explainable reason based on multi-factor constraint comparison")
    vehicle_availability: str = Field(default="Available", description="Fleet availability status")
    alternative_options: List[VehicleComparison] = Field(default_factory=list, description="Evaluated alternative fleet options")
