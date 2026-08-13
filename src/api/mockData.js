export const MOCK_DASHBOARD = {
  metrics: {
    total_retailers: 30,
    total_catalog_products: 20,
    total_active_pools: 12,
    pools_achieved_threshold: 9,
    total_community_savings_inr: 84520.0,
    total_forecasts_generated: 120,
    total_recommendations: 12,
    average_savings_percentage: 18.5
  },
  category_breakdown: {
    "Grains": 5,
    "Oils": 4,
    "Spices": 4,
    "Beverages": 4,
    "Personal Care": 3
  },
  monthly_savings_trend: [
    { month: 'Jan', savings: 12400, pools: 4, volume: 140 },
    { month: 'Feb', savings: 18900, pools: 6, volume: 210 },
    { month: 'Mar', savings: 24500, pools: 8, volume: 290 },
    { month: 'Apr', savings: 38200, pools: 9, volume: 380 },
    { month: 'May', savings: 59000, pools: 11, volume: 510 },
    { month: 'Jun', savings: 84520, pools: 12, volume: 640 }
  ]
};

export const MOCK_RECOMMENDATIONS = [
  {
    id: "rec_001",
    product_id: "prod_001",
    product_name: "Sona Masoori Rice (25kg Bag)",
    category: "Grains",
    pool_id: "pool_001",
    retailer_ids: ["ret_001", "ret_002", "ret_005", "ret_008"],
    retailer_names: [
      "Sri Lakshmi Kirana Store",
      "Balaji Superette",
      "Sai Ram Provisions",
      "Venkateshwara Traders"
    ],
    threshold_status: "ACHIEVED",
    threshold_quantity: 40.0,
    current_pool_quantity: 43.5,
    estimated_total_savings: 11745.0,
    estimated_savings_percentage: 18.6,
    average_cluster_distance_km: 1.85,
    unit_retail_price: 1450.0,
    unit_wholesale_price: 1180.0,
    explanation: "A cluster of 4 nearby Kirana stores (within 1.85 km radius) has a combined 30-day forecast demand of 43.5 bags. This exceeds the supplier wholesale threshold of 40.0 bags, unlocking an estimated total group savings of ₹11,745.00 (18.6% discount).",
    score: 0.96,
    created_at: "2026-08-13T12:00:00Z"
  },
  {
    id: "rec_002",
    product_id: "prod_006",
    product_name: "Freedom Sunflower Oil (15L Tin)",
    category: "Oils",
    pool_id: "pool_002",
    retailer_ids: ["ret_003", "ret_006", "ret_009"],
    retailer_names: [
      "Maruti Wholesale & Retail",
      "Bhavani Provision Store",
      "Durga Bhavani Kirana"
    ],
    threshold_status: "NEAR_THRESHOLD",
    threshold_quantity: 35.0,
    current_pool_quantity: 31.0,
    estimated_total_savings: 10230.0,
    estimated_savings_percentage: 16.9,
    average_cluster_distance_km: 2.4,
    unit_retail_price: 1950.0,
    unit_wholesale_price: 1620.0,
    explanation: "3 stores in Banjara Hills cluster are currently at 31.0 tins (88.5% of the 35.0 tin threshold). Adding 1 more store with 4 tins will unlock ₹10,230.00 total group savings (16.9% discount).",
    score: 0.91,
    created_at: "2026-08-13T12:30:00Z"
  },
  {
    id: "rec_003",
    product_id: "prod_010",
    product_name: "Guntur Red Chilli Powder (5kg Pack)",
    category: "Spices",
    pool_id: "pool_003",
    retailer_ids: ["ret_004", "ret_007", "ret_011", "ret_014"],
    retailer_names: [
      "Ganesh General Store",
      "Santhoshi Mata Provisions",
      "Krishna Kirana",
      "Annapurna Traders"
    ],
    threshold_status: "ACHIEVED",
    threshold_quantity: 30.0,
    current_pool_quantity: 34.0,
    estimated_total_savings: 12240.0,
    estimated_savings_percentage: 20.5,
    average_cluster_distance_km: 3.1,
    unit_retail_price: 1750.0,
    unit_wholesale_price: 1390.0,
    explanation: "Cluster of 4 stores reached 34.0 packs, comfortably exceeding the 30.0 pack minimum wholesale threshold. Unlocks ₹12,240.00 in total group savings (20.5% discount).",
    score: 0.94,
    created_at: "2026-08-13T13:00:00Z"
  },
  {
    id: "rec_004",
    product_id: "prod_014",
    product_name: "Red Label Tea Master Pack (1kg x 12)",
    category: "Beverages",
    pool_id: "pool_004",
    retailer_ids: ["ret_010", "ret_012", "ret_015"],
    retailer_names: [
      "Shiva Super Market",
      "Nandi Superette",
      "Pavan Putra Kirana"
    ],
    threshold_status: "IN_PROGRESS",
    threshold_quantity: 20.0,
    current_pool_quantity: 14.0,
    estimated_total_savings: 11900.0,
    estimated_savings_percentage: 17.7,
    average_cluster_distance_km: 4.2,
    unit_retail_price: 4800.0,
    unit_wholesale_price: 3950.0,
    explanation: "3 Kirana stores in Madhapur area have pooled 14.0 master cartons (70% of 20.0 threshold). Requires 6 more cartons to unlock bulk tier discount.",
    score: 0.78,
    created_at: "2026-08-13T13:15:00Z"
  },
  {
    id: "rec_005",
    product_id: "prod_018",
    product_name: "Surf Excel Easy Wash Carton (1kg x 20)",
    category: "Personal Care",
    pool_id: "pool_005",
    retailer_ids: ["ret_016", "ret_018", "ret_020", "ret_022"],
    retailer_names: [
      "Swagath Provisions",
      "Royal Superette",
      "Telangana General Store",
      "Deccan Superette"
    ],
    threshold_status: "ACHIEVED",
    threshold_quantity: 30.0,
    current_pool_quantity: 32.0,
    estimated_total_savings: 17600.0,
    estimated_savings_percentage: 19.6,
    average_cluster_distance_km: 2.9,
    unit_retail_price: 2800.0,
    unit_wholesale_price: 2250.0,
    explanation: "Group demand of 32.0 cartons easily passes the 30 carton supplier threshold, saving ₹17,600.00 across 4 retail partners.",
    score: 0.95,
    created_at: "2026-08-13T13:45:00Z"
  }
];

