import datetime
import logging
from typing import Dict, Any
from backend.database.repository import repo

logger = logging.getLogger("samooh.demo_seed")

def seed_deterministic_demo() -> Dict[str, Any]:
    """
    Seeds a 100% deterministic, mathematically consistent hackathon demo scenario:
    - Product: Parle-G 800g Family Pack
    - 5 Retailers with demands: 32, 24, 27, 21, 8 (Total = 112 units)
    - Supplier Wholesale Threshold: 100 units (ACHIEVED, 112% progress)
    - Retail Price: ₹120.00 | Wholesale Price: ₹95.00
    - Individual Cost: ₹13,440.00 | Pooled Cost: ₹10,640.00 | Savings: ₹2,800.00 (20.83%)
    """
    # 1. Clear existing collections
    for col in ["retailers", "products", "sales", "suppliers", "forecasts", "procurementPools", "recommendations"]:
        repo.clear_collection(col)

    # 2. Seed Supplier
    supplier_data = [{
        "id": "sup_parle",
        "name": "Parle Biscuits Pvt Ltd Direct Wholesale Hub",
        "location": "Kukatpally Industrial Estate, Hyderabad",
        "rating": 4.9,
        "lead_time_days": 1
    }]
    repo.save_bulk("suppliers", supplier_data)

    # 3. Seed Product
    product_data = [{
        "id": "prod_parle_g",
        "name": "Parle-G Biscuit 800g Family Pack",
        "category": "Beverages & Snacks",
        "unit_of_measure": "carton",
        "retail_price": 120.0,
        "wholesale_price": 95.0,
        "min_wholesale_quantity": 100.0,
        "supplier_id": "sup_parle",
        "supplier_name": "Parle Biscuits Pvt Ltd Direct Wholesale Hub",
        "image_url": "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80"
    }]
    repo.save_bulk("products", product_data)

    # 4. Seed 5 Retailers
    retailers_data = [
        {
            "id": "ret_demo_01",
            "name": "Sri Lakshmi Kirana & General Store",
            "store_type": "Kirana",
            "latitude": 17.3850,
            "longitude": 78.4867,
            "address": "Door No 42, Road No 12, Banjara Hills",
            "city": "Hyderabad",
            "pincode": "500034",
            "contact_phone": "+91 9876543210",
            "monthly_budget": 75000.0,
            "rating": 4.8,
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "ret_demo_02",
            "name": "Balaji Superette",
            "store_type": "Superette",
            "latitude": 17.3920,
            "longitude": 78.4910,
            "address": "Shop No 8, Banjara Hills Main Rd",
            "city": "Hyderabad",
            "pincode": "500034",
            "contact_phone": "+91 9876543211",
            "monthly_budget": 100000.0,
            "rating": 4.9,
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "ret_demo_03",
            "name": "Venkateshwara Traders",
            "store_type": "Kirana",
            "latitude": 17.3880,
            "longitude": 78.4820,
            "address": "Plot 15, Jubilee Hills Checkpost",
            "city": "Hyderabad",
            "pincode": "500033",
            "contact_phone": "+91 9876543212",
            "monthly_budget": 60000.0,
            "rating": 4.7,
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "ret_demo_04",
            "name": "Bhavani Provision Store",
            "store_type": "General Store",
            "latitude": 17.3750,
            "longitude": 78.4750,
            "address": "Door No 3, Panjagutta Colony",
            "city": "Hyderabad",
            "pincode": "500082",
            "contact_phone": "+91 9876543213",
            "monthly_budget": 45000.0,
            "rating": 4.6,
            "created_at": "2026-01-01T00:00:00Z"
        },
        {
            "id": "ret_demo_05",
            "name": "Sai Ram Kirana",
            "store_type": "Kirana",
            "latitude": 17.3810,
            "longitude": 78.4890,
            "address": "Somajiguda Market Yard",
            "city": "Hyderabad",
            "pincode": "500082",
            "contact_phone": "+91 9876543214",
            "monthly_budget": 80000.0,
            "rating": 4.8,
            "created_at": "2026-01-01T00:00:00Z"
        }
    ]
    repo.save_bulk("retailers", retailers_data)

    # 5. Seed Deterministic Forecasts (Demands: 32, 24, 27, 21, 8)
    demands_map = {
        "ret_demo_01": 32.0,
        "ret_demo_02": 24.0,
        "ret_demo_03": 27.0,
        "ret_demo_04": 21.0,
        "ret_demo_05": 8.0
    }
    
    forecasts_data = []
    for i, (ret_id, dem_qty) in enumerate(demands_map.items(), 1):
        fc = {
            "id": f"fc_demo_{i:02d}",
            "retailer_id": ret_id,
            "product_id": "prod_parle_g",
            "product_name": "Parle-G Biscuit 800g Family Pack",
            "forecast_date": datetime.date.today().isoformat(),
            "horizon_days": 30,
            "predicted_demand": dem_qty,
            "model_used": "Random Forest Regressor",
            "confidence_score": 0.94
        }
        forecasts_data.append(fc)
    repo.save_bulk("forecasts", forecasts_data)

    # 6. Seed Procurement Pool
    # Sum of demands = 32 + 24 + 27 + 21 + 8 = 112 units
    total_demand = 112.0
    threshold = 100.0
    progress_pct = round((total_demand / threshold) * 100, 1) # 112.0%

    pool_data = [{
        "id": "pool_demo_parle_g",
        "product_id": "prod_parle_g",
        "product_name": "Parle-G Biscuit 800g Family Pack",
        "supplier_id": "sup_parle",
        "retailer_ids": list(demands_map.keys()),
        "retailer_demands": demands_map,
        "total_demand": total_demand,
        "threshold_quantity": threshold,
        "is_threshold_met": True,
        "progress_percentage": progress_pct,
        "average_distance_km": 1.85,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }]
    repo.save_bulk("procurementPools", pool_data)

    # 7. Seed Recommendation
    # Savings: Individual = 112 * 120 = 13,440. Pooled = 112 * 95 = 10,640. Savings = 2,800 (20.83%)
    rec_data = [{
        "id": "rec_demo_parle_g",
        "product_id": "prod_parle_g",
        "product_name": "Parle-G Biscuit 800g Family Pack",
        "category": "Beverages & Snacks",
        "pool_id": "pool_demo_parle_g",
        "retailer_ids": list(demands_map.keys()),
        "retailer_names": [r["name"] for r in retailers_data],
        "threshold_status": "ACHIEVED",
        "threshold_quantity": 100.0,
        "current_pool_quantity": 112.0,
        "estimated_total_savings": 2800.0,
        "estimated_savings_percentage": 20.83,
        "average_cluster_distance_km": 1.85,
        "explanation": "A cluster of 5 nearby Kirana stores (within 1.85 km radius) has a combined 30-day forecast demand of 112 cartons of Parle-G 800g. This exceeds the supplier threshold of 100 cartons, unlocking an estimated total savings of ₹2,800.00 (20.83% wholesale discount).",
        "score": 0.98,
        "created_at": datetime.datetime.utcnow().isoformat() + "Z"
    }]
    repo.save_bulk("recommendations", rec_data)

    logger.info("Deterministic Hackathon Demo scenario seeded successfully.")
    return {
        "status": "success",
        "scenario": "Parle-G 800g Hackathon Demo",
        "product_name": "Parle-G Biscuit 800g Family Pack",
        "retailers_count": 5,
        "predicted_demands": demands_map,
        "total_demand": total_demand,
        "threshold_quantity": threshold,
        "threshold_status": "ACHIEVED",
        "progress_percentage": progress_pct,
        "retail_price_per_unit": 120.0,
        "wholesale_price_per_unit": 95.0,
        "unit_savings": 25.0,
        "total_individual_cost": 13440.0,
        "total_pooled_cost": 10640.0,
        "total_savings_inr": 2800.0,
        "savings_percentage": 20.83
    }
