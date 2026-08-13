from pydantic import BaseModel, Field


class DemandForecast(BaseModel):
    id: str = Field(..., description="Unique forecast ID")
    retailer_id: str = Field(..., description="Target retailer ID")
    product_id: str = Field(..., description="Target product ID")
    product_name: str = Field(..., description="Target product name")
    forecast_date: str = Field(..., description="Date when forecast was run")
    horizon_days: int = Field(default=30, description="Forecast period horizon in days")
    predicted_demand: float = Field(..., description="Predicted unit demand over horizon")
    model_used: str = Field(..., description="ML algorithm used (e.g. Random Forest Regressor, Moving Average)")
    confidence_score: float = Field(default=0.88, description="Model prediction R2 / confidence score")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "fc_001",
                "retailer_id": "ret_001",
                "product_id": "prod_001",
                "product_name": "Sona Masoori Rice (25kg)",
                "forecast_date": "2026-08-13",
                "horizon_days": 30,
                "predicted_demand": 12.5,
                "model_used": "Random Forest Regressor",
                "confidence_score": 0.92
            }
        }
