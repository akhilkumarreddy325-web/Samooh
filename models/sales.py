from pydantic import BaseModel, Field


class SaleRecord(BaseModel):
    id: str = Field(..., description="Unique sales record ID")
    retailer_id: str = Field(..., description="Retailer ID who made the sale")
    product_id: str = Field(..., description="Product ID sold")
    date: str = Field(..., description="Sale date string (YYYY-MM-DD)")
    quantity_sold: float = Field(..., description="Quantity sold on that day")
    revenue: float = Field(..., description="Total revenue generated")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "sale_1001",
                "retailer_id": "ret_001",
                "product_id": "prod_001",
                "date": "2026-06-01",
                "quantity_sold": 5.0,
                "revenue": 7250.0
            }
        }
