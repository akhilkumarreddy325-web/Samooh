import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Package, 
  Calendar, 
  Building2, 
  ChevronDown, 
  ChevronUp,
  ShieldCheck,
  Scale
} from 'lucide-react';

export default function RetailerCompatibilityCard({ result }) {
  const [expanded, setExpanded] = useState(false);

  if (!result) return null;

  const {
    retailerAName,
    retailerBName,
    sectorAId,
    sectorBId,
    isSameSector,
    compatibilityStatus,
    compatibilityScore,
    scoreLabel,
    distanceKm,
    maxRadiusKm,
    geographicStatus,
    compatibleProducts = [],
    totalSharedDemand,
    timingCompatibility,
    reasons = [],
    constraints = [],
    exclusions = [],
    isDemo
  } = result;

  // Status badge styling
  let badgeClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  if (compatibilityStatus === 'COMPATIBLE' || compatibilityScore >= 80) {
    badgeClasses = 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  } else if (compatibilityStatus === 'PARTIALLY_COMPATIBLE' || compatibilityScore >= 50) {
    badgeClasses = 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';
  } else if (compatibilityStatus === 'LOCATION_REQUIRED') {
    badgeClasses = 'bg-sky-50 text-sky-800 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800';
  } else {
    badgeClasses = 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800';
  }

  return (
    <div className="rounded-lg border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition p-4 sm:p-5 text-stone-800 dark:text-stone-100">
      {/* Top Header: Partner Store & Score Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100 dark:border-stone-800">
        <div className="flex items-start sm:items-center space-x-3">
          <div className="w-9 h-9 rounded-md bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-700 flex-shrink-0">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {retailerBName || 'Partner Retail Store'}
              </h3>
              {isDemo && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300">
                  Demo
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {sectorBId ? sectorBId.replace(/_/g, ' ').toUpperCase() : 'RETAIL'} • {isSameSector ? 'Same Sector' : 'Cross-Sector Collaboration'}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-center">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${badgeClasses}`}>
            {scoreLabel} ({Math.round(compatibilityScore)}/100)
          </span>
        </div>
      </div>

      {/* Primary Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-3.5 py-2.5 px-3 rounded-md bg-stone-50 dark:bg-stone-800/60 border border-stone-200/70 dark:border-stone-700/60 text-xs">
        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Shared Products</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center space-x-1">
            <Package className="w-3.5 h-3.5 text-stone-500" />
            <span>{compatibleProducts.length} item{compatibleProducts.length === 1 ? '' : 's'}</span>
          </span>
        </div>

        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Combined Demand</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center space-x-1">
            <Scale className="w-3.5 h-3.5 text-stone-500" />
            <span>{totalSharedDemand > 0 ? `${totalSharedDemand} units` : 'Compatible'}</span>
          </span>
        </div>

        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Store Distance</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center space-x-1">
            <MapPin className="w-3.5 h-3.5 text-stone-500" />
            <span>{distanceKm !== null ? `${distanceKm} km` : 'Location required'}</span>
          </span>
        </div>

        <div>
          <span className="text-stone-500 dark:text-stone-400 block mb-0.5">Restock Timing</span>
          <span className="font-semibold text-stone-800 dark:text-stone-200 flex items-center space-x-1">
            <Calendar className="w-3.5 h-3.5 text-stone-500" />
            <span className={timingCompatibility === 'COMPATIBLE' ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-600 dark:text-stone-300'}>
              {timingCompatibility === 'COMPATIBLE' ? 'Aligned' : timingCompatibility === 'UNKNOWN' ? 'To be confirmed' : 'Offset'}
            </span>
          </span>
        </div>
      </div>

      {/* Shared Standardized Products List */}
      {compatibleProducts.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 tracking-wider uppercase">
            Shared Procurement Products
          </span>
          <div className="space-y-1">
            {compatibleProducts.map((p, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between text-xs py-1 px-2.5 rounded bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700"
              >
                <div>
                  <span className="font-medium text-stone-900 dark:text-stone-100">{p.productName}</span>
                  {p.canonicalProductId && (
                    <span className="ml-1.5 text-[10px] text-stone-400 font-mono">
                      ({p.canonicalProductId})
                    </span>
                  )}
                </div>
                <div className="text-stone-600 dark:text-stone-300 font-medium">
                  {p.combinedQuantity > 0 ? (
                    <span>Combined: {p.combinedQuantity} {p.unit}</span>
                  ) : (
                    <span>Shared need</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Explainability Section: Why These Stores Match */}
      <div className="mt-3 pt-3 border-t border-stone-100 dark:border-stone-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
            <span>Why These Retailers Match</span>
          </span>
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 flex items-center space-x-0.5 transition"
          >
            <span>{expanded ? 'Show less' : 'View details'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        {/* Reasons summary */}
        <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-300">
          {reasons.slice(0, expanded ? reasons.length : 2).map((reason, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
              <span>{reason}</span>
            </li>
          ))}
        </ul>

        {/* Expanded Constraints & Exclusions */}
        {expanded && (
          <div className="pt-2 space-y-2">
            {constraints.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-400 block">
                  Operational Considerations:
                </span>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                  {constraints.map((c, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {exclusions.length > 0 && (
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-400 block">
                  Exclusions & Constraints:
                </span>
                <ul className="space-y-1 text-xs text-stone-600 dark:text-stone-400">
                  {exclusions.map((e, idx) => (
                    <li key={idx} className="flex items-start space-x-2">
                      <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 mt-0.5 flex-shrink-0" />
                      <span>{e}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
