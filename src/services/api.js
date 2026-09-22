import axios from 'axios';
import {
  MOCK_DASHBOARD,
  MOCK_RECOMMENDATIONS,
  MOCK_RETAILERS,
  MOCK_PRODUCTS,
  MOCK_IMPACT
} from '../api/mockData';
import { INITIAL_SUPPLIER_ORDERS } from './mockSupplierData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Create Axios client instance with ultra-short timeout for instant fallback
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 3000,
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

// Helper functions for mock supplier orders in localStorage
function getLocalSupplierOrders() {
  try {
    const raw = localStorage.getItem('samooh_supplier_orders');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}
  try {
    localStorage.setItem('samooh_supplier_orders', JSON.stringify(INITIAL_SUPPLIER_ORDERS));
  } catch (e) {}
  return [...INITIAL_SUPPLIER_ORDERS];
}

function saveLocalSupplierOrders(orders) {
  try {
    localStorage.setItem('samooh_supplier_orders', JSON.stringify(orders));
  } catch (e) {}
}

// 9. Supplier Portal APIs
export async function getSupplierDashboard(supplierId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/dashboard`);
    if (res.data && res.data.total_orders > 0) return res.data;
  } catch (err) {
    // Continue to dynamic local fallback
  }

  const all = getLocalSupplierOrders().filter(o => o.supplier_id === supplierId);
  const total_orders = all.length;
  const pending_orders = all.filter(o => o.status === 'PENDING').length;
  const accepted_orders = all.filter(o => ['ACCEPTED', 'PROCESSING', 'READY_FOR_DISPATCH'].includes(o.status)).length;
  const completed_orders = all.filter(o => o.status === 'DELIVERED').length;
  const total_sales_value = all
    .filter(o => ['ACCEPTED', 'PROCESSING', 'READY_FOR_DISPATCH', 'DISPATCHED', 'DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.final_order_value) || 0), 0);
  const total_quantity_supplied = all
    .filter(o => ['DISPATCHED', 'DELIVERED'].includes(o.status))
    .reduce((sum, o) => sum + (Number(o.pooled_quantity) || 0), 0);

  return {
    supplier_id: supplierId,
    total_orders,
    pending_orders,
    accepted_orders,
    completed_orders,
    total_sales_value: Math.round(total_sales_value * 100) / 100,
    total_quantity_supplied: Math.round(total_quantity_supplied * 100) / 100,
    active_products: 12,
    total_products: 12,
    inventory_alerts_count: 1,
    inventory_alerts: [
      {
        product_id: 'prod_001',
        product_name: 'Sona Masoori Raw Rice (25kg Bag)',
        type: 'LOW_STOCK',
        severity: 'low',
        message: 'LOW STOCK: Sona Masoori Rice has 850 units remaining.'
      }
    ],
    recent_orders: all.slice(0, 5)
  };
}

export async function getSupplierAnalytics(supplierId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/analytics`);
    if (res.data && res.data.total_orders > 0) return res.data;
  } catch (err) {
    // Continue to dynamic local fallback
  }

  const orders = getLocalSupplierOrders().filter(o => o.supplier_id === supplierId && o.status !== 'REJECTED');
  const gross_sales = orders.reduce((sum, o) => sum + (Number(o.gross_order_value) || 0), 0);
  const discounts_given = orders.reduce((sum, o) => sum + (Number(o.discount_amount) || 0), 0);
  const final_revenue = orders.reduce((sum, o) => sum + (Number(o.final_order_value) || 0), 0);
  const total_quantity_supplied = orders.reduce((sum, o) => sum + (Number(o.pooled_quantity) || 0), 0);

  const prodMap = {};
  for (const o of orders) {
    const pName = o.product_name || 'Item';
    if (!prodMap[pName]) prodMap[pName] = { product_name: pName, quantity: 0, revenue: 0, orders_count: 0 };
    prodMap[pName].quantity += Number(o.pooled_quantity) || 0;
    prodMap[pName].revenue += Number(o.final_order_value) || 0;
    prodMap[pName].orders_count += 1;
  }
  const topProducts = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue);

  return {
    supplier_id: supplierId,
    total_orders: orders.length,
    gross_sales: Math.round(gross_sales * 100) / 100,
    discounts_given: Math.round(discounts_given * 100) / 100,
    final_revenue: Math.round(final_revenue * 100) / 100,
    total_quantity_supplied: Math.round(total_quantity_supplied * 100) / 100,
    product_wise_sales: topProducts,
    monthly_trends: [
      { month: "Apr 2026", orders: 12, revenue: Math.round(final_revenue * 0.18), quantity: Math.round(total_quantity_supplied * 0.16) },
      { month: "May 2026", orders: 16, revenue: Math.round(final_revenue * 0.22), quantity: Math.round(total_quantity_supplied * 0.21) },
      { month: "Jun 2026", orders: 19, revenue: Math.round(final_revenue * 0.27), quantity: Math.round(total_quantity_supplied * 0.28) },
      { month: "Jul 2026", orders: orders.length, revenue: Math.round(final_revenue), quantity: Math.round(total_quantity_supplied) }
    ]
  };
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
        name: 'Sona Masoori Raw Rice (25kg Bag)',
        category: 'Grains & Staples',
        unit_of_measure: 'bag',
        unit_weight_kg: 25.0,
        retail_price: 1450.0,
        wholesale_price: 1180.0,
        min_wholesale_quantity: 20.0,
        available_quantity: 850.0,
        max_order_quantity: 1500.0,
        supplier_id: supplierId,
        lead_time_days: 2,
        service_radius_km: 60.0,
        discount_pct: 2.0,
        is_available: true,
        quantity_tiers: [
          { min_quantity: 1.0, max_quantity: 19.0, price_per_unit: 1250.0 },
          { min_quantity: 20.0, max_quantity: 49.0, price_per_unit: 1180.0 },
          { min_quantity: 50.0, max_quantity: 99.0, price_per_unit: 1140.0 },
          { min_quantity: 100.0, max_quantity: null, price_per_unit: 1090.0 }
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
    if (res.data && res.data.length > 0) return res.data;
  } catch (err) {
    // Continue to local mock store
  }

  const all = getLocalSupplierOrders();
  let filtered = all.filter(o => o.supplier_id === supplierId);
  if (status && status !== 'ALL') {
    filtered = filtered.filter(o => (o.status || '').toUpperCase() === status.toUpperCase());
  }
  filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
  return filtered;
}

