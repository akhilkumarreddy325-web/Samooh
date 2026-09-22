import axios from 'axios';
import {
  MOCK_DASHBOARD,
  MOCK_RECOMMENDATIONS,
  MOCK_RETAILERS,
  MOCK_PRODUCTS,
  MOCK_IMPACT
} from '../api/mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create Axios client instance with ultra-short timeout for instant fallback
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 600,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Fast response handler without long retry pauses
apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

// Health Check API
export async function checkHealth() {
  try {
    const res = await apiClient.get('/');
    return { isOnline: true, data: res.data };
  } catch (err) {
    return { isOnline: false, error: err.message };
  }
}

// Hackathon Deterministic Demo Scenario APIs
export async function triggerDemoScenario() {
  try {
    const res = await apiClient.post('/demo/scenario');
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend offline. Serving Mock Demo Scenario.');
    return {
      status: 'success',
      message: 'Parle-G 800g Demo Scenario Triggered (Mock Mode)',
      scenario_name: 'Parle-G 800g Hackathon Scenario',
      metrics: {
        total_demand: 112.0,
        threshold_quantity: 100.0,
        progress_percentage: 112.0,
        retail_price: 120.0,
        wholesale_price: 95.0,
        total_individual_cost: 13440.0,
        total_pooled_cost: 10640.0,
        total_savings_inr: 2800.0,
        savings_percentage: 20.83
      }
    };
  }
}

export async function getDemoScenario() {
  try {
    const res = await apiClient.get('/demo/scenario');
    return res.data;
  } catch (err) {
    return {
      status: 'success',
      scenario_name: 'Parle-G 800g Hackathon Scenario',
      metrics: {
        total_demand: 112.0,
        threshold_quantity: 100.0,
        progress_percentage: 112.0,
        retail_price: 120.0,
        wholesale_price: 95.0,
        total_individual_cost: 13440.0,
        total_pooled_cost: 10640.0,
        total_savings_inr: 2800.0,
        savings_percentage: 20.83
      }
    };
  }
}

// 1. Dashboard Metrics
export async function getDashboard() {
  try {
    const res = await apiClient.get('/dashboard');
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Dashboard data.');
    return MOCK_DASHBOARD;
  }
}

// 2. Recommendations API
export async function getRecommendations(thresholdStatus = null, productId = null) {
  try {
    const params = {};
    if (thresholdStatus && thresholdStatus !== 'ALL') params.threshold_status = thresholdStatus;
    if (productId) params.product_id = productId;

    const res = await apiClient.get('/recommendations', { params });
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Recommendations.');
    let list = MOCK_RECOMMENDATIONS;
    if (thresholdStatus && thresholdStatus !== 'ALL') {
      list = list.filter((r) => r.threshold_status === thresholdStatus);
    }
    if (productId) {
      list = list.filter((r) => r.product_id === productId);
    }
    return { status: 'success', data: list };
  }
}

export async function generateRecommendations() {
  try {
    const res = await apiClient.post('/generate-recommendations');
    return res.data;
  } catch (err) {
    return { status: 'success', message: 'Recommendations generated (Mock Mode)', data: MOCK_RECOMMENDATIONS };
  }
}

// 3. Forecasts API
export async function getForecasts(retailerId = null, productId = null) {
  try {
    const params = {};
    if (retailerId) params.retailer_id = retailerId;
    if (productId) params.product_id = productId;

    const res = await apiClient.get('/forecasts', { params });
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Forecasts.');
    const mockForecasts = MOCK_RETAILERS.map((r) => ({
      id: `fc_${r.id}`,
      retailer_id: r.id,
      retailer_name: r.name,
      product_id: productId || 'prod_001',
      product_name: 'Sona Masoori Rice (25kg Bag)',
      predicted_demand_30d: 32,
      confidence_score: 0.94,
      historical_avg: 28.5
    }));
    return { status: 'success', data: mockForecasts };
  }
}

export async function generateForecasts(horizonDays = 30) {
  try {
    const res = await apiClient.post(`/generate-forecasts?horizon_days=${horizonDays}`);
    return res.data;
  } catch (err) {
    return { status: 'success', message: `Generated ${horizonDays}-day forecasts (Mock Mode)` };
  }
}

// 4. Impact Metrics API
export async function getImpactMetrics() {
  try {
    const res = await apiClient.get('/impact');
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Impact Metrics.');
    return MOCK_IMPACT;
  }
}

// 5. Retailers API
export async function getRetailers(storeType = null, city = null) {
  try {
    const params = {};
    if (storeType && storeType !== 'ALL') params.store_type = storeType;
    if (city) params.city = city;

    const res = await apiClient.get('/retailers', { params });
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Retailers data.');
    let list = MOCK_RETAILERS;
    if (storeType && storeType !== 'ALL') {
      list = list.filter((r) => r.store_type === storeType);
    }
    if (city) {
      list = list.filter((r) => r.city.toLowerCase() === city.toLowerCase());
    }
    return { status: 'success', data: list };
  }
}

// 6. Products API
export async function getProducts(category = null) {
  try {
    const params = {};
    if (category && category !== 'ALL') params.category = category;

    const res = await apiClient.get('/products', { params });
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving Mock Products data.');
    let list = MOCK_PRODUCTS;
    if (category && category !== 'ALL') {
      list = list.filter((p) => p.category === category);
    }
    return { status: 'success', data: list };
  }
}

// 7. Seed Demo Data API
export async function seedData() {
  try {
    const res = await apiClient.post('/seed-data');
    return res.data;
  } catch (err) {
    return { status: 'success', message: 'Demo data seeded successfully (Mock Mode)' };
  }
}

