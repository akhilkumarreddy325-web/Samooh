import random
import datetime
from typing import Dict, List, Any
from backend.database.repository import repo

# Set random seed for reproducibility
random.seed(42)

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
    {
        "id": "sup_01",
        "name": "Deccan Wholesale Grains & Pulses",
        "contact_person": "Rajesh Agarwal",
        "email": "deccan@samooh.in",
        "phone": "+91 98480 12345",
        "address": "Plot 45, Phase 2, Kukatpally Industrial Area, Hyderabad (500072)",
        "location": "Kukatpally Industrial Area",
        "categories": ["Grains"],
        "service_radius_km": 60.0,
        "lead_time_days": 2,
        "rating": 4.8,
        "status": "ACTIVE",
        "password": "samooh_supplier",
        "created_at": "2025-09-01T00:00:00Z"
    },
    {
        "id": "sup_02",
        "name": "Telangana Oil Mills & Refineries",
        "contact_person": "K. Sudhakar Rao",
        "email": "telanganaoil@samooh.in",
        "phone": "+91 98490 23456",
        "address": "Shed 12, Kattedan Industrial Estate, Hyderabad (500077)",
        "location": "Kattedan Industrial Estate",
        "categories": ["Oils"],
        "service_radius_km": 50.0,
        "lead_time_days": 1,
        "rating": 4.7,
        "status": "ACTIVE",
        "password": "samooh_supplier",
        "created_at": "2025-09-05T00:00:00Z"
    },
    {
        "id": "sup_03",
        "name": "South India Spice & Agri Hub",
        "contact_person": "M. Venkatesh",
        "email": "spices@samooh.in",
        "phone": "+91 98491 34567",
        "address": "Gate 3, Malakpet Wholesale Market, Hyderabad (500036)",
        "location": "Malakpet Wholesale Market",
        "categories": ["Spices"],
        "service_radius_km": 45.0,
        "lead_time_days": 3,
        "rating": 4.6,
        "status": "ACTIVE",
        "password": "samooh_supplier",
        "created_at": "2025-09-10T00:00:00Z"
    },
    {
        "id": "sup_04",
        "name": "FMCG Direct Distribution Ltd",
        "contact_person": "Anand Sharma",
        "email": "fmcg@samooh.in",
        "phone": "+91 98492 45678",
        "address": "Sector 4, Cherlapally Industrial Park, Hyderabad (500051)",
        "location": "Cherlapally Industrial Park",
        "categories": ["Beverages", "Personal Care"],
        "service_radius_km": 70.0,
        "lead_time_days": 1,
        "rating": 4.9,
        "status": "ACTIVE",
        "password": "samooh_supplier",
        "created_at": "2025-09-15T00:00:00Z"
    },
    {
        "id": "sup_05",
        "name": "Southern Agro Mills & Wholesale",
        "contact_person": "P. Nageswara Rao",
        "email": "southernagro@samooh.in",
        "phone": "+91 98493 56789",
        "address": "Medchal Wholesale Agro Complex, Hyderabad (501401)",
        "location": "Medchal Agro Complex",
        "categories": ["Grains", "Oils"],
        "service_radius_km": 25.0,
        "lead_time_days": 2,
        "rating": 4.5,
        "status": "ACTIVE",
        "password": "samooh_supplier",
        "created_at": "2025-09-20T00:00:00Z"
    }
]

