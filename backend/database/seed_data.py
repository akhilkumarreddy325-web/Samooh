import random
import datetime
import numpy as np
import pandas as pd
from typing import Dict, List, Any
from backend.database.repository import repo

# Set random seed for reproducibility
random.seed(42)
np.random.seed(42)

RETAILER_NAMES = [
    ("Sri Lakshmi Kirana & General Store", "Kirana", 17.3850, 78.4867, "Banjara Hills", "500034"),
    ("Balaji Superette", "Superette", 17.3920, 78.4910, "Banjara Hills", "500034"),
    ("Venkateshwara Traders", "Kirana", 17.3880, 78.4820, "Jubilee Hills", "500033"),
    ("Bhavani Provision Store", "General Store", 17.3750, 78.4750, "Panjagutta", "500082"),
    ("Sai Ram Kirana", "Kirana", 17.3810, 78.4890, "Somajiguda", "500082"),
    ("Maruti Wholesale & Retail", "Superette", 17.4010, 78.4980, "Ameerpet", "500016"),
    ("Ganesh General Store", "General Store", 17.4050, 78.4810, "Begumpet", "500016"),
    ("Durga Bhavani Kirana", "Kirana", 17.3690, 78.4680, "Lakdikapul", "500004"),
    ("Santhoshi Mata Provisions", "Kirana", 17.3620, 78.4720, "Khairatabad", "500004"),
    ("Shiva Super Market", "Superette", 17.4120, 78.5020, "Sanjeeva Reddy Nagar", "500038"),
    ("Krishna Kirana Store", "Kirana", 17.4200, 78.4480, "Madhapur", "500081"),
    ("Annapurna Traders", "General Store", 17.4310, 78.3810, "Gachibowli", "500032"),
    ("Nandi Superette", "Superette", 17.4420, 78.3880, "Kondapur", "500084"),
    ("Tulsi Kirana", "Kirana", 17.4490, 78.3750, "Hafeezpet", "500049"),
    ("Mahalaxmi General Store", "General Store", 17.4150, 78.4350, "Kavuri Hills", "500081"),
    ("Pavan Putra Kirana", "Kirana", 17.4520, 78.3620, "Miyapur", "500049"),
    ("Swagath Provisions", "Kirana", 17.4600, 78.3490, "Chanda Nagar", "500050"),
    ("Royal Superette", "Superette", 17.4050, 78.5480, "Uppal", "500039"),
    ("Kakatiya Kirana Store", "Kirana", 17.3650, 78.5250, "Dilsukhnagar", "500060"),
    ("Telangana General Store", "General Store", 17.3550, 78.5320, "Kothapet", "500035"),
    ("Charminar Provisions", "Kirana", 17.3610, 78.4740, "Old City", "500002"),
    ("Deccan Superette", "Superette", 17.3710, 78.4810, "Abids", "500001"),
    ("Nizam Kirana", "Kirana", 17.3820, 78.4710, "Nampally", "500001"),
    ("Metro Provisions", "General Store", 17.4410, 78.4980, "Secunderabad", "500003"),
    ("Paradise Kirana Store", "Kirana", 17.4390, 78.4890, "Paradise", "500003"),
    ("Sunshine Superette", "Superette", 17.4810, 78.5520, "ECIL", "500062"),
    ("Greenland Kirana", "Kirana", 17.4480, 78.5210, "Malkajgiri", "500047"),
    ("Heritage General Store", "General Store", 17.4290, 78.5410, "Tarnaka", "500007"),
    ("Bharat Provisions", "Kirana", 17.4110, 78.5120, "Shivam Road", "500044"),
    ("Navbharat Superette", "Superette", 17.3990, 78.5190, "Amberpet", "500013"),
]

