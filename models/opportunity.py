from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class ProcurementOpportunity(BaseModel):
    """
    Standardized Procurement Opportunity Model.
    Represents an evaluated group buying opportunity matching retailer demand
    to wholesale supplier offerings with constraint validation.
    """
    opportunityId: str = Field(..., description="Unique deterministic opportunity ID")
    productId: str = Field(..., description="Target product ID")
    canonicalProductId: Optional[str] = Field(default=None, description="Canonical catalog product ID")
    productName: str = Field(..., description="Product display name")
    sectorId: Optional[str] = Field(default="grocery", description="Business sector ID")
    category: Optional[str] = Field(default="General", description="Product group / category")
    
    retailerIds: List[str] = Field(default_factory=list, description="IDs of participating retailers")
    retailerCount: int = Field(default=0, description="Total number of eligible demanding retailers")
    retailerDemands: Dict[str, float] = Field(default_factory=dict, description="Map of retailerId to demand quantity")
    retailerNames: List[str] = Field(default_factory=list, description="Store names of participating retailers")
    
    supplierId: Optional[str] = Field(default=None, description="Wholesale supplier ID")
    supplierName: Optional[str] = Field(default=None, description="Wholesale supplier business name")
    
    combinedQuantity: float = Field(default=0.0, description="Aggregated demand quantity across retailers")
    unit: str = Field(default="units", description="Unit of measure")
    
    supplierAvailableQuantity: Optional[float] = Field(default=None, description="Supplier verified stock on hand")
    supplierMOQ: Optional[float] = Field(default=None, description="Supplier minimum order quantity threshold")
    moqShortfall: float = Field(default=0.0, description="Demand deficit to meet supplier MOQ (0 if satisfied)")
    
    estimatedUnitPrice: Optional[float] = Field(default=None, description="Effective wholesale unit price")
    estimatedTotalValue: Optional[float] = Field(default=None, description="Gross procurement order value in INR")
    
    geographicDistanceKm: Optional[float] = Field(default=None, description="Average cluster distance between retailers")
    geographicFeasibility: str = Field(default="COMPATIBLE", description="COMPATIBLE, LOCATION_REQUIRED, or EXCEEDS_RADIUS")
    
    feasibility: str = Field(..., description="FEASIBLE, BELOW_MOQ, INSUFFICIENT_STOCK, NO_SUPPLIER, LOCATION_REQUIRED, PRODUCT_MISMATCH, ALREADY_IN_POOL, INVALID_DATA")
    status: str = Field(..., description="Operational status matching feasibility")
    
    opportunityScore: float = Field(default=0.0, description="Deterministic opportunity score between 0 and 100")
    scoreLabel: str = Field(default="Feasible", description="Human-readable score descriptor")
    
    reasons: List[str] = Field(default_factory=list, description="Calculated explainability reasons")
    constraints: List[str] = Field(default_factory=list, description="Active commercial and physical constraints")
    
    isAlreadyInPool: bool = Field(default=False, description="True if demand is already locked in an active pool")
    existingPoolId: Optional[str] = Field(default=None, description="ID of existing pool if committed")
    isDemo: bool = Field(default=False, description="Isolated demo data flag")
    
    createdAt: str = Field(..., description="Creation ISO timestamp")
    updatedAt: str = Field(..., description="Update ISO timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "opportunityId": "opp_9a7bc410d2",
                "productId": "prod_001",
                "canonicalProductId": "grocery_rice_basmati",
                "productName": "Basmati Rice (25kg Bag)",
                "sectorId": "grocery",
                "category": "Grains & Cereals",
                "retailerIds": ["ret_001", "ret_002", "ret_003"],
                "retailerCount": 3,
                "retailerDemands": {"ret_001": 25.0, "ret_002": 15.0, "ret_003": 20.0},
                "retailerNames": ["Sri Lakshmi Kirana", "Balaji Superette", "Sai Ram Provisions"],
                "supplierId": "sup_01",
                "supplierName": "Deccan Wholesale Grains",
                "combinedQuantity": 60.0,
                "unit": "bag",
                "supplierAvailableQuantity": 500.0,
                "supplierMOQ": 40.0,
                "moqShortfall": 0.0,
                "estimatedUnitPrice": 1180.0,
                "estimatedTotalValue": 70800.0,
                "geographicDistanceKm": 3.8,
                "geographicFeasibility": "COMPATIBLE",
                "feasibility": "FEASIBLE",
                "status": "FEASIBLE",
                "opportunityScore": 88.5,
                "scoreLabel": "Feasible",
                "reasons": [
                    "3 retailers need the same product (Basmati Rice)",
                    "Combined demand (60.0 bag) satisfies supplier MOQ (40.0 bag)",
                    "Supplier Deccan Wholesale Grains has 500.0 bag available",
                    "Average cluster distance is 3.8 km"
                ],
                "constraints": [
                    "Supplier MOQ: 40.0 bag",
                    "Supplier Stock: 500.0 bag",
                    "Delivery Distance: 3.8 km"
                ],
                "isAlreadyInPool": False,
                "existingPoolId": None,
                "isDemo": False,
                "createdAt": "2026-09-23T12:00:00Z",
                "updatedAt": "2026-09-23T12:00:00Z"
            }
        }