PRODUCTS_DATA = [
    # Grains & Pulses (sup_01)
    {
        "id": "prod_001",
        "name": "Sona Masoori Rice (25kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "retail_price": 1450.0,
        "wholesale_price": 1180.0,
        "min_wholesale_quantity": 40.0,
        "available_quantity": 850.0,
        "max_order_quantity": 1500.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "lead_time_days": 2,
        "service_radius_km": 60.0,
        "discount_pct": 2.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 39.0, "price_per_unit": 1250.0},
            {"min_quantity": 40.0, "max_quantity": 99.0, "price_per_unit": 1180.0},
            {"min_quantity": 100.0, "max_quantity": 299.0, "price_per_unit": 1140.0},
            {"min_quantity": 300.0, "max_quantity": None, "price_per_unit": 1090.0}
        ]
    },
    {
        "id": "prod_002",
        "name": "Royal Toor Dal Premium (10kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 10.0,
        "retail_price": 1600.0,
        "wholesale_price": 1320.0,
        "min_wholesale_quantity": 30.0,
        "available_quantity": 620.0,
        "max_order_quantity": 1000.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "lead_time_days": 2,
        "service_radius_km": 60.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 29.0, "price_per_unit": 1400.0},
            {"min_quantity": 30.0, "max_quantity": 79.0, "price_per_unit": 1320.0},
            {"min_quantity": 80.0, "max_quantity": None, "price_per_unit": 1260.0}
        ]
    },
    {
        "id": "prod_003",
        "name": "Chana Dal Special (10kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 10.0,
        "retail_price": 850.0,
        "wholesale_price": 690.0,
        "min_wholesale_quantity": 35.0,
        "available_quantity": 450.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "lead_time_days": 2,
        "service_radius_km": 60.0,
        "discount_pct": 1.5,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 34.0, "price_per_unit": 730.0},
            {"min_quantity": 35.0, "max_quantity": 99.0, "price_per_unit": 690.0},
            {"min_quantity": 100.0, "max_quantity": None, "price_per_unit": 650.0}
        ]
    },
    {
        "id": "prod_004",
        "name": "Wheat Whole Whole-grain (50kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 50.0,
        "retail_price": 2100.0,
        "wholesale_price": 1750.0,
        "min_wholesale_quantity": 25.0,
        "available_quantity": 380.0,
        "max_order_quantity": 600.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "lead_time_days": 2,
        "service_radius_km": 60.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 24.0, "price_per_unit": 1850.0},
            {"min_quantity": 25.0, "max_quantity": 69.0, "price_per_unit": 1750.0},
            {"min_quantity": 70.0, "max_quantity": None, "price_per_unit": 1680.0}
        ]
    },
    {
        "id": "prod_005",
        "name": "Moong Dal Washed (10kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 10.0,
        "retail_price": 1150.0,
        "wholesale_price": 940.0,
        "min_wholesale_quantity": 30.0,
        "available_quantity": 520.0,
        "max_order_quantity": 900.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "lead_time_days": 2,
        "service_radius_km": 60.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 29.0, "price_per_unit": 1020.0},
            {"min_quantity": 30.0, "max_quantity": 79.0, "price_per_unit": 940.0},
            {"min_quantity": 80.0, "max_quantity": None, "price_per_unit": 890.0}
        ]
    },

    # Oils & Dairy (sup_02)
    {
        "id": "prod_006",
        "name": "Freedom Sunflower Oil (15L Tin)",
        "category": "Oils",
        "unit_of_measure": "tin",
        "unit_weight_kg": 14.2,
        "retail_price": 1950.0,
        "wholesale_price": 1620.0,
        "min_wholesale_quantity": 35.0,
        "available_quantity": 700.0,
        "max_order_quantity": 1200.0,
        "supplier_id": "sup_02",
        "supplier_name": "Telangana Oil Mills & Refineries",
        "lead_time_days": 1,
        "service_radius_km": 50.0,
        "discount_pct": 3.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 34.0, "price_per_unit": 1720.0},
            {"min_quantity": 35.0, "max_quantity": 99.0, "price_per_unit": 1620.0},
            {"min_quantity": 100.0, "max_quantity": None, "price_per_unit": 1540.0}
        ]
    },
    {
        "id": "prod_007",
        "name": "Gold Drop Groundnut Oil (15L Tin)",
        "category": "Oils",
        "unit_of_measure": "tin",
        "unit_weight_kg": 13.8,
        "retail_price": 2400.0,
        "wholesale_price": 1980.0,
        "min_wholesale_quantity": 25.0,
        "available_quantity": 420.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_02",
        "supplier_name": "Telangana Oil Mills & Refineries",
        "lead_time_days": 1,
        "service_radius_km": 50.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 24.0, "price_per_unit": 2100.0},
            {"min_quantity": 25.0, "max_quantity": 74.0, "price_per_unit": 1980.0},
            {"min_quantity": 75.0, "max_quantity": None, "price_per_unit": 1890.0}
        ]
    },
    {
        "id": "prod_008",
        "name": "Vijaya Pure Cow Ghee (1L Pack)",
        "category": "Oils",
        "unit_of_measure": "pack",
        "unit_weight_kg": 0.95,
        "retail_price": 680.0,
        "wholesale_price": 560.0,
        "min_wholesale_quantity": 50.0,
        "available_quantity": 900.0,
        "max_order_quantity": 1500.0,
        "supplier_id": "sup_02",
        "supplier_name": "Telangana Oil Mills & Refineries",
        "lead_time_days": 1,
        "service_radius_km": 50.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 49.0, "price_per_unit": 610.0},
            {"min_quantity": 50.0, "max_quantity": 149.0, "price_per_unit": 560.0},
            {"min_quantity": 150.0, "max_quantity": None, "price_per_unit": 525.0}
        ]
    },
    {
        "id": "prod_009",
        "name": "Mustard Oil Kachi Ghani (15L)",
        "category": "Oils",
        "unit_of_measure": "tin",
        "unit_weight_kg": 14.0,
        "retail_price": 2100.0,
        "wholesale_price": 1720.0,
        "min_wholesale_quantity": 20.0,
        "available_quantity": 310.0,
        "max_order_quantity": 600.0,
        "supplier_id": "sup_02",
        "supplier_name": "Telangana Oil Mills & Refineries",
        "lead_time_days": 1,
        "service_radius_km": 50.0,
        "discount_pct": 2.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 19.0, "price_per_unit": 1820.0},
            {"min_quantity": 20.0, "max_quantity": 59.0, "price_per_unit": 1720.0},
            {"min_quantity": 60.0, "max_quantity": None, "price_per_unit": 1640.0}
        ]
    },

    # Spices & Condiments (sup_03)
    {
        "id": "prod_010",
        "name": "Guntur Red Chilli Powder (5kg)",
        "category": "Spices",
        "unit_of_measure": "pack",
        "unit_weight_kg": 5.0,
        "retail_price": 1750.0,
        "wholesale_price": 1390.0,
        "min_wholesale_quantity": 30.0,
        "available_quantity": 640.0,
        "max_order_quantity": 1000.0,
        "supplier_id": "sup_03",
        "supplier_name": "South India Spice & Agri Hub",
        "lead_time_days": 3,
        "service_radius_km": 45.0,
        "discount_pct": 2.5,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 29.0, "price_per_unit": 1500.0},
            {"min_quantity": 30.0, "max_quantity": 79.0, "price_per_unit": 1390.0},
            {"min_quantity": 80.0, "max_quantity": None, "price_per_unit": 1310.0}
        ]
    },
    {
        "id": "prod_011",
        "name": "Turmeric Powder Premium (5kg)",
        "category": "Spices",
        "unit_of_measure": "pack",
        "unit_weight_kg": 5.0,
        "retail_price": 950.0,
        "wholesale_price": 750.0,
        "min_wholesale_quantity": 30.0,
        "available_quantity": 510.0,
        "max_order_quantity": 900.0,
        "supplier_id": "sup_03",
        "supplier_name": "South India Spice & Agri Hub",
        "lead_time_days": 3,
        "service_radius_km": 45.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 29.0, "price_per_unit": 820.0},
            {"min_quantity": 30.0, "max_quantity": 79.0, "price_per_unit": 750.0},
            {"min_quantity": 80.0, "max_quantity": None, "price_per_unit": 695.0}
        ]
    },
    {
        "id": "prod_012",
        "name": "Tata Iodized Salt (1kg x 24 Carton)",
        "category": "Spices",
        "unit_of_measure": "carton",
        "unit_weight_kg": 24.0,
        "retail_price": 600.0,
        "wholesale_price": 480.0,
        "min_wholesale_quantity": 40.0,
        "available_quantity": 850.0,
        "max_order_quantity": 1200.0,
        "supplier_id": "sup_03",
        "supplier_name": "South India Spice & Agri Hub",
        "lead_time_days": 3,
        "service_radius_km": 45.0,
        "discount_pct": 1.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 39.0, "price_per_unit": 520.0},
            {"min_quantity": 40.0, "max_quantity": 99.0, "price_per_unit": 480.0},
            {"min_quantity": 100.0, "max_quantity": None, "price_per_unit": 450.0}
        ]
    },
    {
        "id": "prod_013",
        "name": "Coriander Seeds / Dhaniya (5kg)",
        "category": "Spices",
        "unit_of_measure": "pack",
        "unit_weight_kg": 5.0,
        "retail_price": 800.0,
        "wholesale_price": 620.0,
        "min_wholesale_quantity": 25.0,
        "available_quantity": 390.0,
        "max_order_quantity": 700.0,
        "supplier_id": "sup_03",
        "supplier_name": "South India Spice & Agri Hub",
        "lead_time_days": 3,
        "service_radius_km": 45.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 24.0, "price_per_unit": 690.0},
            {"min_quantity": 25.0, "max_quantity": 59.0, "price_per_unit": 620.0},
            {"min_quantity": 60.0, "max_quantity": None, "price_per_unit": 570.0}
        ]
    },

    # Beverages & Snacks (sup_04)
    {
        "id": "prod_014",
        "name": "Red Label Tea Master Pack (1kg x 12)",
        "category": "Beverages",
        "unit_of_measure": "carton",
        "unit_weight_kg": 12.0,
        "retail_price": 4800.0,
        "wholesale_price": 3950.0,
        "min_wholesale_quantity": 20.0,
        "available_quantity": 450.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 3.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 19.0, "price_per_unit": 4200.0},
            {"min_quantity": 20.0, "max_quantity": 49.0, "price_per_unit": 3950.0},
            {"min_quantity": 50.0, "max_quantity": None, "price_per_unit": 3720.0}
        ]
    },
    {
        "id": "prod_015",
        "name": "Bru Instant Coffee (200g x 20 Pack)",
        "category": "Beverages",
        "unit_of_measure": "carton",
        "unit_weight_kg": 4.0,
        "retail_price": 3600.0,
        "wholesale_price": 2980.0,
        "min_wholesale_quantity": 25.0,
        "available_quantity": 510.0,
        "max_order_quantity": 900.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 24.0, "price_per_unit": 3200.0},
            {"min_quantity": 25.0, "max_quantity": 69.0, "price_per_unit": 2980.0},
            {"min_quantity": 70.0, "max_quantity": None, "price_per_unit": 2820.0}
        ]
    },
    {
        "id": "prod_016",
        "name": "Britannia Good Day Biscuit Case",
        "category": "Beverages",
        "unit_of_measure": "box",
        "unit_weight_kg": 8.5,
        "retail_price": 1200.0,
        "wholesale_price": 960.0,
        "min_wholesale_quantity": 45.0,
        "available_quantity": 680.0,
        "max_order_quantity": 1100.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 1.5,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 44.0, "price_per_unit": 1040.0},
            {"min_quantity": 45.0, "max_quantity": 99.0, "price_per_unit": 960.0},
            {"min_quantity": 100.0, "max_quantity": None, "price_per_unit": 910.0}
        ]
    },
    {
        "id": "prod_017",
        "name": "Lays Chips Assorted Case (48 Packs)",
        "category": "Beverages",
        "unit_of_measure": "box",
        "unit_weight_kg": 2.5,
        "retail_price": 960.0,
        "wholesale_price": 760.0,
        "min_wholesale_quantity": 50.0,
        "available_quantity": 740.0,
        "max_order_quantity": 1300.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 49.0, "price_per_unit": 820.0},
            {"min_quantity": 50.0, "max_quantity": 119.0, "price_per_unit": 760.0},
            {"min_quantity": 120.0, "max_quantity": None, "price_per_unit": 715.0}
        ]
    },

    # Personal Care & Household (sup_04)
    {
        "id": "prod_018",
        "name": "Surf Excel Easy Wash (1kg x 20)",
        "category": "Personal Care",
        "unit_of_measure": "carton",
        "unit_weight_kg": 20.0,
        "retail_price": 2800.0,
        "wholesale_price": 2250.0,
        "min_wholesale_quantity": 30.0,
        "available_quantity": 490.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 2.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 29.0, "price_per_unit": 2420.0},
            {"min_quantity": 30.0, "max_quantity": 79.0, "price_per_unit": 2250.0},
            {"min_quantity": 80.0, "max_quantity": None, "price_per_unit": 2130.0}
        ]
    },
    {
        "id": "prod_019",
        "name": "Vim Dishwash Liquid (500ml x 24)",
        "category": "Personal Care",
        "unit_of_measure": "carton",
        "unit_weight_kg": 12.5,
        "retail_price": 2500.0,
        "wholesale_price": 2020.0,
        "min_wholesale_quantity": 35.0,
        "available_quantity": 530.0,
        "max_order_quantity": 900.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 34.0, "price_per_unit": 2180.0},
            {"min_quantity": 35.0, "max_quantity": 89.0, "price_per_unit": 2020.0},
            {"min_quantity": 90.0, "max_quantity": None, "price_per_unit": 1920.0}
        ]
    },
    {
        "id": "prod_020",
        "name": "Dettol Bathing Soap (125g x 36 Pack)",
        "category": "Personal Care",
        "unit_of_measure": "carton",
        "unit_weight_kg": 4.5,
        "retail_price": 2160.0,
        "wholesale_price": 1750.0,
        "min_wholesale_quantity": 40.0,
        "available_quantity": 620.0,
        "max_order_quantity": 1000.0,
        "supplier_id": "sup_04",
        "supplier_name": "FMCG Direct Distribution Ltd",
        "lead_time_days": 1,
        "service_radius_km": 70.0,
        "discount_pct": 2.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 39.0, "price_per_unit": 1890.0},
            {"min_quantity": 40.0, "max_quantity": 99.0, "price_per_unit": 1750.0},
            {"min_quantity": 100.0, "max_quantity": None, "price_per_unit": 1660.0}
        ]
    },

    # Competing Alternate Product Offerings (from sup_05: Southern Agro Mills)
    # Enables live demonstration of multi-supplier feasibility filtering:
    # sup_05 has higher MOQ (80 bags vs 40 bags) or smaller radius (25km vs 60km)
    {
        "id": "prod_021",
        "name": "Sona Masoori Rice (25kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "retail_price": 1450.0,
        "wholesale_price": 1150.0,
        "min_wholesale_quantity": 80.0,  # Higher MOQ
        "available_quantity": 350.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_05",
        "supplier_name": "Southern Agro Mills & Wholesale",
        "lead_time_days": 2,
        "service_radius_km": 25.0,  # Smaller radius
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 80.0, "max_quantity": 199.0, "price_per_unit": 1150.0},
            {"min_quantity": 200.0, "max_quantity": None, "price_per_unit": 1100.0}
        ]
    },
    {
        "id": "prod_022",
        "name": "Freedom Sunflower Oil (15L Tin)",
        "category": "Oils",
        "unit_of_measure": "tin",
        "unit_weight_kg": 14.2,
        "retail_price": 1950.0,
        "wholesale_price": 1590.0,
        "min_wholesale_quantity": 60.0,
        "available_quantity": 200.0,
        "max_order_quantity": 500.0,
        "supplier_id": "sup_05",
        "supplier_name": "Southern Agro Mills & Wholesale",
        "lead_time_days": 2,
        "service_radius_km": 25.0,
        "discount_pct": 0.0,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 60.0, "max_quantity": 149.0, "price_per_unit": 1590.0},
            {"min_quantity": 150.0, "max_quantity": None, "price_per_unit": 1520.0}
        ]
    }
]