SUPPLIERS_DATA = [
    {"id": "sup_01", "name": "Deccan Wholesale Grains & Pulses", "location": "Kukatpally Industrial Area", "rating": 4.8, "lead_time_days": 2},
    {"id": "sup_02", "name": "Telangana Oil Mills & Refineries", "location": "Kattedan Industrial Estate", "rating": 4.7, "lead_time_days": 1},
    {"id": "sup_03", "name": "South India Spice & Agri Hub", "location": "Malakpet Wholesale Market", "rating": 4.6, "lead_time_days": 3},
    {"id": "sup_04", "name": "FMCG Direct Distribution Ltd", "location": "Cherlapally Industrial Park", "rating": 4.9, "lead_time_days": 1},
]

PRODUCTS_DATA = [
    # Grains & Pulses
    ("Sona Masoori Rice (25kg)", "Grains", "bag", 1450.0, 1180.0, 40.0, "sup_01", "Deccan Wholesale Grains & Pulses"),
    ("Royal Toor Dal Premium (10kg)", "Grains", "bag", 1600.0, 1320.0, 30.0, "sup_01", "Deccan Wholesale Grains & Pulses"),
    ("Chana Dal Special (10kg)", "Grains", "bag", 850.0, 690.0, 35.0, "sup_01", "Deccan Wholesale Grains & Pulses"),
    ("Wheat Whole Whole-grain (50kg)", "Grains", "bag", 2100.0, 1750.0, 25.0, "sup_01", "Deccan Wholesale Grains & Pulses"),
    ("Moong Dal Washed (10kg)", "Grains", "bag", 1150.0, 940.0, 30.0, "sup_01", "Deccan Wholesale Grains & Pulses"),
    
    # Oils & Dairy
    ("Freedom Sunflower Oil (15L Tin)", "Oils", "tin", 1950.0, 1620.0, 35.0, "sup_02", "Telangana Oil Mills & Refineries"),
    ("Gold Drop Groundnut Oil (15L Tin)", "Oils", "tin", 2400.0, 1980.0, 25.0, "sup_02", "Telangana Oil Mills & Refineries"),
    ("Vijaya Pure Cow Ghee (1L Pack)", "Oils", "pack", 680.0, 560.0, 50.0, "sup_02", "Telangana Oil Mills & Refineries"),
    ("Mustard Oil Kachi Ghani (15L)", "Oils", "tin", 2100.0, 1720.0, 20.0, "sup_02", "Telangana Oil Mills & Refineries"),

    # Spices & Condiments
    ("Guntur Red Chilli Powder (5kg)", "Spices", "pack", 1750.0, 1390.0, 30.0, "sup_03", "South India Spice & Agri Hub"),
    ("Turmeric Powder Premium (5kg)", "Spices", "pack", 950.0, 750.0, 30.0, "sup_03", "South India Spice & Agri Hub"),
    ("Tata Iodized Salt (1kg x 24 Carton)", "Spices", "carton", 600.0, 480.0, 40.0, "sup_03", "South India Spice & Agri Hub"),
    ("Coriander Seeds / Dhaniya (5kg)", "Spices", "pack", 800.0, 620.0, 25.0, "sup_03", "South India Spice & Agri Hub"),

    # Beverages & Snacks
    ("Red Label Tea Master Pack (1kg x 12)", "Beverages", "carton", 4800.0, 3950.0, 20.0, "sup_04", "FMCG Direct Distribution Ltd"),
    ("Bru Instant Coffee (200g x 20 Pack)", "Beverages", "carton", 3600.0, 2980.0, 25.0, "sup_04", "FMCG Direct Distribution Ltd"),
    ("Britannia Good Day Biscuit Case", "Beverages", "box", 1200.0, 960.0, 45.0, "sup_04", "FMCG Direct Distribution Ltd"),
    ("Lays Chips Assorted Case (48 Packs)", "Beverages", "box", 960.0, 760.0, 50.0, "sup_04", "FMCG Direct Distribution Ltd"),

    # Personal Care & Household
    ("Surf Excel Easy Wash (1kg x 20)", "Personal Care", "carton", 2800.0, 2250.0, 30.0, "sup_04", "FMCG Direct Distribution Ltd"),
    ("Vim Dishwash Liquid (500ml x 24)", "Personal Care", "carton", 2500.0, 2020.0, 35.0, "sup_04", "FMCG Direct Distribution Ltd"),
    ("Dettol Bathing Soap (125g x 36 Pack)", "Personal Care", "carton", 2160.0, 1750.0, 40.0, "sup_04", "FMCG Direct Distribution Ltd"),
]


