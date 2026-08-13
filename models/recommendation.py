from typing import List
from pydantic import BaseModel, Field
from .pool import ProcurementPool
from .savings import SavingsBreakdown


class GroupRecommendation(BaseModel):
    id: str = Field(..., description="Unique recommendation ID")
    product_id: str = Field(..., description="Target product ID")
    product_name: str = Field(..., description="Target product name")
    category: str = Field(..., description="Product category")
    pool_id: str = Field(..., description="Associated procurement pool ID")
    retailer_ids: List[str] = Field(..., description="Retailer IDs in this recommended group")
    retailer_names: List[str] = Field(..., description="Retailer store names")
    threshold_status: str = Field(..., description="Status ('ACHIEVED', 'NEAR_THRESHOLD', 'IN_PROGRESS')")
    threshold_quantity: float = Field(..., description="Supplier wholesale threshold quantity")
    current_pool_quantity: float = Field(..., description="Current aggregated demand quantity")
    estimated_total_savings: float = Field(..., description="Total estimated savings in INR")
    estimated_savings_percentage: float = Field(..., description="Estimated percentage savings")
    average_cluster_distance_km: float = Field(..., description="Average spatial radius in km")
    explanation: str = Field(..., description="AI explainable natural language rationale")
    score: float = Field(..., description="Recommendation priority score (0.0 to 1.0)")
    created_at: str = Field(..., description="Recommendation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "rec_001",
                "product_id": "prod_001",
                "product_name": "Sona Masoori Rice (25kg)",
                "category": "Grains",
                "pool_id": "pool_101",
                "retailer_ids": ["ret_001", "ret_004", "ret_008", "ret_012"],
                "retailer_names": ["Sri Lakshmi Kirana", "Balaji Superette", "Venkateshwara Traders", "Bhavani Stores"],
                "threshold_status": "ACHIEVED",
                "threshold_quantity": 40.0,
                "current_pool_quantity": 42.0,
                "estimated_total_savings": 11340.0,
                "estimated_savings_percentage": 18.6,
                "average_cluster_distance_km": 2.45,
                "explanation": "Cluster of 4 Kirana stores within 2.45 km reach 42.0 bags (exceeding 40 bag threshold), unlocking 18.6% wholesale price reduction.",
                "score": 0.95,
                "created_at": "2026-08-13T12:00:00Z"
            }
        }