def seed_demo_data() -> Dict[str, Any]:
    """
    Seeds 30 retailers, 22 products, 5 suppliers, 6 months historical sales data,
    and initial representative supplier orders across lifecycle states.
    """
    # 1. Clear existing collections
    for col in ["retailers", "products", "sales", "suppliers", "forecasts", "procurementPools", "recommendations", "supplierOrders"]:
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

    # 4. Seed Products
    products_list = []
    for prod in PRODUCTS_DATA:
        p_copy = dict(prod)
        p_copy["image_url"] = f"https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80"
        products_list.append(p_copy)

    repo.save_bulk("products", products_list)

    # 5. Seed Historical Sales
    end_date = datetime.date.today()
    start_date = end_date - datetime.timedelta(days=180)

    sales_records = []
    sale_counter = 1000
    date_list = [start_date + datetime.timedelta(days=d) for d in range(0, 181, 3)]

    # Use first 20 products for sales
    core_catalog = products_list[:20]

    for ret in retailers_list:
        assigned_prods = random.sample(core_catalog, k=6)
        for prod in assigned_prods:
            base_daily_qty = random.uniform(0.3, 1.8)
            for dt in date_list:
                dt_str = dt.strftime("%Y-%m-%d")
                day_of_week = dt.weekday()
                weekend_mult = 1.4 if day_of_week in [4, 5, 6] else 1.0
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

    # 6. Seed Representative Initial Supplier Orders
    now = datetime.datetime.utcnow()
    initial_supplier_orders = [
        {
            "id": "sord_init_001",
            "order_no": "SORD-2026-8801",
            "supplier_id": "sup_01",
            "pool_id": "pool_101",
            "product_id": "prod_001",
            "product_name": "Sona Masoori Rice (25kg)",
            "category": "Grains",
            "retailer_count": 4,
            "pooled_quantity": 50.0,
            "unit": "bag",
            "unit_weight_kg": 25.0,
            "total_weight_kg": 1250.0,
            "supplier_moq": 40.0,
            "moq_status": "SATISFIED",
            "base_wholesale_price": 1180.0,
            "quantity_tier_price": 1180.0,
            "discount_pct": 2.0,
            "additional_discount": 23.6,
            "final_unit_price": 1156.4,
            "gross_order_value": 59000.0,
            "discount_amount": 1180.0,
            "final_order_value": 57820.0,
            "moq_at_acceptance": 40.0,
            "price_at_acceptance": 1156.4,
            "accepted_at": (now - datetime.timedelta(days=2)).isoformat() + "Z",
            "delivery_cluster": "Hyderabad South-West Cluster #4",
            "delivery_distance_km": 3.8,
            "estimated_delivery_time_days": 2,
            "transport_info": {
                "recommended_vehicle": "Medium Goods Vehicle (MGV) / Eicher Pro",
                "vehicle_capacity_kg": 2500.0,
                "total_load_kg": 1250.0,
                "capacity_utilization_pct": 50.0,
                "vehicles_required": 1,
                "estimated_transport_cost_inr": 1521.6,
                "cost_per_retailer_inr": 380.4,
                "transit_time_minutes": 16
            },
            "status": "PROCESSING",
            "rejection_reason": None,
            "timeline": [
                {"status": "PENDING", "timestamp": (now - datetime.timedelta(days=3)).isoformat() + "Z", "description": "Order pooled by 4 Kirana retailers", "actor": "SYSTEM"},
                {"status": "ACCEPTED", "timestamp": (now - datetime.timedelta(days=2)).isoformat() + "Z", "description": "Order accepted by Deccan Wholesale Grains", "actor": "SUPPLIER (sup_01)"},
                {"status": "PROCESSING", "timestamp": (now - datetime.timedelta(days=1)).isoformat() + "Z", "description": "Bags batched and staged at warehouse", "actor": "SUPPLIER (sup_01)"}
            ],
            "created_at": (now - datetime.timedelta(days=3)).isoformat() + "Z",
            "updated_at": (now - datetime.timedelta(days=1)).isoformat() + "Z"
        },
        {
            "id": "sord_init_002",
            "order_no": "SORD-2026-8802",
            "supplier_id": "sup_01",
            "pool_id": "pool_102",
            "product_id": "prod_002",
            "product_name": "Royal Toor Dal Premium (10kg)",
            "category": "Grains",
            "retailer_count": 3,
            "pooled_quantity": 38.0,
            "unit": "bag",
            "unit_weight_kg": 10.0,
            "total_weight_kg": 380.0,
            "supplier_moq": 30.0,
            "moq_status": "SATISFIED",
            "base_wholesale_price": 1320.0,
            "quantity_tier_price": 1320.0,
            "discount_pct": 0.0,
            "additional_discount": 0.0,
            "final_unit_price": 1320.0,
            "gross_order_value": 50160.0,
            "discount_amount": 0.0,
            "final_order_value": 50160.0,
            "moq_at_acceptance": None,
            "price_at_acceptance": None,
            "accepted_at": None,
            "delivery_cluster": "Hyderabad Central Cluster #2",
            "delivery_distance_km": 4.2,
            "estimated_delivery_time_days": 2,
            "transport_info": {
                "recommended_vehicle": "3-Wheeler E-Loader / Piaggio Ape E-City",
                "vehicle_capacity_kg": 500.0,
                "total_load_kg": 380.0,
                "capacity_utilization_pct": 76.0,
                "vehicles_required": 1,
                "estimated_transport_cost_inr": 413.0,
                "cost_per_retailer_inr": 137.67,
                "transit_time_minutes": 20
            },
            "status": "PENDING",
            "rejection_reason": None,
            "timeline": [
                {"status": "PENDING", "timestamp": now.isoformat() + "Z", "description": "Incoming pooled order waiting for supplier review", "actor": "SYSTEM"}
            ],
            "created_at": now.isoformat() + "Z",
            "updated_at": now.isoformat() + "Z"
        },
        {
            "id": "sord_init_003",
            "order_no": "SORD-2026-8803",
            "supplier_id": "sup_02",
            "pool_id": "pool_103",
            "product_id": "prod_006",
            "product_name": "Freedom Sunflower Oil (15L Tin)",
            "category": "Oils",
            "retailer_count": 5,
            "pooled_quantity": 42.0,
            "unit": "tin",
            "unit_weight_kg": 14.2,
            "total_weight_kg": 596.4,
            "supplier_moq": 35.0,
            "moq_status": "SATISFIED",
            "base_wholesale_price": 1620.0,
            "quantity_tier_price": 1620.0,
            "discount_pct": 3.0,
            "additional_discount": 48.6,
            "final_unit_price": 1571.4,
            "gross_order_value": 68040.0,
            "discount_amount": 2041.2,
            "final_order_value": 65998.8,
            "moq_at_acceptance": 35.0,
            "price_at_acceptance": 1571.4,
            "accepted_at": (now - datetime.timedelta(days=5)).isoformat() + "Z",
            "delivery_cluster": "Hyderabad East Cluster #7",
            "delivery_distance_km": 6.5,
            "estimated_delivery_time_days": 1,
            "transport_info": {
                "recommended_vehicle": "Small Commercial Vehicle (SCV) / Tata Ace",
                "vehicle_capacity_kg": 1000.0,
                "total_load_kg": 596.4,
                "capacity_utilization_pct": 59.6,
                "vehicles_required": 1,
                "estimated_transport_cost_inr": 793.0,
                "cost_per_retailer_inr": 158.6,
                "transit_time_minutes": 22
            },
            "status": "DELIVERED",
            "rejection_reason": None,
            "timeline": [
                {"status": "PENDING", "timestamp": (now - datetime.timedelta(days=6)).isoformat() + "Z", "description": "Pooled group order formed", "actor": "SYSTEM"},
                {"status": "ACCEPTED", "timestamp": (now - datetime.timedelta(days=5)).isoformat() + "Z", "description": "Order accepted by Telangana Oil Mills", "actor": "SUPPLIER (sup_02)"},
                {"status": "DISPATCHED", "timestamp": (now - datetime.timedelta(days=4)).isoformat() + "Z", "description": "Dispatched via Tata Ace (AP 28 TE 4410)", "actor": "SUPPLIER (sup_02)"},
                {"status": "DELIVERED", "timestamp": (now - datetime.timedelta(days=3)).isoformat() + "Z", "description": "All 5 Kirana store deliveries verified", "actor": "LOGISTICS_DRIVER"}
            ],
            "created_at": (now - datetime.timedelta(days=6)).isoformat() + "Z",
            "updated_at": (now - datetime.timedelta(days=3)).isoformat() + "Z"
        }
    ]
    repo.save_bulk("supplierOrders", initial_supplier_orders)

    return {
        "status": "success",
        "retailers_count": len(retailers_list),
        "products_count": len(products_list),
        "suppliers_count": len(SUPPLIERS_DATA),
        "sales_records_count": len(sales_records),
        "supplier_orders_count": len(initial_supplier_orders),
        "message": "Demo dataset successfully seeded with 30 retailers, 22 products (with quantity-tier pricing), 5 suppliers, and initial supplier orders."
    }