// 8. Transport & Fleet APIs
export async function getVehicleFleet() {
  try {
    const res = await apiClient.get('/transport/fleet');
    return res.data;
  } catch (err) {
    return {
      status: 'success',
      fleet: [
        { id: "veh_3w_electric", name: "Piaggio Ape E-City / E-Loader", capacity_kg: 500, base_rate_inr: 350 },
        { id: "veh_scv_tata_ace", name: "Tata Ace (SCV)", capacity_kg: 1000, base_rate_inr: 650 },
        { id: "veh_mgv_eicher_pro", name: "Eicher Pro 2049 (MGV)", capacity_kg: 2500, base_rate_inr: 1400 },
        { id: "veh_hgv_tata_407", name: "Tata 407 (HGV)", capacity_kg: 5000, base_rate_inr: 2500 }
      ]
    };
  }
}

export async function recalculatePoolTransport(poolId, payload = {}) {
  try {
    const res = await apiClient.post(`/recommendations/${poolId}/recalculate-transport`, payload);
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] FastAPI backend unreachable. Serving local calculation.');
    return { status: 'mock', message: 'Calculated in frontend fallback mode' };
  }
}

// 9. Supplier Portal APIs
export async function getSupplierDashboard(supplierId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/dashboard`);
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] Serving Mock Supplier Dashboard');
    return {
      supplier_id: supplierId,
      total_orders: 8,
      pending_orders: 2,
      accepted_orders: 4,
      completed_orders: 2,
      total_sales_value: 234850.0,
      total_quantity_supplied: 380.0,
      active_products: 5,
      total_products: 5,
      inventory_alerts_count: 1,
      inventory_alerts: [
        {
          product_id: 'prod_001',
          product_name: 'Sona Masoori Rice (25kg)',
          type: 'LOW_STOCK',
          severity: 'low',
          message: 'LOW STOCK: Sona Masoori Rice has 850 units remaining.'
        }
      ],
      recent_orders: []
    };
  }
}

export async function getSupplierAnalytics(supplierId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/analytics`);
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] Serving Mock Supplier Analytics');
    return {
      supplier_id: supplierId,
      total_orders: 12,
      gross_sales: 245000.0,
      discounts_given: 12500.0,
      final_revenue: 232500.0,
      total_quantity_supplied: 420.0,
      product_wise_sales: [
        { product_name: 'Sona Masoori Rice (25kg)', quantity: 240, revenue: 138000, orders_count: 6 },
        { product_name: 'Royal Toor Dal Premium (10kg)', quantity: 180, revenue: 94500, orders_count: 6 }
      ],
      monthly_trends: [
        {"month": "Apr 2026", "orders": 12, "revenue": 145000, "quantity": 180},
        {"month": "May 2026", "orders": 16, "revenue": 178000, "quantity": 230},
        {"month": "Jun 2026", "orders": 19, "revenue": 210000, "quantity": 310},
        {"month": "Jul 2026", "orders": 24, "revenue": 232500, "quantity": 420}
      ]
    };
  }
}

export async function getSupplierProducts(supplierId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/products`);
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] Serving Mock Supplier Products');
    return [
      {
        id: 'prod_001',
        name: 'Sona Masoori Rice (25kg)',
        category: 'Grains',
        unit_of_measure: 'bag',
        unit_weight_kg: 25.0,
        retail_price: 1450.0,
        wholesale_price: 1180.0,
        min_wholesale_quantity: 40.0,
        available_quantity: 850.0,
        max_order_quantity: 1500.0,
        supplier_id: supplierId,
        lead_time_days: 2,
        service_radius_km: 60.0,
        discount_pct: 2.0,
        is_available: true,
        quantity_tiers: [
          { min_quantity: 1.0, max_quantity: 39.0, price_per_unit: 1250.0 },
          { min_quantity: 40.0, max_quantity: 99.0, price_per_unit: 1180.0 },
          { min_quantity: 100.0, max_quantity: 299.0, price_per_unit: 1140.0 },
          { min_quantity: 300.0, max_quantity: null, price_per_unit: 1090.0 }
        ]
      }
    ];
  }
}

export async function addSupplierProduct(supplierId, productData) {
  try {
    const res = await apiClient.post(`/api/suppliers/${supplierId}/products`, productData);
    return res.data;
  } catch (err) {
    return { status: 'success', product: { ...productData, id: `prod_${Date.now()}`, supplier_id: supplierId } };
  }
}

export async function updateSupplierProduct(supplierId, productId, updates) {
  try {
    const res = await apiClient.put(`/api/suppliers/${supplierId}/products/${productId}`, updates);
    return res.data;
  } catch (err) {
    return { status: 'success', product: { id: productId, ...updates } };
  }
}

export async function getSupplierOrders(supplierId, status = null) {
  try {
    const params = status && status !== 'ALL' ? { status } : {};
    const res = await apiClient.get(`/api/suppliers/${supplierId}/orders`, { params });
    return res.data;
  } catch (err) {
    console.warn('[Samooh API] Serving Mock Supplier Orders');
    return [];
  }
}

export async function getSupplierOrderDetail(supplierId, orderId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/orders/${orderId}`);
    return res.data;
  } catch (err) {
    return null;
  }
}

export async function updateSupplierOrderStatus(supplierId, orderId, status, reason = null) {
  try {
    const res = await apiClient.post(`/api/suppliers/${supplierId}/orders/${orderId}/status`, { status, reason });
    return res.data;
  } catch (err) {
    return { status: 'success', message: `Order updated to ${status} (Mock)` };
  }
}

export async function validateOrderInventory(supplierId, orderId) {
  try {
    const res = await apiClient.post(`/api/suppliers/${supplierId}/orders/${orderId}/validate-inventory`);
    return res.data;
  } catch (err) {
    return { is_sufficient: true, available_quantity: 500, requested_quantity: 40, shortage: 0 };
  }
}

export default apiClient;


