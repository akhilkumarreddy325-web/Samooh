from typing import Optional
from pydantic import BaseModel, Field


class RetailerBase(BaseModel):
    name: str = Field(..., description="Name of the retail store")
    store_type: str = Field(..., description="Type of store (e.g. Kirana, Superette, General Store)")
    latitude: float = Field(..., description="Geographic latitude")
    longitude: float = Field(..., description="Geographic longitude")
    address: str = Field(..., description="Store physical address")
    city: str = Field(default="Hyderabad", description="City location")
    pincode: str = Field(..., description="Postal code")
    contact_phone: str = Field(..., description="Contact phone number")
    monthly_budget: float = Field(default=50000.0, description="Estimated monthly procurement budget in INR")


class RetailerCreate(RetailerBase):
    pass


class Retailer(RetailerBase):
    id: str = Field(..., description="Unique retailer ID")
    rating: float = Field(default=4.5, description="Reliability rating out of 5")
    created_at: str = Field(..., description="Registration timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "id": "ret_001",
                "name": "Sri Lakshmi Kirana",
                "store_type": "Kirana",
                "latitude": 17.3850,
                "longitude": 78.4867,
                "address": "Road No 12, Banjara Hills",
                "city": "Hyderabad",
                "pincode": "500034",
                "contact_phone": "+91 9876543210",
                "monthly_budget": 75000.0,
                "rating": 4.8,
                "created_at": "2026-01-15T10:00:00Z"
            }
        }
