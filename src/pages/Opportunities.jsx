import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Filter, Search, RefreshCw, Database, Sparkles, Layers, Users } from 'lucide-react';
import RecommendationCard from '../components/RecommendationCard';
import PoolDetailModal from '../components/PoolDetailModal';
import ProcurementOpportunityCard from '../components/ProcurementOpportunityCard';
import RetailerCompatibilityCard from '../components/RetailerCompatibilityCard';
import { 
  getRecommendations, 
  generateRecommendations, 
  seedData, 
  getProcurementOpportunities, 
  recalculateProcurementOpportunities,
  getRetailerCompatibility
} from '../services/api';
import { useApp } from '../context/AppContext';

export default function Opportunities() {
  const { theme, t, setActiveInvoice, user, addOrderToHistory } = useApp();
  const navigate = useNavigate();

  // Tab State: 'OPPORTUNITIES' (Engine View) | 'COMPATIBILITY' (Why Stores Match) | 'POOLS' (Active Group Pools)
  const [activeTab, setActiveTab] = useState('OPPORTUNITIES');

  // Opportunities State (Upgrade #2)
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpps, setFilteredOpps] = useState([]);
  const [oppFilterStatus, setOppFilterStatus] = useState('ALL');

  // Compatibility State (Prompt 3)
  const [compatibilities, setCompatibilities] = useState([]);
  const [filteredCompat, setFilteredCompat] = useState([]);
  const [compatFilterStatus, setCompatFilterStatus] = useState('ALL');

  // Recommendations / Pools State (Existing)
  const [recommendations, setRecommendations] = useState([]);
  const [filteredRecs, setFilteredRecs] = useState([]);
  const [selectedPool, setSelectedPool] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // Shared Search & Category Filters
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  async function loadAllData() {
    setLoading(true);
    setError(null);
    try {
      const [recsRes, oppsRes, compatRes] = await Promise.all([
        getRecommendations(),
        getProcurementOpportunities(),
        getRetailerCompatibility(user?.uid || user?.id || null)
      ]);
      const recs = recsRes.data || [];
      const opps = oppsRes.data || [];
      const compats = compatRes?.results || [];
      setRecommendations(recs);
      setFilteredRecs(recs);
      setOpportunities(opps);
      setFilteredOpps(opps);
      setCompatibilities(compats);
      setFilteredCompat(compats);
    } catch (err) {
      setError(err.message || 'Failed to load procurement opportunities');
    } finally {
      setLoading(false);
    }
  }

  // Filter Opportunities
  useEffect(() => {
    let result = [...opportunities];

    if (oppFilterStatus !== 'ALL') {
      result = result.filter(o => o.status === oppFilterStatus);
    }
    if (filterCategory !== 'ALL') {
      result = result.filter(o => o.category === filterCategory || o.sectorId === filterCategory.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o.productName && o.productName.toLowerCase().includes(q)) ||
        (o.canonicalProductId && o.canonicalProductId.toLowerCase().includes(q)) ||
        (o.category && o.category.toLowerCase().includes(q)) ||
        (o.supplierName && o.supplierName.toLowerCase().includes(q))
      );
    }

    setFilteredOpps(result);
  }, [oppFilterStatus, filterCategory, searchQuery, opportunities]);

  // Filter Recommendations / Pools
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

  // Filter Compatibility (Prompt 3)
  useEffect(() => {
    let result = [...compatibilities];

    if (compatFilterStatus !== 'ALL') {
      result = result.filter(c => c.compatibilityStatus === compatFilterStatus);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => 
        (c.retailerBName && c.retailerBName.toLowerCase().includes(q)) ||
        (c.sectorBId && c.sectorBId.toLowerCase().includes(q)) ||
        (c.scoreLabel && c.scoreLabel.toLowerCase().includes(q)) ||
        (c.compatibleProducts && c.compatibleProducts.some(p => 
          (p.productName && p.productName.toLowerCase().includes(q)) ||
          (p.canonicalProductId && p.canonicalProductId.toLowerCase().includes(q))
        ))
      );
    }

    setFilteredCompat(result);
  }, [compatFilterStatus, searchQuery, compatibilities]);

  const handleRecalculateOpportunities = async () => {
    setIsRefreshing(true);
    try {
      const res = await recalculateProcurementOpportunities();
      const opps = res.data || [];
      setOpportunities(opps);
    } catch (err) {
      setError('Failed to recalculate opportunities: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRegenerate = async () => {
    setIsRefreshing(true);
    try {
      await generateRecommendations();
      await loadAllData();
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
      await loadAllData();
    } catch (err) {
      setError('Failed to seed: ' + err.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFormPoolFromOpportunity = (opportunity) => {
    // Switch to active pools view and highlight matching recommendation
    setActiveTab('POOLS');
    const matched = recommendations.find(r => 
      r.product_id === opportunity.productId || 
      (opportunity.canonicalProductId && r.product_id === opportunity.canonicalProductId)
    );
    if (matched) {
      setSelectedPool(matched);
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
              {activeTab === 'OPPORTUNITIES' 
                ? `${filteredOpps.length} Evaluated` 
                : activeTab === 'COMPATIBILITY'
                ? `${filteredCompat.length} Partner Pairs`
                : `${filteredRecs.length} Pools Available`}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {activeTab === 'OPPORTUNITIES' 
              ? 'Real-time deterministic identification of group procurement opportunities matching retailer demand with wholesale supplier constraints.'
              : activeTab === 'COMPATIBILITY'
              ? 'Explainable Retailer Compatibility Engine: Evaluates spatial proximity, shared canonical products, demand volume synergy, and restock timing to identify natural buying groups.'
              : t('opportunitiesDesc')}
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
          
          {activeTab === 'OPPORTUNITIES' ? (
            <button 
              onClick={handleRecalculateOpportunities}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Recalculate Opportunities'}</span>
            </button>
          ) : activeTab === 'COMPATIBILITY' ? (
            <button 
              onClick={loadAllData}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Scanning...' : 'Refresh Compatibility'}</span>
            </button>
          ) : (
            <button 
              onClick={handleRegenerate}
              disabled={isRefreshing}
              className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? 'Re-evaluating...' : 'Re-evaluate Pools'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigation: Opportunities Engine vs Compatibility vs Active Pools */}
      <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('OPPORTUNITIES')}
          className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'OPPORTUNITIES'
              ? 'border-emerald-800 text-emerald-800 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Procurement Opportunities ({opportunities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('COMPATIBILITY')}
          className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'COMPATIBILITY'
              ? 'border-emerald-800 text-emerald-800 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Retailer Compatibility ({compatibilities.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('POOLS')}
          className={`pb-2.5 px-3 text-xs font-bold transition flex items-center space-x-1.5 border-b-2 ${
            activeTab === 'POOLS'
              ? 'border-emerald-800 text-emerald-800 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Active Procurement Pools ({recommendations.length})</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder={
              activeTab === 'OPPORTUNITIES' 
                ? "Search product, canonical ID, or supplier..." 
                : activeTab === 'COMPATIBILITY'
                ? "Search partner store, shared product, or sector..."
                : t('searchPlaceholder')
            }
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
          {activeTab === 'OPPORTUNITIES' ? (
            ['ALL', 'FEASIBLE', 'BELOW_MOQ', 'INSUFFICIENT_STOCK', 'ALREADY_IN_POOL'].map((status) => (
              <button
                key={status}
                onClick={() => setOppFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  oppFilterStatus === status 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All Opportunities' : status.replace('_', ' ')}
              </button>
            ))
          ) : activeTab === 'COMPATIBILITY' ? (
            ['ALL', 'COMPATIBLE', 'PARTIALLY_COMPATIBLE', 'LOCATION_REQUIRED'].map((status) => (
              <button
                key={status}
                onClick={() => setCompatFilterStatus(status)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition whitespace-nowrap ${
                  compatFilterStatus === status 
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                {status === 'ALL' ? 'All Partners' : status.replace('_', ' ')}
              </button>
            ))
          ) : (
            ['ALL', 'ACHIEVED', 'NEAR_THRESHOLD', 'IN_PROGRESS'].map((status) => (
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
            ))
          )}
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

      {/* Main View Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"></div>
          ))}
        </div>
      ) : activeTab === 'OPPORTUNITIES' ? (
        filteredOpps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOpps.map((opp) => (
              <ProcurementOpportunityCard
                key={opp.opportunityId || opp.id || Math.random()}
                opportunity={opp}
                onFormPool={handleFormPoolFromOpportunity}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <p className="text-slate-500 text-xs">No procurement opportunities match the current filter criteria.</p>
          </div>
        )
      ) : activeTab === 'COMPATIBILITY' ? (
        filteredCompat.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCompat.map((compat) => (
              <RetailerCompatibilityCard
                key={compat.compatibilityId || Math.random()}
                result={compat}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <p className="text-slate-500 text-xs">No compatible retailer partners match the current criteria.</p>
          </div>
        )
      ) : (
        filteredRecs.length > 0 ? (
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
        )
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

