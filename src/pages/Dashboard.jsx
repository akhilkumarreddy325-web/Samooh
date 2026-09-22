import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  Users, 
  Layers, 
  Percent, 
  AlertCircle,
  RefreshCw,
  Database
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import KPICard from '../components/KPICard';
import RecommendationCard from '../components/RecommendationCard';
import PoolDetailModal from '../components/PoolDetailModal';
import { getDashboard, getRecommendations, seedData } from '../services/api';
import { MOCK_DASHBOARD, MOCK_RECOMMENDATIONS } from '../api/mockData';
import { formatINR } from '../utils/currency';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { theme, t, setActiveInvoice, user, addOrderToHistory } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [isSeeding, setIsSeeding] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, recRes] = await Promise.all([
        getDashboard(),
        getRecommendations()
      ]);
      setData(dashRes || MOCK_DASHBOARD);
      const recsList = Array.isArray(recRes) ? recRes : (recRes?.data || MOCK_RECOMMENDATIONS);
      setRecommendations(recsList);
    } catch (err) {
      console.warn("FastAPI offline, serving mock dashboard data:", err);
      setData(MOCK_DASHBOARD);
      setRecommendations(MOCK_RECOMMENDATIONS);
    } finally {
      setLoading(false);
    }
  }

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedData();
      await loadDashboardData();
    } catch (err) {
      setError('Seeding failed: ' + err.message);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAccept = (poolOrId) => {
    let pool = null;
    if (typeof poolOrId === 'object' && poolOrId !== null) {
      pool = poolOrId;
    } else if (Array.isArray(recommendations)) {
      pool = recommendations.find(r => r.id === poolOrId || String(r.id) === String(poolOrId) || r.pool_id === poolOrId);
    }
    if (!pool && MOCK_RECOMMENDATIONS.length > 0) {
      pool = MOCK_RECOMMENDATIONS[0];
    }

    if (pool) {
      const unitRetail = pool.unit_retail_price || 1450;
      const unitWholesale = pool.unit_wholesale_price || 1180;
      const qty = Math.round(pool.current_pool_quantity / (pool.retailer_names ? pool.retailer_names.length : 4)) || 10;
      const totalRetail = unitRetail * qty;
      const totalWholesale = unitWholesale * qty;
      const savings = totalRetail - totalWholesale;

      const invoicePayload = {
        invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        storeName: user?.storeName || 'Sri Lakshmi Kirana & General Store',
        storeAddress: user?.address || 'Door No 42, Road No 12, Banjara Hills, Hyderabad (500034)',
        clusterHub: user?.clusterHub || `Hyderabad Cluster (Radius: ~${pool.average_cluster_distance_km || 1.8} km)`,
        items: [
          {
            id: pool.product_id || 'prod_001',
            name: pool.product_name,
            category: pool.category || 'Grains & Pulses',
            retailPrice: unitRetail,
            wholesalePrice: unitWholesale,
            qty: qty,
            lineRetail: totalRetail,
            lineWholesale: totalWholesale,
            lineSavings: savings
          }
        ],
        totalRetailCost: totalRetail,
        totalWholesaleCost: totalWholesale,
        totalSavings: savings,
        overallSavingsPct: pool.estimated_savings_percentage || '18.5',
        totalItemsCount: qty,
        taxGst: Math.round(totalWholesale * 0.05),
        finalPayable: Math.round(totalWholesale * 1.05)
      };

      setActiveInvoice(invoicePayload);
      addOrderToHistory(invoicePayload);
      navigate('/processing');
    }
  };

  const handleReject = (id) => {
    setRecommendations(prev => prev.filter(r => r.id !== id));
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto animate-pulse">
        <div className="h-7 rounded-md w-1/4 bg-slate-200 dark:bg-slate-700"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
          <div className="h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-xl mx-auto text-center space-y-4 my-12 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">{t('backendUnreachable')}</h3>
        <p className="text-xs text-slate-500">
          Could not fetch real data from backend.
        </p>
        <div className="flex items-center justify-center space-x-2 pt-2">
          <button 
            onClick={loadDashboardData}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center space-x-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('retryConnection')}</span>
          </button>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 text-white text-xs font-medium hover:bg-emerald-900 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Database className="w-3.5 h-3.5" />
            <span>{isSeeding ? t('seeding') : t('seedBackendStart')}</span>
          </button>
        </div>
      </div>
    );
  }

  const categoryBreakdown = data?.category_breakdown || {};
  const totalSavings = data?.metrics?.total_community_savings_inr || 84520;
  const pieColors = ['#166534', '#334155', '#475569', '#64748B', '#94A3B8'];
  const pieData = Object.keys(categoryBreakdown).map((cat, idx) => ({
    name: cat,
    value: categoryBreakdown[cat],
    color: pieColors[idx % pieColors.length]
  }));

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            {t('groupProcurementDashboard')}
            <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              Active Store: {user?.storeName || 'Sri Lakshmi Kirana'}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('dashboardDesc')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? t('seeding') : t('resetSeedData')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title={t('estimatedSavings')}
          value={formatINR(data?.metrics?.total_community_savings_inr || 84520)}
          subtext={t('netSavingsSub')}
          icon={IndianRupee}
          color="emerald"
          badge="+24.5%"
        />
        <KPICard
          title={t('retailersBenefited')}
          value={data?.metrics?.total_retailers || 30}
          subtext={t('retailersSub')}
          icon={Users}
          color="blue"
          badge="Hyderabad Hub"
        />
        <KPICard
          title={t('procurementPools')}
          value={data?.metrics?.total_active_pools || 12}
          subtext={t('poolsSub')}
          icon={Layers}
          color="purple"
          badge={`${data?.metrics?.pools_achieved_threshold || 9} Active`}
        />
        <KPICard
          title={t('avgSavingsPct')}
          value={`${data?.metrics?.average_savings_percentage || 18.5}%`}
          subtext={t('avgSavingsSub')}
          icon={Percent}
          color="amber"
          badge="Up to 24%"
        />
      </div>

      {/* Charts Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Monthly Savings Trend Chart */}
        <div className="lg:col-span-2 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('monthlySavingsGrowth')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('cumulativeSavingsDesc')}
              </p>
            </div>
            <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              ₹84,520 {t('totalSaved')}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.monthly_savings_trend || MOCK_DASHBOARD.monthly_savings_trend}>
                <defs>
                  <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#166534" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#166534" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#F1F5F9' : '#1E293B'} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                <YAxis stroke="#64748B" fontSize={11} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', 
                    borderColor: '#CBD5E1',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                  formatter={(val) => [formatINR(val), 'Group Savings']}
                />
                <Area type="monotone" dataKey="savings" stroke="#166534" strokeWidth={2} fillOpacity={1} fill="url(#savingsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart */}
        <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="pb-2 border-b border-slate-100 dark:border-slate-700 mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                {t('categoryBreakdown')}
              </h3>
              <p className="text-[11px] text-slate-500">
                {t('categoryDesc')}
              </p>
            </div>

            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: theme === 'light' ? '#FFFFFF' : '#1E293B', 
                      borderColor: '#CBD5E1',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center space-x-1.5">
                  <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: item.color }} />
                  <span className="font-medium truncate text-slate-700 dark:text-slate-300">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Urgent Recommendations */}
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          {t('highPriorityOpps')}
        </h2>
        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(0, 3).map((rec) => (
              <RecommendationCard
                key={rec.id || rec.pool_id || Math.random()}
                recommendation={rec}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewDetails={setSelectedPool}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <p className="text-slate-500 text-xs">{t('noPools')}</p>
          </div>
        )}
      </div>

      {/* Pool Detail Modal */}
      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          onClose={() => setSelectedPool(null)}
          onAccept={(p) => {
            setSelectedPool(null);
            handleAccept(p);
          }}
        />
      )}
    </div>
  );
}