export async function getSupplierOrderDetail(supplierId, orderId) {
  try {
    const res = await apiClient.get(`/api/suppliers/${supplierId}/orders/${orderId}`);
    if (res.data) return res.data;
  } catch (err) {
    // Continue to local mock store
  }

  const all = getLocalSupplierOrders();
  return all.find(o => o.id === orderId && o.supplier_id === supplierId) || null;
}

export async function updateSupplierOrderStatus(supplierId, orderId, status, reason = null) {
  try {
    const res = await apiClient.post(`/api/suppliers/${supplierId}/orders/${orderId}/status`, { status, reason });
    if (res.data) return res.data;
  } catch (err) {
    // Continue to local mock store
  }

  const all = getLocalSupplierOrders();
  const orderIdx = all.findIndex(o => o.id === orderId);
  if (orderIdx >= 0) {
    const order = all[orderIdx];
    order.status = status;
    order.updated_at = new Date().toISOString();
    if (status === 'ACCEPTED') {
      order.moq_at_acceptance = order.supplier_moq;
      order.price_at_acceptance = order.final_unit_price;
      order.accepted_at = new Date().toISOString();
    } else if (status === 'REJECTED') {
      order.rejection_reason = reason || 'Declined by supplier';
    }
    order.timeline = order.timeline || [];
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      description: `Order status changed to ${status}` + (reason ? `: ${reason}` : ''),
      actor: `SUPPLIER (${supplierId})`
    });
    all[orderIdx] = order;
    saveLocalSupplierOrders(all);
    return { status: 'success', message: `Order updated to ${status}`, order };
  }
  return { status: 'success', message: `Order updated to ${status} (Mock)` };
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


