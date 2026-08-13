import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, RefreshCw, CheckCircle2, Layers, AlertCircle, Database } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import PoolDetailModal from '../components/PoolDetailModal';
import { getRecommendations, generateRecommendations, seedData } from '../services/api';
import { useApp } from '../context/AppContext';

export default function Opportunities() {
  const { theme, t, setActiveInvoice, user, addOrderToHistory } = useApp();
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecs, setFilteredRecs] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [acceptedPools, setAcceptedPools] = useState(new Set());

  useEffect(() => {
    loadRecommendations();
  }, []);

  async function loadRecommendations() {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecommendations();
      const recs = res.data || [];
      setRecommendations(recs);
      setFilteredRecs(recs);
    } catch (err) {
      setError(err.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let result = [...recommendations];

    if (filterStatus !== 'ALL') {
      result = result.filter(r => r.threshold_status === filterStatus);
    }
    if (filterCategory !== 'ALL') {
      result = result.filter(r => r.category === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.product_name.toLowerCase().includes(q) ||
        (r.category && r.category.toLowerCase().includes(q))
      );
    }

    setFilteredRecs(result);
  }, [filterStatus, filterCategory, searchQuery, recommendations]);

  const handleRegenerate = async () => {
    setIsRefreshing(true);
    try {
      await generateRecommendations();
      await loadRecommendations();
    } catch (err) {
      setError('Failed to regenerate: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSeed = async () => {
    setIsRefreshing(true);
    try {
      await seedData();
      await loadRecommendations();
    } catch (err) {
      setError('Failed to seed: ' + err.message);
    } finally {
      setIsRefreshing(false);
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

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            {t('procurementOpportunities')}
            <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full border ${
              theme === 'light'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
            }`}>
              {filteredRecs.length} Pools Available
            </span>
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('opportunitiesDesc')}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleSeed}
            disabled={isRefreshing}
            className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition flex items-center space-x-1.5 ${
              theme === 'light'
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
                : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4 text-purple-500" />
            <span>{t('resetSeedData')}</span>
          </button>
          <button 
            onClick={handleRegenerate}
            disabled={isRefreshing}
            className={`px-4 py-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-2 ${
              theme === 'light'
                ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100 shadow-sm'
                : 'bg-accentPurple/10 text-accentPurple border-accentPurple/30 hover:bg-accentPurple/20'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Running AI Engine...' : 'Regenerate AI Pools'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className={`glass-card rounded-2xl p-4 border flex flex-wrap items-center justify-between gap-4 ${
        theme === 'light' ? 'bg-white/80 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)]' : 'border-slate-800'
      }`}>
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${
            theme === 'light' ? 'text-slate-400' : 'text-slate-500'
          }`} />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full border rounded-xl pl-9 pr-4 py-2 text-xs transition focus:outline-none ${
              theme === 'light'
                ? 'bg-slate-100/90 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white'
                : 'bg-[#0B1020] border-slate-800 text-slate-200 placeholder-slate-500 focus:border-accentBlue'
            }`}
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto py-1">
          <span className={`text-xs font-semibold flex items-center mr-1 ${
            theme === 'light' ? 'text-slate-500' : 'text-slate-400'
          }`}>
            <Filter className="w-3.5 h-3.5 mr-1" /> Status:
          </span>
          {['ALL', 'ACHIEVED', 'NEAR_THRESHOLD', 'IN_PROGRESS'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                filterStatus === status 
                  ? 'bg-blue-600 text-white shadow-sm font-bold'
                  : theme === 'light'
                    ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200'
                    : 'bg-[#0B1020] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {status === 'ALL' ? t('allOpps') : status === 'ACHIEVED' ? t('achieved') : status === 'NEAR_THRESHOLD' ? t('nearThreshold') : t('inProgress')}
            </button>
          ))}
        </div>

        {/* Category Dropdown */}
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={`border rounded-xl px-3 py-2 text-xs focus:outline-none ${
            theme === 'light'
              ? 'bg-slate-100 border-slate-200 text-slate-800 focus:border-blue-500'
              : 'bg-[#0B1020] border-slate-800 text-slate-300 focus:border-accentBlue'
          }`}
        >
          <option value="ALL">All Categories</option>
          <option value="Grains">Grains & Pulses</option>
          <option value="Oils">Oils & Dairy</option>
          <option value="Spices">Spices & Condiments</option>
          <option value="Beverages">Beverages & Snacks</option>
          <option value="Personal Care">Personal Care</option>
        </select>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className={`h-64 rounded-2xl border animate-pulse ${
              theme === 'light' ? 'bg-white border-slate-200' : 'bg-[#131A2A] border-slate-800'
            }`}></div>
          ))}
        </div>
      ) : error ? (
        /* Error State */
        <div className={`p-8 max-w-xl mx-auto text-center space-y-4 glass-card rounded-2xl border ${
          theme === 'light' ? 'bg-white border-rose-200 shadow-md' : 'border-rose-500/30'
        }`}>
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Failed to Load Opportunities</h3>
          <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>{error}</p>
          <button onClick={handleSeed} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-md">
            {t('seedAndGenerate')}
          </button>
        </div>
      ) : filteredRecs.length > 0 ? (
        /* Grid of Cards */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecs.map((rec) => (
            <div key={rec.id} className="relative">
              {acceptedPools.has(rec.id) && (
                <div className="absolute top-3 right-3 z-10 bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md flex items-center">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> {t('accepted')}
                </div>
              )}
              <RecommendationCard
                recommendation={rec}
                onAccept={handleAccept}
                onReject={handleReject}
                onViewDetails={setSelectedPool}
              />
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className={`glass-card rounded-2xl p-12 border text-center space-y-4 ${
          theme === 'light' ? 'bg-white/80 border-slate-200' : 'border-slate-800'
        }`}>
          <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
            theme === 'light' ? 'bg-slate-100 text-slate-500' : 'bg-slate-800/80 text-slate-400'
          }`}>
            <Layers className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className={`text-lg font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{t('noPools')}</h3>
          <p className={`text-xs max-w-md mx-auto ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            No procurement recommendation pools match your filters.
          </p>
          <button 
            onClick={handleSeed}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition"
          >
            {t('seedAndGenerate')}
          </button>
        </div>
      )}

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
