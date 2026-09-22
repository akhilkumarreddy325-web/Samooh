import React from 'react';
import { Building2, Package, DollarSign, Truck, CheckCircle2, ArrowLeft, Loader2, Edit3, AlertCircle } from 'lucide-react';

export default function SupplierReviewStep({ data, onEditStep, onSubmit, isSubmitting, submitError, onBack }) {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 6: Review & Finalize Wholesale Profile
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Review commercial wholesale terms, inventory volumes, and delivery reach before listing products.
        </p>
      </div>

      {submitError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Failed to save profile:</span>
            <span>{submitError}</span>
          </div>
        </div>
      )}

      {/* Review Section 1: Business Profile */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Supplier Enterprise Identity
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
            <span className="text-[11px] text-slate-500 block">Company Name</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.businessName || 'Wholesale Supplier'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Contact Person</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.contactPerson || 'Contact'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Classification</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.businessType || 'Wholesaler'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Location</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.area}, {data.city}</span>
          </div>
        </div>
      </div>

      {/* Review Section 2: Catalog Products, Inventory & MOQ */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Products, Inventory Stock & MOQ ({data.configuredProducts?.length || 0})
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

        <div className="space-y-2">
          {(data.configuredProducts || []).map((p, idx) => (
            <div key={idx} className="p-2.5 rounded bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                <span className="text-[11px] text-slate-500">
                  Ready Stock: {p.available_quantity} {p.unit} • Restock: {p.replenishment_cycle}
                </span>
              </div>
              <div className="flex items-center space-x-4 text-right">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Supplier MOQ</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{p.moq} {p.unit}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-medium">Base Price</span>
                  <span className="font-bold text-emerald-800 dark:text-emerald-400">₹{p.wholesale_price}/{p.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Section 3: Delivery Reach & Transit Terms */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-3 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Delivery Logistics & Fleet Reach
            </h4>
          </div>
          <button
            type="button"
            onClick={() => onEditStep(5)}
            className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div>
            <span className="text-[11px] text-slate-500 block">Service Radius</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.serviceRadiusKm || 50} km</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Standard Lead Time</span>
            <span className="font-semibold text-slate-900 dark:text-white">{data.leadTimeDays || 2} Days</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Coverage Belt</span>
            <span className="font-semibold text-slate-900 dark:text-white truncate block">{data.distributionArea || 'Metro Cluster'}</span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block">Warehouse Loading Dock</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
              {data.pickupAvailable !== false ? 'Available' : 'Restricted'}
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
              <span>Saving Supplier Profile...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Setup & Open Supplier Portal</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
