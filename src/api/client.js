import {
  MOCK_DASHBOARD,
  MOCK_RECOMMENDATIONS,
  MOCK_RETAILERS,
  MOCK_PRODUCTS,
  MOCK_IMPACT
} from './mockData';

const BASE_URL = 'http://localhost:8000';

export async function fetchDashboardData() {
  try {
    const res = await fetch(`${BASE_URL}/dashboard`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return { ...MOCK_DASHBOARD, ...data };
  } catch (err) {
    console.log('Backend API unavailable. Using Samooh Mock Data Store.');
    return MOCK_DASHBOARD;
  }
}

export async function fetchRecommendations(statusFilter = null) {
  try {
    const url = statusFilter 
      ? `${BASE_URL}/recommendations?threshold_status=${statusFilter}`
      : `${BASE_URL}/recommendations`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.data && data.data.length > 0 ? data.data : MOCK_RECOMMENDATIONS;
  } catch (err) {
    return statusFilter 
      ? MOCK_RECOMMENDATIONS.filter(r => r.threshold_status === statusFilter)
      : MOCK_RECOMMENDATIONS;
  }
}

export async function fetchRetailers() {
  try {
    const res = await fetch(`${BASE_URL}/retailers`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.data && data.data.length > 0 ? data.data : MOCK_RETAILERS;
  } catch (err) {
    return MOCK_RETAILERS;
  }
}

export async function fetchProducts() {
  try {
    const res = await fetch(`${BASE_URL}/products`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return data.data && data.data.length > 0 ? data.data : MOCK_PRODUCTS;
  } catch (err) {
    return MOCK_PRODUCTS;
  }
}

export async function fetchImpactMetrics() {
  try {
    const res = await fetch(`${BASE_URL}/impact`);
    if (!res.ok) throw new Error('API Error');
    const data = await res.json();
    return { ...MOCK_IMPACT, ...data };
  } catch (err) {
    return MOCK_IMPACT;
  }
}

export async function triggerGenerateRecommendations() {
  try {
    const res = await fetch(`${BASE_URL}/generate-recommendations`, { method: 'POST' });
    if (!res.ok) throw new Error('API Error');
    return await res.json();
  } catch (err) {
    return { status: 'success', message: 'Mock Recommendations Regenerated Successfully' };
  }
}
