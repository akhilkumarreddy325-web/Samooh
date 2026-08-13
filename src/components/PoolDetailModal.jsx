import React from 'react';
import { X, Store, MapPin, Package, Sparkles, CheckCircle2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useApp } from '../context/AppContext';

export default function PoolDetailModal({ pool, onClose, onAccept }) {
  const { theme, t } = useApp();
  if (!pool) return null;

  const unitRetail = pool.unit_retail_price || 1450.0;
  const unitWholesale = pool.unit_wholesale_price || 1180.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div className={`border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl transition-colors duration-300 ${
        theme === 'light'
          ? 'bg-white/95 border-slate-200 text-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15)]'
          : 'bg-[#131A2A] border-slate-700/80 text-white'
      }`}>
        {/* Header */}
        <div className={`p-6 border-b flex items-start justify-between ${
          theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <div>
            <div className="flex items-center space-x-3">
              <span className={`text-xs font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border ${
                theme === 'light'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-accentPurple/10 text-accentPurple border-accentPurple/20'
              }`}>
                {pool.category || "Procurement Pool"}
              </span>
              <StatusBadge status={pool.threshold_status} />
            </div>
            <h2 className={`text-xl font-bold mt-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {pool.product_name}
            </h2>
            <p className={`text-xs mt-1 flex items-center ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
              {t('avgRadius')}: <strong className={`ml-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{pool.average_cluster_distance_km} km</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className={`p-2 rounded-xl transition ${
              theme === 'light'
                ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-200/60'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* AI Explanation Banner */}
          <div className={`p-4 rounded-xl border flex items-start space-x-3 ${
            theme === 'light'
              ? 'bg-purple-50/80 border-purple-200'
              : 'bg-accentPurple/10 border-accentPurple/20'
          }`}>
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-accentPurple flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-purple-700 dark:text-accentPurple uppercase tracking-wider">AI Procurement Explanation</h4>
              <p className={`text-xs mt-1 leading-relaxed ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>{pool.explanation}</p>
            </div>
          </div>

          {/* Pricing & Progress Highlights */}
          <div className="grid grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t('unitRetailPrice')}</span>
              <div className={`text-lg font-bold mt-1 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>₹{unitRetail.toLocaleString()}</div>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
            }`}>
              <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>{t('unitWholesalePrice')}</span>
              <div className="text-lg font-bold text-emerald-600 dark:text-accentGreen mt-1">₹{unitWholesale.toLocaleString()}</div>
            </div>
            <div className={`p-4 rounded-xl border ${
              theme === 'light'
                ? 'bg-emerald-50 border-emerald-200'
                : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <span className="text-xs text-emerald-600 font-semibold">{t('totalGroupSavings')}</span>
              <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-1">₹{pool.estimated_total_savings.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-300">({pool.estimated_savings_percentage}% discount)</span>
            </div>
          </div>

          {/* Threshold Progress */}
          <div>
            <div className={`flex justify-between items-center text-xs font-semibold mb-2 ${
              theme === 'light' ? 'text-slate-700' : 'text-slate-300'
            }`}>
              <span className="flex items-center">
                <Package className="w-3.5 h-3.5 mr-1 text-blue-500" />
                {t('thresholdProgress')}
              </span>
              <span>{pool.current_pool_quantity} / {pool.threshold_quantity} Units</span>
            </div>
            <div className={`w-full h-3 rounded-full overflow-hidden p-0.5 border ${
              theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-800 border-slate-700'
            }`}>
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  pool.threshold_status === 'ACHIEVED' ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${Math.min(100, (pool.current_pool_quantity / pool.threshold_quantity) * 100)}%` }}
              />
            </div>
          </div>

          {/* Retailers Itemized List */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-wider mb-3 flex items-center ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              <Store className="w-4 h-4 mr-1 text-blue-500" />
              {t('participatingStores')} ({pool.retailer_names ? pool.retailer_names.length : 0})
            </h4>
            <div className="space-y-2">
              {pool.retailer_names && pool.retailer_names.map((name, idx) => (
                <div key={idx} className={`p-3 rounded-xl border flex items-center justify-between ${
                  theme === 'light'
                    ? 'bg-slate-50/90 border-slate-200'
                    : 'bg-slate-900/40 border-slate-800/80'
                }`}>
                  <div className="flex items-center space-x-3">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-600 dark:text-accentBlue flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h5 className={`text-sm font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{name}</h5>
                      <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Kirana Store • Hyderabad</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">~₹{Math.round(pool.estimated_total_savings / pool.retailer_names.length).toLocaleString()} saved</span>
                    <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Allocated Demand: ~10 units</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className={`p-4 border-t flex items-center justify-end space-x-3 ${
          theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'
        }`}>
          <button 
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              theme === 'light'
                ? 'text-slate-600 hover:bg-slate-200/80'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Close
          </button>
          <button 
            onClick={() => {
              onAccept(pool);
              onClose();
            }}
            className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1.5 transition shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{t('acceptPoolBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
