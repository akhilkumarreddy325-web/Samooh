from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field


class CompatibleProductDemand(BaseModel):
    """
    Shared canonical product demand between two retailers.
    """
    productId: str = Field(..., description="Canonical or catalog product ID")
    canonicalProductId: Optional[str] = Field(default=None, description="Canonical catalog product ID")
    productName: str = Field(..., description="Display name of the standardized product")
    unit: str = Field(default="units", description="Unit of measure")
    retailerAQuantity: Optional[float] = Field(default=None, description="Quantity required by Retailer A")
    retailerBQuantity: Optional[float] = Field(default=None, description="Quantity required by Retailer B")
    combinedQuantity: float = Field(default=0.0, description="Sum of demand quantities for this shared product")


class RetailerCompatibilityResult(BaseModel):
    """
    Evaluated deterministic compatibility between two retailers.
    Answers: 'Why should Retailer A be considered compatible with Retailer B for procurement pooling?'
    """
    compatibilityId: str = Field(..., description="Unique deterministic pair identifier")
    retailerAId: str = Field(..., description="ID of primary retailer")
    retailerBId: str = Field(..., description="ID of candidate partner retailer")
    retailerAName: Optional[str] = Field(default=None, description="Store name of Retailer A")
    retailerBName: Optional[str] = Field(default=None, description="Store name of Retailer B")
    
    sectorAId: Optional[str] = Field(default=None, description="Business sector of Retailer A")
    sectorBId: Optional[str] = Field(default=None, description="Business sector of Retailer B")
    isSameSector: bool = Field(default=False, description="True if both operate in the same sector")
    
    compatibilityStatus: str = Field(
        ..., 
        description="Operational status: COMPATIBLE, PARTIALLY_COMPATIBLE, NOT_COMPATIBLE, LOCATION_REQUIRED, or INSUFFICIENT_DATA"
    )
    compatibilityScore: float = Field(default=0.0, description="Deterministic overall compatibility score (0 to 100)")
    scoreLabel: str = Field(default="Limited Compatibility", description="Human-readable score label")
    
    # Sub-scores with explicit weights
    productMatchScore: float = Field(default=0.0, description="Product catalog overlap score (0 to 100)")
    distanceScore: float = Field(default=0.0, description="Spatial proximity score based on maximum radius (0 to 100)")
    quantityCompatibilityScore: float = Field(default=0.0, description="Volume compatibility score (0 to 100)")
    timingCompatibilityScore: float = Field(default=0.0, description="Restock window / timing alignment score (0 to 100)")
    sectorCompatibilityScore: float = Field(default=0.0, description="Business domain synergy score (0 to 100)")
    
    # Geographic metrics
    distanceKm: Optional[float] = Field(default=None, description="Haversine distance between store coordinates in km")
    maxRadiusKm: float = Field(default=10.0, description="Configured maximum compatibility radius in km")
    geographicStatus: str = Field(default="COMPATIBLE", description="COMPATIBLE, EXCEEDS_RADIUS, or LOCATION_REQUIRED")
    
    # Product breakdown
    compatibleProducts: List[CompatibleProductDemand] = Field(default_factory=list, description="Shared standardized products")
    aOnlyProducts: List[str] = Field(default_factory=list, description="Product IDs needed only by Retailer A")
    bOnlyProducts: List[str] = Field(default_factory=list, description="Product IDs needed only by Retailer B")
    totalSharedDemand: float = Field(default=0.0, description="Total aggregated demand across shared products")
    
    # Demand Timing
    timingCompatibility: str = Field(default="UNKNOWN", description="COMPATIBLE, INCOMPATIBLE, or UNKNOWN")
    
    # Explainability
    reasons: List[str] = Field(default_factory=list, description="Transparent explanations supporting compatibility")
    constraints: List[str] = Field(default_factory=list, description="Operational constraints to satisfy")
    exclusions: List[str] = Field(default_factory=list, description="Explicit reasons for rejection or partial incompatibility")
    
    calculatedAt: str = Field(..., description="ISO UTC timestamp of calculation")
    isDemo: bool = Field(default=False, description="True if based on demo/sample data")
