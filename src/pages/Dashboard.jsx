import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IndianRupee, 
  Users, 
  Layers, 
  Percent, 
  Sparkles, 
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
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { theme, t, setActiveInvoice } = useApp();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPool, setSelectedPool] = useState(null);
  const [acceptedPools, setAcceptedPools] = useState(new Set());
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
      setData(dashRes);
      setRecommendations(recRes.data || []);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend');
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
    const pool = typeof poolOrId === 'object' ? poolOrId : recommendations.find(r => r.id === poolOrId);
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
        <div className={`h-8 rounded-xl w-1/3 ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'}`}></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-28 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'}`}></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={`lg:col-span-2 h-72 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'}`}></div>
          <div className={`h-72 rounded-2xl border ${theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'}`}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 max-w-xl mx-auto text-center space-y-4 my-12 glass-card rounded-2xl border ${
        theme === 'light' ? 'bg-white border-rose-200 shadow-md' : 'border-rose-500/30'
      }`}>
        <div className="w-14 h-14 rounded-full bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{t('backendUnreachable')}</h3>
        <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
          Could not fetch real data from backend.
        </p>
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button 
            onClick={loadDashboardData}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
              theme === 'light' ? 'bg-slate-200 text-slate-800 hover:bg-slate-300' : 'bg-slate-800 text-white hover:bg-slate-700'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>{t('retryConnection')}</span>
          </button>
          <button 
            onClick={handleSeedData}
            disabled={isSeeding}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition flex items-center space-x-1.5 shadow-md"
          >
            <Database className="w-4 h-4" />
            <span>{isSeeding ? t('seeding') : t('seedBackendStart')}</span>
          </button>
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const categoryBreakdown = data?.category_breakdown || {};
  
  const totalSavings = metrics.total_community_savings_inr || 84520;
  const monthlySavingsTrend = [
    { month: 'Jan', savings: Math.round(totalSavings * 0.15) },
    { month: 'Feb', savings: Math.round(totalSavings * 0.30) },
    { month: 'Mar', savings: Math.round(totalSavings * 0.50) },
    { month: 'Apr', savings: Math.round(totalSavings * 0.75) },
    { month: 'May', savings: Math.round(totalSavings * 0.90) },
    { month: 'Jun', savings: totalSavings }
  ];

  const pieColors = ['#2563EB', '#8B5CF6', '#10B981', '#F59E0B', '#EC4899'];
  const pieData = Object.keys(categoryBreakdown).map((cat, idx) => ({
    name: cat,
    value: categoryBreakdown[cat],
    color: pieColors[idx % pieColors.length]
  }));

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {t('groupProcurementDashboard')}
            <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
              theme === 'light'
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-accentBlue/10 text-accentBlue border-accentBlue/30'
            }`}>
              <Sparkles className="w-3 h-3 text-blue-500" />
              <span>{t('demoStoreActive')}</span>
            </span>
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('dashboardDesc')}
          </p>
        </div>

        <button 
          onClick={handleSeedData}
          disabled={isSeeding}
          className={`px-3.5 py-2 rounded-xl border text-xs font-semibold transition flex items-center space-x-2 w-fit ${
            theme === 'light'
              ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
              : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Database className="w-4 h-4 text-purple-500" />
          <span>{isSeeding ? t('seeding') : t('resetSeedData')}</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <KPICard 
          title={t('estimatedSavings')}
          value={`₹${(metrics.total_community_savings_inr || 0).toLocaleString()}`}
          change="+24.5% group impact"
          isPositive={true}
          icon={IndianRupee}
          accentColor="green"
          subtitle={t('netSavingsSub')}
        />
        <KPICard 
          title={t('retailersBenefited')}
          value={metrics.total_retailers || 0}
          change="30 Kirana partners"
          isPositive={true}
          icon={Users}
          accentColor="blue"
          subtitle={t('retailersSub')}
        />
        <KPICard 
          title={t('procurementPools')}
          value={metrics.total_active_pools || 0}
          change={`${metrics.pools_achieved_threshold || 0} met threshold`}
          isPositive={true}
          icon={Layers}
          accentColor="purple"
          subtitle={t('poolsSub')}
        />
        <KPICard 
          title={t('avgSavingsPct')}
          value={`${metrics.average_savings_percentage || 18.5}%`}
          change="Tier discount unlocked"
          isPositive={true}
          icon={Percent}
          accentColor="amber"
          subtitle={t('avgSavingsSub')}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Savings Trend */}
        <div className={`lg:col-span-2 glass-card rounded-2xl p-6 border ${
          theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                {t('monthlySavingsGrowth')}
              </h3>
              <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                {t('cumulativeSavingsDesc')}
              </p>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-accentGreen bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              ₹{(metrics.total_community_savings_inr || 0).toLocaleString()} {t('totalSaved')}
            </span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlySavingsTrend}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme === 'light' ? '#E2E8F0' : '#1E293B'} />
                <XAxis dataKey="month" stroke={theme === 'light' ? '#64748B' : '#64748B'} fontSize={11} />
                <YAxis stroke={theme === 'light' ? '#64748B' : '#64748B'} fontSize={11} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'light' ? '#FFFFFF' : '#131A2A', 
                    borderColor: theme === 'light' ? '#CBD5E1' : '#334155', 
                    borderRadius: '12px', 
                    color: theme === 'light' ? '#0F172A' : '#F8FAFC' 
                  }} 
                  formatter={(val) => [`₹${val.toLocaleString()}`, t('estimatedSavings')]}
                />
                <Area type="monotone" dataKey="savings" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorSavings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className={`glass-card rounded-2xl p-6 border flex flex-col justify-between ${
          theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
        }`}>
          <div>
            <h3 className={`text-sm font-bold uppercase tracking-wider ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
              {t('categoryBreakdown')}
            </h3>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('categoryDesc')}
            </p>
          </div>
          <div className="h-48 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ 
                  backgroundColor: theme === 'light' ? '#FFFFFF' : '#131A2A', 
                  borderColor: theme === 'light' ? '#CBD5E1' : '#334155', 
                  borderRadius: '8px' 
                }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className={`font-medium truncate ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  {item.name} ({item.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Urgent Recommendations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-lg font-bold tracking-tight flex items-center ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
              {t('highPriorityOpps')}
            </h2>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              {t('liveAiClusters')}
            </p>
          </div>
        </div>

        {recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewDetails={setSelectedPool}
              />
            ))}
          </div>
        ) : (
          <div className={`p-8 text-center glass-card rounded-2xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'border-slate-800'
          }`}>
            <p className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t('noPools')}</p>
            <button onClick={handleSeedData} className="mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md">
              {t('seedAndGenerate')}
            </button>
          </div>
        )}
      </div>

      {/* Pool Detail Modal */}
      {selectedPool && (
        <PoolDetailModal
          pool={selectedPool}
          onClose={() => setSelectedPool(null)}
          onAccept={(p) => handleAccept(p.id)}
        />
      )}
    </div>
  );
}
