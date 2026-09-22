import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, RefreshCw, Database } from 'lucide-react';
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
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            {t('procurementOpportunities')}
            <span className="ml-2 text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {filteredRecs.length} Pools Available
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('opportunitiesDesc')}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={handleSeed}
            disabled={isRefreshing}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('resetSeedData')}</span>
          </button>
          <button 
            onClick={handleRegenerate}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Re-evaluating...' : 'Re-evaluate Pools'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto py-1">
          <span className="text-xs font-medium text-slate-500 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" /> Status:
          </span>
          {['ALL', 'ACHIEVED', 'NEAR_THRESHOLD', 'IN_PROGRESS'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                filterStatus === status 
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
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
          className="border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
          ))}
        </div>
      ) : filteredRecs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRecs.map((rec) => (
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
          <p className="text-slate-500 text-xs">No procurement pools match the current filter criteria.</p>
        </div>
      )}

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