export const MOCK_RETAILERS = [
  {
    id: "ret_001",
    name: "Sri Lakshmi Kirana & General Store",
    store_type: "Kirana",
    latitude: 17.3850,
    longitude: 78.4867,
    address: "Door No 42, Banjara Hills",
    city: "Hyderabad",
    pincode: "500034",
    contact_phone: "+91 9876543210",
    monthly_budget: 75000.0,
    rating: 4.8,
    forecasted_products_count: 6,
    total_savings_earned: 14250.0
  },
  {
    id: "ret_002",
    name: "Balaji Superette",
    store_type: "Superette",
    latitude: 17.3920,
    longitude: 78.4910,
    address: "Road No 12, Banjara Hills",
    city: "Hyderabad",
    pincode: "500034",
    contact_phone: "+91 9876543211",
    monthly_budget: 100000.0,
    rating: 4.9,
    forecasted_products_count: 8,
    total_savings_earned: 18900.0
  },
  {
    id: "ret_003",
    name: "Venkateshwara Traders",
    store_type: "Kirana",
    latitude: 17.3880,
    longitude: 78.4820,
    address: "Main Road, Jubilee Hills",
    city: "Hyderabad",
    pincode: "500033",
    contact_phone: "+91 9876543212",
    monthly_budget: 60000.0,
    rating: 4.7,
    forecasted_products_count: 5,
    total_savings_earned: 11400.0
  },
  {
    id: "ret_004",
    name: "Bhavani Provision Store",
    store_type: "General Store",
    latitude: 17.3750,
    longitude: 78.4750,
    address: "Panjagutta Colony",
    city: "Hyderabad",
    pincode: "500082",
    contact_phone: "+91 9876543213",
    monthly_budget: 45000.0,
    rating: 4.6,
    forecasted_products_count: 4,
    total_savings_earned: 8900.0
  },
  {
    id: "ret_005",
    name: "Sai Ram Kirana",
    store_type: "Kirana",
    latitude: 17.3810,
    longitude: 78.4890,
    address: "Somajiguda Market",
    city: "Hyderabad",
    pincode: "500082",
    contact_phone: "+91 9876543214",
    monthly_budget: 80000.0,
    rating: 4.8,
    forecasted_products_count: 7,
    total_savings_earned: 16100.0
  }
];

export const MOCK_PRODUCTS = [
  {
    id: "prod_001",
    name: "Sona Masoori Rice (25kg Bag)",
    category: "Grains",
    unit_of_measure: "bag",
    retail_price: 1450.0,
    wholesale_price: 1180.0,
    min_wholesale_quantity: 40.0,
    supplier_name: "Deccan Wholesale Grains",
    discount_pct: 18.6
  },
  {
    id: "prod_002",
    name: "Royal Toor Dal Premium (10kg)",
    category: "Grains",
    unit_of_measure: "bag",
    retail_price: 1600.0,
    wholesale_price: 1320.0,
    min_wholesale_quantity: 30.0,
    supplier_name: "Deccan Wholesale Grains",
    discount_pct: 17.5
  },
  {
    id: "prod_006",
    name: "Freedom Sunflower Oil (15L Tin)",
    category: "Oils",
    unit_of_measure: "tin",
    retail_price: 1950.0,
    wholesale_price: 1620.0,
    min_wholesale_quantity: 35.0,
    supplier_name: "Telangana Oil Mills",
    discount_pct: 16.9
  },
  {
    id: "prod_010",
    name: "Guntur Red Chilli Powder (5kg)",
    category: "Spices",
    unit_of_measure: "pack",
    retail_price: 1750.0,
    wholesale_price: 1390.0,
    min_wholesale_quantity: 30.0,
    supplier_name: "South India Spice Hub",
    discount_pct: 20.5
  }
];

export const MOCK_IMPACT = {
  impact: {
    total_community_savings_inr: 84520.0,
    average_group_discount_percentage: 18.5,
    wholesale_threshold_success_rate: 75.0,
    retailers_empowered: 30,
    logistics_trips_consolidated: 24,
    estimated_co2_reduction_kg: 100.8,
    average_roi_per_retailer_inr: 2817.33
  },
  comparison_table: [
    { product: "Sona Masoori Rice (25kg)", individual_price: 1450, pooled_price: 1180, savings_pct: 18.6, annual_savings: 32400 },
    { product: "Freedom Sunflower Oil (15L)", individual_price: 1950, pooled_price: 1620, savings_pct: 16.9, annual_savings: 39600 },
    { product: "Guntur Red Chilli Powder (5kg)", individual_price: 1750, pooled_price: 1390, savings_pct: 20.5, annual_savings: 43200 },
    { product: "Red Label Tea Master Pack", individual_price: 4800, pooled_price: 3950, savings_pct: 17.7, annual_savings: 51000 },
    { product: "Surf Excel Easy Wash Carton", individual_price: 2800, pooled_price: 2250, savings_pct: 19.6, annual_savings: 66000 }
  ]
};
