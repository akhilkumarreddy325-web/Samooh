import React, { useState } from 'react';
import { Store, MapPin, Package, Check, X, AlertTriangle, Info, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { formatINR } from '../utils/currency';

export default function ProcurementOpportunityCard({ opportunity, onFormPool }) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!opportunity) return null;

  const {
    productName,
    canonicalProductId,
    category,
    sectorId,
    retailerCount,
    retailerNames,
    combinedQuantity,
    unit,
    supplierName,
    supplierMOQ,
    supplierAvailableQuantity,
    moqShortfall,
    estimatedUnitPrice,
    estimatedTotalValue,
    geographicDistanceKm,
    geographicFeasibility,
    status,
    opportunityScore,
    scoreLabel,
    reasons = [],
    constraints = [],
    isAlreadyInPool,
    existingPoolId,
    isDemo
  } = opportunity;

  // Status Styling & Badge
  const getStatusBadge = () => {
    switch (status) {
      case 'FEASIBLE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3 h-3 mr-1 text-emerald-600 stroke-[3]" />
            FEASIBLE
          </span>
        );
      case 'BELOW_MOQ':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" />
            BELOW MOQ
          </span>
        );
      case 'INSUFFICIENT_STOCK':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <X className="w-3 h-3 mr-1 text-rose-600" />
            INSUFFICIENT STOCK
          </span>
        );
      case 'ALREADY_IN_POOL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Layers className="w-3 h-3 mr-1 text-blue-600" />
            ALREADY IN POOL
          </span>
        );
      case 'LOCATION_REQUIRED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300 border border-slate-300">
            <MapPin className="w-3 h-3 mr-1 text-slate-500" />
            LOCATION REQUIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-4 shadow-sm flex flex-col justify-between transition hover:border-slate-300 dark:hover:border-slate-600">
      <div>
        {/* Header: Category Badge & Status Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-1.5 flex-wrap">
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              {category || 'Commodity'}
            </span>
            {isDemo && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100/60 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Demo
              </span>
            )}
          </div>
          {getStatusBadge()}
        </div>

        {/* Product Title & Canonical ID */}
        <div className="mt-2.5">
          <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">
            {productName}
          </h3>
          {canonicalProductId && (
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              ID: {canonicalProductId}
            </p>
          )}
        </div>

        {/* Retailer Count & Distance */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-b border-slate-100 dark:border-slate-700/80 pb-2.5">
          <span className="flex items-center">
            <Store className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <strong>{retailerCount}</strong>&nbsp;compatible {retailerCount === 1 ? 'store' : 'stores'}
          </span>
          <span className="flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {geographicDistanceKm != null ? `~${geographicDistanceKm} km` : 'Location pending'}
          </span>
        </div>

        {/* Key Operational Metrics Grid */}
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-md border border-slate-100 dark:border-slate-800">
          <div>
            <span className="text-[11px] text-slate-400 block">Combined Demand</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {combinedQuantity} <span className="text-xs font-normal text-slate-500">{unit}</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Supplier MOQ</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              {supplierMOQ != null ? `${supplierMOQ} ${unit}` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Available Stock</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {supplierAvailableQuantity != null ? `${supplierAvailableQuantity} ${unit}` : 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 block">Wholesale Rate</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {estimatedUnitPrice ? `${formatINR(estimatedUnitPrice)}/${unit}` : 'Rate on quote'}
            </span>
          </div>
        </div>

        {/* Supplier Identity */}
        {supplierName && (
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <span className="text-[11px]">Supplier:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {supplierName}
            </span>
          </div>
        )}

        {/* Below MOQ Needs Notice */}
        {status === 'BELOW_MOQ' && moqShortfall > 0 && (
          <div className="mt-2.5 p-2 rounded bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200 flex items-center justify-between">
            <span className="font-medium">Needs:</span>
            <span className="font-bold">{moqShortfall} {unit} additional demand</span>
          </div>
        )}

        {/* Already In Pool Notice */}
        {isAlreadyInPool && existingPoolId && (
          <div className="mt-2.5 p-2 rounded bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200 flex items-center justify-between">
            <span className="font-medium">Committed to active pool:</span>
            <span className="font-bold font-mono">{existingPoolId}</span>
          </div>
        )}

        {/* Explainability Accordion ("Why this opportunity exists") */}
        <div className="mt-3 border-t border-slate-100 dark:border-slate-700/80 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 transition"
          >
            <span>Why this opportunity exists ({reasons.length})</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-2 text-xs">
              {/* Reasons Checklist */}
              <div className="space-y-1 bg-slate-50/50 dark:bg-slate-900/30 p-2 rounded border border-slate-100 dark:border-slate-800">
                {reasons.map((r, i) => (
                  <div key={i} className="flex items-start space-x-1.5 text-slate-600 dark:text-slate-400">
                    <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              {/* Constraints */}
              {constraints.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Active Constraints:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                    {constraints.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Participating Stores List */}
              {retailerNames && retailerNames.length > 0 && (
                <div className="pt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Participating Stores:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {retailerNames.map((name, i) => (
                      <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Deterministic Score & Action */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/80 flex items-center justify-between text-xs">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-medium">Opportunity Score</span>
          <div className="flex items-center space-x-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {opportunityScore} / 100
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              ({scoreLabel})
            </span>
          </div>
        </div>

        {status === 'FEASIBLE' && !isAlreadyInPool && (
          <button
            type="button"
            onClick={() => onFormPool && onFormPool(opportunity)}
            className="px-3 py-1.5 rounded bg-emerald-800 hover:bg-emerald-900 text-white font-semibold transition text-xs shadow-xs"
          >
            Form Procurement Pool
          </button>
        )}
      </div>
    </div>
  );
}
