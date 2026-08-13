from typing import List, Dict
from pydantic import BaseModel, Field


class ProcurementPool(BaseModel):
    id: str = Field(..., description="Unique procurement pool ID")
    product_id: str = Field(..., description="Product ID being group-procured")
    product_name: str = Field(..., description="Product name")
    supplier_id: str = Field(..., description="Wholesale supplier ID")
    retailer_ids: List[str] = Field(..., description="List of participating retailer IDs")
    retailer_demands: Dict[str, float] = Field(..., description="Map of retailer ID to their demand allocation")
    total_demand: float = Field(..., description="Aggregated total demand quantity")
    threshold_quantity: float = Field(..., description="Required wholesale quantity threshold")
    is_threshold_met: bool = Field(..., description="Whether group total meets/exceeds wholesale threshold")
    progress_percentage: float = Field(..., description="Percentage completion towards threshold")
    average_distance_km: float = Field(..., description="Average spatial distance between participating retailers")
    created_at: str = Field(..., description="Pool creation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "pool_101",
                "product_id": "prod_001",
                "product_name": "Sona Masoori Rice (25kg)",
                "supplier_id": "sup_01",
                "retailer_ids": ["ret_001", "ret_004", "ret_008", "ret_012"],
                "retailer_demands": {"ret_001": 12.0, "ret_004": 10.0, "ret_008": 11.0, "ret_012": 9.0},
                "total_demand": 42.0,
                "threshold_quantity": 40.0,
                "is_threshold_met": True,
                "progress_percentage": 105.0,
                "average_distance_km": 2.45,
                "created_at": "2026-08-13T12:00:00Z"
            }
        }
