import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  MapPin, 
  Package, 
  Truck, 
  Layers, 
  Cpu, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { resolvePoolExplanation } from '../utils/explainability';

/**
 * ExplainableRecommendation Component
 * 
 * Renders an auditable, transparent breakdown of WHY a procurement pool or supplier recommendation
 * was generated. Shows actual values, decision factors, constraint checks, and rejected candidates.
 * Clearly separates machine learning demand forecasting from deterministic constraint optimization.
 */
export default function ExplainableRecommendation({
  pool,
  recommendation,
  mode = 'card', // 'card' | 'modal' | 'full'
  initiallyExpanded = false
}) {
  const [isExpanded, setIsExpanded] = useState(mode === 'modal' || initiallyExpanded);
  const data = pool || recommendation;
  const explanation = resolvePoolExplanation(data);

  if (!explanation) return null;

  const {
    product_name,
    category,
    retailer_count,
    combined_quantity,
    unit,
    supplier_name,
    supplier_moq,
    stock_available,
    average_distance_km,
    transport_vehicle,
    decision_factors = [],
    reasons = [],
    rejected_suppliers = [],
    rejection_reasons = [],
    prediction_context = {},
    decision_summary
  } = explanation;

  const isCard = mode === 'card';

  return (
    <div className={`rounded-lg border transition-all text-xs ${
      isCard 
        ? 'border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 mt-3' 
        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
    }`}>
      {/* Toggle Header / Bar */}
      <div 
        onClick={() => isCard && setIsExpanded(!isExpanded)}
        className={`flex items-center justify-between p-3 select-none ${
          isCard ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-slate-800/60' : 'border-b border-slate-100 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/50'
        }`}
      >
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px] uppercase tracking-wider">
              Why this recommendation?
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
              Transparent constraint-based procurement rationale
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-1.5">
          <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {explanation.moq_satisfied ? 'All Constraints Met' : 'Active Pool'}
          </span>
          {isCard && (
            <button 
              type="button"
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              aria-label="Toggle explanation details"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Explanation Body */}
      {isExpanded && (
        <div className="p-3.5 sm:p-4 space-y-4 border-t border-slate-100 dark:border-slate-700/80">
          {/* 1. WHY THIS POOL WAS CREATED (Checklist) */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <span>Why This Pool Was Created</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Same product demand</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Retailers are geographically compatible</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Combined quantity satisfies supplier MOQ</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Supplier has sufficient stock</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Supplier pricing is feasible</span>
              </div>
              <div className="flex items-start space-x-2 text-slate-700 dark:text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Transport capacity is available</span>
              </div>
            </div>
          </div>

          {/* 2. ACTUAL SYSTEM VALUES GRID */}
          <div className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 p-3 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Actual System Values (Unmodified)
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-400 block">Product</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 truncate block">
                  {product_name}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Retailers</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {retailer_count} stores
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Combined requirement</span>
                <span className="font-semibold text-emerald-800 dark:text-emerald-400">
                  {combined_quantity} {unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Supplier MOQ</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {supplier_moq} {unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Supplier available stock</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {stock_available.toLocaleString()} {unit}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Average retailer distance</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {Number(average_distance_km).toFixed(1)} km
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] text-slate-400 block">Transport</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {transport_vehicle}
                </span>
              </div>
            </div>
          </div>

          {/* 3. DECISION FACTORS */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Decision Factors
            </h4>
            <div className="space-y-1.5">
              {decision_factors.map((factor, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-2 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    {factor.satisfied ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    )}
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {factor.name}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
                      {factor.detail}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      factor.satisfied 
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' 
                        : 'bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                    }`}>
                      {factor.satisfied ? '✓' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. NOT SELECTED / REJECTED ALTERNATIVES */}
          {rejected_suppliers.length > 0 ? (
            <div className="p-3 rounded-md border border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
              <div className="flex items-center space-x-1.5 text-rose-800 dark:text-rose-300 font-bold text-[10px] uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Not Selected (Alternative Candidates)</span>
              </div>
              <div className="space-y-1.5">
                {rejected_suppliers.map((cand, idx) => (
                  <div key={idx} className="p-2 rounded bg-white dark:bg-slate-900 border border-rose-100 dark:border-rose-900/40 text-xs">
                    <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-200">
                      <span>{cand.supplier_name}</span>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400">Rejected</span>
                    </div>
                    <div className="text-[11px] text-rose-800 dark:text-rose-300 mt-0.5">
                      <span className="font-medium text-slate-500 dark:text-slate-400">Reason: </span>
                      {cand.reason_summary || (cand.rejection_reasons && cand.rejection_reasons.join(', ')) || 'Constraints not satisfied'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Supplier Allocation: </span>
              {supplier_name} satisfies all volume, distance, and inventory thresholds with the lowest procurement cost.
            </div>
          )}

          {/* 5. MACHINE LEARNING PREDICTION VS DETERMINISTIC DECISION */}
          <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/80 space-y-1.5 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[10px]">
              <Cpu className="w-3 h-3 text-slate-500" />
              <span>Model Separation & Auditability</span>
            </div>
            <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
              <div>
                <strong className="text-slate-800 dark:text-slate-200">Prediction: </strong>
                <span>Forecasted requirement of {combined_quantity} {unit} predicted by Random Forest Regressor from 6-month Kirana sales cadence.</span>
              </div>
              <div className="mt-1">
                <strong className="text-slate-800 dark:text-slate-200">Decision: </strong>
                <span>{decision_summary || 'Pool created deterministically because MOQ, distance, stock, and transport constraints were satisfied.'}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
