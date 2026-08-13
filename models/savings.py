from typing import Dict
from pydantic import BaseModel, Field


class RetailerSavingsDetail(BaseModel):
    retailer_id: str = Field(..., description="Retailer ID")
    retailer_name: str = Field(..., description="Retailer store name")
    demand: float = Field(..., description="Allocated demand quantity")
    individual_cost: float = Field(..., description="Cost if purchased individually at retail price")
    pooled_cost: float = Field(..., description="Cost when purchased as part of Samooh pool at wholesale price")
    savings_amount: float = Field(..., description="Net savings in INR")
    savings_percentage: float = Field(..., description="Percentage discount saved")


class SavingsBreakdown(BaseModel):
    product_id: str = Field(..., description="Product ID")
    product_name: str = Field(..., description="Product name")
    unit_retail_price: float = Field(..., description="Individual retail price per unit")
    unit_wholesale_price: float = Field(..., description="Group wholesale price per unit")
    total_quantity: float = Field(..., description="Total aggregate pool quantity")
    total_individual_cost: float = Field(..., description="Sum of individual costs across all retailers")
    total_pooled_cost: float = Field(..., description="Sum of wholesale pooled costs")
    total_savings_amount: float = Field(..., description="Total community group savings in INR")
    total_savings_percentage: float = Field(..., description="Overall group discount savings percentage")
    retailer_breakdown: Dict[str, RetailerSavingsDetail] = Field(..., description="Map of retailer ID to individual savings details")
