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

export default apiClient;
