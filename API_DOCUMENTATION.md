# Samooh AI Core API Documentation

Comprehensive API documentation for the **Samooh AI Backend Core** service.

Base URL: `http://localhost:8000`

---

## 1. Dashboard & Impact Endpoints

### `GET /dashboard`
Returns high-level summary metrics for executive dashboards.

**Response `200 OK`**:
```json
{
  "status": "success",
  "metrics": {
    "total_retailers": 30,
    "total_catalog_products": 20,
    "total_active_pools": 12,
    "pools_achieved_threshold": 9,
    "total_community_savings_inr": 84520.0,
    "total_forecasts_generated": 120,
    "total_recommendations": 12
  },
  "category_breakdown": {
    "Grains": 5,
    "Oils": 4,
    "Spices": 4,
    "Beverages": 4,
    "Personal Care": 3
  },
  "top_recommendations": []
}
```

---

### `GET /impact`
Retrieves sustainability and financial ROI metrics.

**Response `200 OK`**:
```json
{
  "status": "success",
  "impact": {
    "total_community_savings_inr": 84520.0,
    "average_group_discount_percentage": 18.5,
    "wholesale_threshold_success_rate": 75.0,
    "retailers_empowered": 30,
    "logistics_trips_consolidated": 24,
    "estimated_co2_reduction_kg": 100.8,
    "average_roi_per_retailer_inr": 2817.33
  }
}
```

---

## 2. Retailers Endpoints

### `GET /retailers`
Fetch all registered retailers. Supports filtering by store type and city.

**Query Parameters**:
- `store_type` (optional, string): e.g., `Kirana`, `Superette`, `General Store`
- `city` (optional, string): e.g., `Hyderabad`

**Response `200 OK`**:
```json
{
  "status": "success",
  "count": 30,
  "data": [
    {
      "id": "ret_001",
      "name": "Sri Lakshmi Kirana & General Store",
      "store_type": "Kirana",
      "latitude": 17.385,
      "longitude": 78.4867,
      "address": "Door No 42, Banjara Hills",
      "city": "Hyderabad",
      "pincode": "500034",
      "contact_phone": "+91 9876543210",
      "monthly_budget": 75000.0,
      "rating": 4.8,
      "created_at": "2025-10-01T00:00:00Z"
    }
  ]
}
```

---

### `GET /retailers/{retailer_id}`
Fetch a specific retailer by ID.

---

## 3. Products Endpoints

### `GET /products`
Fetch catalog products with wholesale price tiers.

**Query Parameters**:
- `category` (optional, string): e.g., `Grains`, `Oils`, `Spices`, `Beverages`, `Personal Care`

**Response `200 OK`**:
```json
{
  "status": "success",
  "count": 20,
  "data": [
    {
      "id": "prod_001",
      "name": "Sona Masoori Rice (25kg)",
      "category": "Grains",
      "unit_of_measure": "bag",
      "retail_price": 1450.0,
      "wholesale_price": 1180.0,
      "min_wholesale_quantity": 40.0,
      "supplier_id": "sup_01",
      "supplier_name": "Deccan Wholesale Grains & Pulses",
      "image_url": "https://images.unsplash.com/photo-1542838132-92c53300491e"
    }
  ]
}
```

---

## 4. Forecasts Endpoints

### `GET /forecasts`
Retrieve stored demand forecasts.

**Query Parameters**:
- `retailer_id` (optional, string)
- `product_id` (optional, string)

---

### `POST /generate-forecasts`
Triggers ML Forecasting Engine (Moving Average + Random Forest Regressor).

**Query Parameters**:
- `horizon_days` (optional, int, default: 30)

**Response `200 OK`**:
```json
{
  "status": "success",
  "message": "Successfully generated and stored 120 demand forecasts.",
  "count": 120,
  "horizon_days": 30
}
```

---

## 5. Recommendations & Workflow Endpoints

### `GET /recommendations`
Retrieve generated group procurement recommendations.

**Query Parameters**:
- `product_id` (optional, string)
- `threshold_status` (optional, string: `ACHIEVED`, `NEAR_THRESHOLD`, `IN_PROGRESS`)

**Response `200 OK`**:
```json
{
  "status": "success",
  "count": 12,
  "data": [
    {
      "id": "rec_001",
      "product_id": "prod_001",
      "product_name": "Sona Masoori Rice (25kg)",
      "category": "Grains",
      "pool_id": "pool_001",
      "retailer_ids": ["ret_001", "ret_002", "ret_005"],
      "retailer_names": [
        "Sri Lakshmi Kirana & General Store",
        "Balaji Superette",
        "Sai Ram Kirana"
      ],
      "threshold_status": "ACHIEVED",
      "threshold_quantity": 40.0,
      "current_pool_quantity": 43.5,
      "estimated_total_savings": 11745.0,
      "estimated_savings_percentage": 18.6,
      "average_cluster_distance_km": 1.25,
      "explanation": "A cluster of 3 nearby stores (within 1.25 km radius) has a combined 30-day forecast demand of 43.5 bag. This exceeds the supplier threshold of 40.0 bag, unlocking an estimated total savings of ₹11,745.00 (18.6% discount).",
      "score": 0.96,
      "created_at": "2026-08-13T15:00:00Z"
    }
  ]
}
```

---

### `POST /generate-recommendations`
Executes end-to-end matching, pooling, savings, and recommendation generation pipeline.

---

### `POST /seed-data`
Resets database collections and populates 30 retailers, 20 catalog products, 4 suppliers, and 6 months historical sales data.
