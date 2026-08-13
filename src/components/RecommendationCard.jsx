import React from 'react';
import { Store, MapPin, Check, X, ArrowUpRight, Sparkles } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { useApp } from '../context/AppContext';

export default function RecommendationCard({ recommendation, onAccept, onReject, onViewDetails }) {
  const { theme, t } = useApp();
  const {
    product_name,
    category,
    retailer_names,
    threshold_status,
    threshold_quantity,
    current_pool_quantity,
    estimated_total_savings,
    estimated_savings_percentage,
    average_cluster_distance_km,
    explanation
  } = recommendation;

  const progressPct = Math.min(100, Math.round((current_pool_quantity / threshold_quantity) * 100));

  return (
    <div className={`glass-card rounded-2xl p-5 border flex flex-col justify-between transition-all duration-300 ${
      theme === 'light'
        ? 'bg-white/85 border-slate-200/80 shadow-[0_10px_25px_rgba(0,0,0,0.03)] hover:border-blue-300'
        : 'border-slate-800'
    }`}>
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
            theme === 'light'
              ? 'bg-blue-50 text-blue-700 border-blue-200'
              : 'bg-accentBlue/10 text-accentBlue border-accentBlue/20'
          }`}>
            {category || "Procurement Pool"}
          </span>
          <StatusBadge status={threshold_status} />
        </div>

        {/* Product Title */}
        <h3 className={`text-lg font-bold mt-3 line-clamp-1 ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>{product_name}</h3>

        {/* Retailers & Distance */}
        <div className={`mt-3 flex items-center justify-between text-xs border-b pb-3 ${
          theme === 'light' ? 'text-slate-500 border-slate-100' : 'text-slate-400 border-slate-800/60'
        }`}>
          <span className="flex items-center">
            <Store className="w-3.5 h-3.5 mr-1 text-purple-500" />
            {retailer_names ? retailer_names.length : 0} {t('storesParticipating')}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-blue-500" />
            ~{average_cluster_distance_km} km {t('avgRadius')}
          </span>
        </div>

        {/* Threshold Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className={theme === 'light' ? 'text-slate-600 font-medium' : 'text-slate-400 font-medium'}>
              {t('thresholdProgress')}
            </span>
            <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {current_pool_quantity} / {threshold_quantity} Units ({progressPct}%)
            </span>
          </div>
          <div className={`w-full h-2.5 rounded-full overflow-hidden border ${
            theme === 'light' ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                threshold_status === 'ACHIEVED' 
                  ? 'bg-emerald-500' 
                  : 'bg-blue-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Savings Box */}
        <div className={`mt-4 p-3 rounded-xl border flex items-center justify-between ${
          theme === 'light'
            ? 'bg-emerald-50/80 border-emerald-200'
            : 'bg-emerald-500/10 border-emerald-500/20'
        }`}>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400">
              {t('totalGroupSavings')}
            </span>
            <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
              ₹{estimated_total_savings ? estimated_total_savings.toLocaleString() : 0}
            </div>
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
            {estimated_savings_percentage}% OFF
          </div>
        </div>

        {/* AI Explanation Snippet */}
        <p className={`mt-3 text-xs line-clamp-2 leading-relaxed ${
          theme === 'light' ? 'text-slate-600' : 'text-slate-400'
        }`}>
          <Sparkles className="w-3 h-3 inline mr-1 text-purple-500" />
          {explanation}
        </p>
      </div>

      {/* Action Buttons */}
      <div className={`mt-5 pt-3 border-t flex items-center space-x-2 ${
        theme === 'light' ? 'border-slate-100' : 'border-slate-800/80'
      }`}>
        <button 
          onClick={() => onReject(recommendation.id)}
          className={`p-2.5 rounded-xl border transition ${
            theme === 'light'
              ? 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50'
              : 'border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10'
          }`}
          title="Reject Pool"
        >
          <X className="w-4 h-4" />
        </button>
        <button 
          onClick={() => onViewDetails(recommendation)}
          className={`flex-1 py-2.5 px-3 rounded-xl border text-xs font-semibold transition flex items-center justify-center space-x-1 ${
            theme === 'light'
              ? 'border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'
              : 'border-slate-700 text-slate-200 hover:border-slate-500 hover:bg-slate-800'
          }`}
        >
          <span>{t('viewDetails')}</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
        <button 
          onClick={() => onAccept(recommendation)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center space-x-1 shadow-sm active:scale-95"
        >
          <Check className="w-4 h-4" />
          <span>{t('acceptPoolBtn')}</span>
        </button>
      </div>
    </div>
  );
}
