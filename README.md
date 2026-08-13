# Samooh AI Backend Core

Samooh (समूह) is an AI-powered group procurement platform designed specifically for small kirana and retail store owners. By combining machine learning demand forecasting, spatial retailer clustering, and automated bulk procurement pooling, Samooh empowers small retailers to achieve wholesale quantity thresholds and unlock bulk volume discounts that were previously accessible only to giant retail chains.

---

## 🚀 Key Technical Features

1. **Dual-Mode Repository Layer** (`backend/database/repository.py`)
   - Firebase Firestore integration configured for project `samooh1`.
   - Built-in In-Memory fallback repository allowing zero-configuration instant local execution.
   - Collections managed: `retailers`, `products`, `sales`, `suppliers`, `forecasts`, `procurementPools`, `recommendations`.

2. **Realistic Demo Data Generator** (`backend/database/seed_data.py`)
   - Seeds **30 small retailers** mapped across realistic geographic clusters.
   - Seeds **20 catalog products** with retail prices, wholesale discount tiers, and supplier links.
   - Generates **6 months of daily sales history** incorporating day-of-week seasonality and noise.

3. **Demand Forecasting Engine** (`ai/forecasting.py`)
   - **Moving Average Baseline Model** for fast trend projection.
   - **Scikit-learn Random Forest Regressor Model** with feature engineering (day of week, lag variables, rolling statistics).

4. **Retailer Matching Engine** (`ai/matching.py`)
   - Spatial clustering via **Haversine Distance** calculation in kilometers.
   - Demand overlap & product similarity matching.
   - Generates **human-explainable AI match rationale**.

5. **Procurement & Savings Engines** (`services/procurement.py`, `services/savings.py`)
   - Validates aggregate demand against supplier `min_wholesale_quantity` thresholds.
   - Itemized financial breakdown: Individual Cost vs Samooh Pooled Wholesale Cost, Net Savings in INR, and Savings Percentage.

6. **Recommendation Engine** (`services/recommendation.py`)
   - Produces actionable, prioritized recommendations complete with AI natural language rationale and store involvement lists.

---

## 📂 Project Architecture

```
samooh/
├── backend/
│   ├── main.py                # FastAPI entry point & CORS configuration
│   ├── config.py              # Environment variables & settings
│   ├── database/
│   │   ├── firestore.py       # Firebase Firestore client setup
│   │   ├── repository.py      # Dual-mode repository layer
│   │   └── seed_data.py       # 30 retailers, 20 products, 6mo sales generator
│   └── routers/
│       ├── dashboard.py       # GET /dashboard & GET /impact
│       ├── retailers.py       # GET /retailers
│       ├── products.py        # GET /products
│       ├── forecasts.py       # GET /forecasts & POST /generate-forecasts
│       └── recommendations.py # GET /recommendations & POST /generate-recommendations
├── ai/
│   ├── forecasting.py         # Moving Average & Random Forest Regressor
│   └── matching.py            # Haversine distance & retailer matching
├── services/
│   ├── procurement.py        # Group pool formation & threshold validation
│   ├── savings.py            # Cost calculation & savings breakdown
│   └── recommendation.py     # End-to-end recommendation orchestrator
├── models/                    # Pydantic schemas (Retailer, Product, Sales, Forecast, Pool, Savings, Recommendation)
├── requirements.txt
├── README.md
└── API_DOCUMENTATION.md
```

---

## 🛠️ Installation & Execution

### 1. Prerequisites
- Python 3.9+ installed.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run FastAPI Application
```bash
python -m uvicorn backend.main:app --reload --port 8000
```
Or:
```bash
uvicorn backend.main:app --reload
```

The application automatically seeds initial data on first launch and opens interactive API documentation at:
- **Interactive Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`

---

## 📡 Core API Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/` | System health check & metadata |
| `GET` | `/dashboard` | High-level metrics, total community savings, and top pools |
| `GET` | `/impact` | Sustainability metrics (CO2 saved, logistics consolidation, ROI) |
| `GET` | `/retailers` | Fetch registered retailers list |
| `GET` | `/products` | Fetch catalog products with wholesale price tiers |
| `GET` | `/forecasts` | Retrieve ML predicted demand forecasts |
| `POST` | `/generate-forecasts` | Trigger the Demand Forecasting Engine |
| `GET` | `/recommendations` | Retrieve actionable group procurement recommendations |
| `POST` | `/generate-recommendations` | Trigger complete AI matching, pooling & recommendation pipeline |
| `POST` | `/seed-data` | Reset and populate demo dataset |

---

## 📄 License
MIT License - Developed for Samooh AI Procurement Platform.
