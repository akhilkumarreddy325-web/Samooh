import React from 'react';
import { Store, ShoppingBag, ShieldCheck, CheckCircle2, ArrowLeft, Loader2, Edit3, AlertCircle, RefreshCw } from 'lucide-react';
import { formatINR } from '../../../utils/currency';

export default function RetailerReviewStep({ data, onEditStep, onSubmit, isSubmitting, submitError, onBack }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 5: Review & Complete Setup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Verify your business parameters and procurement preferences before initializing your store account.
        </p>
      </div>

      {submitError && (
        <div className="p-3.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Save Unsuccessful</span>
              <span>{submitError}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                Your entered information is completely preserved. You can click Retry below.
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onSubmit}
            className="py-1.5 px-3 rounded bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs flex items-center space-x-1.5 self-end sm:self-auto transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSubmitting ? 'animate-spin' : ''}`} />
            <span>Retry Save</span>
          </button>
        </div>
      )}

      {/* Review Section 1: Business Profile */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Store className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Store & Business Identity
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(1)}
            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Store Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.shopName || 'Kirana Store'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Owner Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.ownerName || 'Store Owner'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Store Format</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.businessType || 'Kirana Store'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Location</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {[data.area, data.city, data.district, data.state].filter(Boolean).join(', ')}
            </span>
          </div>
        </div>
      </div>

      {/* Review Section 2: Products Sold */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Retail Product Lines ({data.productsSold?.length || 0} categories)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(2)}
            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {(data.productsSold || []).map(cat => (
            <span key={cat} className="text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
              {cat}
            </span>
          ))}
        </div>
      </div>

      {/* Review Section 3: Procurement Demand Signal */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Procurement Demand Profile ({data.productsNeeded?.length || 0} items)
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-1.5">
          {(data.productsNeeded || []).map((item, idx) => (
            <div key={idx} className="flex items-center justify-between py-1 text-xs border-b border-slate-100 dark:border-slate-700/40 last:border-0">
              <span className="font-medium text-slate-900 dark:text-slate-100">{item.name}</span>
              <span className="text-slate-500">
                {item.typical_quantity} {item.unit} • {item.purchase_frequency} • ~{formatINR(item.approx_budget || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Section 4: Affordability & Group Buying Constraints */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Capital Capacity & Preferences
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Max Procurement Budget</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
              {formatINR(data.maxProcurementBudget || 25000)}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Max Single Item Volume</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data.maxComfortableQuantity || 200} kg/units
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Cluster Radius</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {data.deliveryRadiusKm || 5.0} km
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Pooled Group Buying</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
              {data.participateGroupProcurement !== false ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={onBack}
          className="py-2 px-4 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 disabled:opacity-50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={onSubmit}
          className="py-2.5 px-8 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow-sm transition flex items-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Store Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Open Dashboard</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
