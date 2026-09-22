import React from 'react';
import { Store, Building2, Check, ArrowRight } from 'lucide-react';

export default function RoleSelectionStep({ selectedRole, onSelectRole, onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          How will you use Samooh?
        </h2>
        <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Select your primary business role. This configures your procurement tools and marketplace capabilities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto pt-2">
        {/* Retailer Card */}
        <div
          onClick={() => onSelectRole('retailer')}
          className={`cursor-pointer rounded-lg p-5 border transition-all relative ${
            selectedRole === 'retailer'
              ? 'border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-700 shadow-sm'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
              selectedRole === 'retailer'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              <Store className="w-5 h-5" />
            </div>
            {selectedRole === 'retailer' && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Retailer / Kirana Store
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              For retail businesses purchasing inventory from wholesale suppliers.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Find suppliers, combine purchasing demand with nearby stores, and procure inventory at guaranteed wholesale tier prices.
            </div>
          </div>
        </div>

        {/* Supplier Card */}
        <div
          onClick={() => onSelectRole('supplier')}
          className={`cursor-pointer rounded-lg p-5 border transition-all relative ${
            selectedRole === 'supplier'
              ? 'border-emerald-700 bg-emerald-50/40 dark:bg-emerald-950/20 ring-1 ring-emerald-700 shadow-sm'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 shadow-sm'
          }`}
        >
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-md flex items-center justify-center ${
              selectedRole === 'supplier'
                ? 'bg-emerald-800 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
            }`}>
              <Building2 className="w-5 h-5" />
            </div>
            {selectedRole === 'supplier' && (
              <span className="w-5 h-5 rounded-full bg-emerald-800 text-white flex items-center justify-center">
                <Check className="w-3 h-3 stroke-[3]" />
              </span>
            )}
          </div>

          <div className="mt-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Supplier / Wholesaler
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              For businesses supplying wholesale commodities and inventory to retailers.
            </p>
            <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
              List products, configure commercial wholesale terms and MOQ, manage batch inventory, and fulfill consolidated retailer group orders.
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pt-2">
        <button
          type="button"
          disabled={!selectedRole}
          onClick={onNext}
          className="py-2.5 px-8 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span>Continue as {selectedRole === 'supplier' ? 'Wholesale Supplier' : selectedRole === 'retailer' ? 'Kirana Retailer' : 'Partner'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
