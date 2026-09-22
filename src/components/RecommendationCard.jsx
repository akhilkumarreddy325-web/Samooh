import React from 'react';
import { Store, MapPin, Check, X, ArrowUpRight, Truck } from 'lucide-react';
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
    <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-4 shadow-sm flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
            {category || "Procurement Pool"}
          </span>
          <StatusBadge status={threshold_status} />
        </div>

        {/* Product Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white mt-2.5 line-clamp-1">
          {product_name}
        </h3>

        {/* Retailers & Distance */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700/80 pb-2.5">
          <span className="flex items-center">
            <Store className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {retailer_names ? retailer_names.length : 0} {t('storesParticipating')}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            ~{average_cluster_distance_km} km {t('avgRadius')}
          </span>
        </div>

        {/* Threshold Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-slate-500 font-medium">
              {t('thresholdProgress')}
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {current_pool_quantity} / {threshold_quantity} Units ({progressPct}%)
            </span>
          </div>
          <div className="w-full h-2 rounded bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div 
              className={`h-full rounded transition-all duration-300 ${
                threshold_status === 'ACHIEVED' 
                  ? 'bg-emerald-800' 
                  : 'bg-slate-600'
              }`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Savings Box */}
        <div className="mt-3 p-3 rounded-md border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/50 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-semibold text-emerald-800 dark:text-emerald-400 block">
              {t('totalGroupSavings')}
            </span>
            <div className="text-base font-bold text-emerald-900 dark:text-emerald-300">
              ₹{estimated_total_savings ? estimated_total_savings.toLocaleString() : 0}
            </div>
          </div>
          <div className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200 font-semibold text-xs border border-emerald-200 dark:border-emerald-800">
            {estimated_savings_percentage}% Margin
          </div>
        </div>

        {/* Transport Fleet Recommendation Pill */}
        <div className="mt-2.5 p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-1.5 truncate">
            <Truck className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
            <span className="truncate font-medium text-slate-800 dark:text-slate-200 text-[11px]">
              {recommendation.transport?.recommended_vehicle || 'Tata Ace (SCV)'}
            </span>
          </div>
          <div className="flex items-center space-x-1.5 flex-shrink-0">
            <span className="text-[11px] text-slate-500">
              {recommendation.transport?.total_load_kg ? `${Math.round(recommendation.transport.total_load_kg)} kg` : `${Math.round(current_pool_quantity * 25)} kg`}
            </span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {recommendation.transport?.capacity_utilization_pct || Math.round((current_pool_quantity * 25 / 1000) * 100)}% Load
            </span>
          </div>
        </div>

        {/* Procurement Explanation Snippet */}
        <p className="mt-2.5 text-xs line-clamp-2 leading-relaxed text-slate-500 dark:text-slate-400">
          {explanation}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center space-x-2">
        <button 
          onClick={() => onReject(recommendation.id)}
          className="p-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          title="Dismiss Opportunity"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        <button 
          onClick={() => onViewDetails && onViewDetails(recommendation)}
          className="flex-1 py-1.5 px-2 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center justify-center space-x-1"
        >
          <span>Audit Logistics</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>

        <button 
          onClick={() => onAccept(recommendation)}
          className="flex-1 py-1.5 px-2 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Join Pool</span>
        </button>
      </div>
    </div>
  );
}