def seed_demo_data() -> Dict[str, Any]:
    """
    Seeds 30 retailers, 20 products, 4 suppliers, and 6 months of daily historical sales data.
    """
    logger_msg = []
    
    # 1. Clear existing collections
    for col in ["retailers", "products", "sales", "suppliers", "forecasts", "procurementPools", "recommendations"]:
        repo.clear_collection(col)

    # 2. Seed Suppliers
    repo.save_bulk("suppliers", SUPPLIERS_DATA)

    # 3. Seed Retailers (30 retailers)
    retailers_list = []
    for i, (name, stype, lat, lng, area, pin) in enumerate(RETAILER_NAMES, 1):
        ret_id = f"ret_{i:03d}"
        ret = {
            "id": ret_id,
            "name": name,
            "store_type": stype,
            "latitude": lat,
            "longitude": lng,
            "address": f"Door No {random.randint(1,99)}, {area}",
            "city": "Hyderabad",
            "pincode": pin,
            "contact_phone": f"+91 9876{random.randint(100000, 999999)}",
            "monthly_budget": float(random.choice([40000, 60000, 75000, 100000, 120000])),
            "rating": round(random.uniform(4.2, 4.9), 1),
            "created_at": "2025-10-01T00:00:00Z"
        }
        retailers_list.append(ret)

    repo.save_bulk("retailers", retailers_list)

    # 4. Seed Products (20 products)
    products_list = []
    for i, (pname, cat, uom, rprice, wprice, mqty, supid, supname) in enumerate(PRODUCTS_DATA, 1):
        pid = f"prod_{i:03d}"
        prod = {
            "id": pid,
            "name": pname,
            "category": cat,
            "unit_of_measure": uom,
            "retail_price": rprice,
            "wholesale_price": wprice,
            "min_wholesale_quantity": mqty,
            "supplier_id": supid,
            "supplier_name": supname,
            "image_url": f"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
        }
        products_list.append(prod)

    repo.save_bulk("products", products_list)

    # 5. Seed Historical Sales (6 months daily data = ~180 days)
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=180)

    sales_records = []
    sale_counter = 1000

    # To keep response fast & lightweight, generate realistic weekly aggregations / sample daily logs per retailer-product pair
    # Each retailer sells ~4 to 8 products out of the 20 catalog products
    date_range = pd.date_range(start=start_date, end=end_date, freq='D')

    for ret in retailers_list:
        # Select 5 specific core products for this retailer
        assigned_prods = random.sample(products_list, k=6)
        
        for prod in assigned_prods:
            base_daily_qty = random.uniform(0.3, 1.8) # Base daily demand
            
            for dt in date_range[::3]: # Every 3 days to simulate order pulses
                dt_str = dt.strftime("%Y-%m-%d")
                day_of_week = dt.weekday()
                
                # Seasonality: weekends (Fri/Sat/Sun) have +40% sales
                weekend_mult = 1.4 if day_of_week in [4, 5, 6] else 1.0
                
                # Random noise
                noise = random.uniform(0.7, 1.3)
                qty = round(max(0.5, base_daily_qty * weekend_mult * noise * 3), 1)
                rev = round(qty * prod["retail_price"], 2)

                sale_counter += 1
                record = {
                    "id": f"sale_{sale_counter}",
                    "retailer_id": ret["id"],
                    "product_id": prod["id"],
                    "date": dt_str,
                    "quantity_sold": qty,
                    "revenue": rev
                }
                sales_records.append(record)

    repo.save_bulk("sales", sales_records)

    return {
        "status": "success",
        "retailers_count": len(retailers_list),
        "products_count": len(products_list),
        "suppliers_count": len(SUPPLIERS_DATA),
        "sales_records_count": len(sales_records),
        "message": "Demo dataset successfully seeded with 30 retailers, 20 products, and 6 months historical sales data."
    }
