import React from 'react';
import { X, MapPin, CheckCircle2, ShieldCheck, Info } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PooledInventorySection from './PooledInventorySection';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';

export default function PoolDetailModal({ pool, onClose, onAccept }) {
  const { t } = useApp();
  if (!pool) return null;

  const unitRetail = pool.unit_retail_price || 1450.0;
  const unitWholesale = pool.unit_wholesale_price || 1180.0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg w-full max-w-2xl overflow-hidden shadow-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-700 flex items-start justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                {pool.category || "Procurement Pool"}
              </span>
              <StatusBadge status={pool.threshold_status} />
            </div>
            <h2 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">
              {pool.product_name}
            </h2>
            <p className="text-xs mt-0.5 flex items-center text-slate-500 dark:text-slate-400">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {t('avgRadius')}: <strong className="ml-1 text-slate-700 dark:text-slate-200">{pool.average_cluster_distance_km} km</strong>
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Explanation Banner */}
          <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 flex items-start space-x-2.5">
            <Info className="w-4 h-4 text-emerald-800 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Procurement Evaluation
              </h4>
              <p className="text-xs mt-0.5 leading-relaxed text-slate-600 dark:text-slate-400">
                {pool.explanation}
              </p>
            </div>
          </div>

          {/* Pricing & Progress Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-500 block">{t('unitRetailPrice')}</span>
              <div className="text-base font-bold text-slate-700 dark:text-slate-300 mt-0.5">₹{unitRetail.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] text-slate-500 block">{t('unitWholesalePrice')}</span>
              <div className="text-base font-bold text-emerald-800 dark:text-emerald-400 mt-0.5">₹{unitWholesale.toLocaleString()}</div>
            </div>
            <div className="p-3 rounded-md border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 dark:border-emerald-900/50">
              <span className="text-[11px] text-emerald-800 dark:text-emerald-400 font-medium block">{t('totalGroupSavings')}</span>
              <div className="text-base font-bold text-emerald-900 dark:text-emerald-300 mt-0.5">₹{pool.estimated_total_savings.toLocaleString()}</div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">({pool.estimated_savings_percentage}% margin)</span>
            </div>
          </div>

          {/* Pooled Inventory & Transport Recommendation Section */}
          <PooledInventorySection pool={pool} interactive={true} />

          {/* Supplier Selection & Multi-Supplier Feasibility */}
          {pool.supplier_evaluation && (
            <div className="p-4 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-slate-800 dark:text-slate-200 font-semibold text-xs tracking-tight">
                  <ShieldCheck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
                  <span>Wholesale Supplier Evaluation</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
                  {pool.supplier_evaluation.is_feasible ? 'Supplier Matched' : 'Constraint Notice'}
                </span>
              </div>

              {/* Selected Supplier Highlight */}
              <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Allocated Wholesale Partner</div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {pool.supplier_evaluation.selected_supplier_name}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-medium uppercase">Rate</div>
                  <div className="text-sm font-bold text-emerald-800 dark:text-emerald-400">
                    {formatINR(pool.supplier_evaluation.unit_price)}/{pool.product_obj?.unit_of_measure || 'unit'}
                  </div>
                </div>
              </div>

              {/* Explicit Selection Rationale List */}
              <div className="space-y-1">
                <span className="text-[11px] font-medium text-slate-500 block">
                  Evaluation Criteria:
                </span>
                <div className="space-y-1 text-xs">
                  {pool.supplier_evaluation.selection_reasons.map((reason, idx) => (
                    <div key={idx} className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-800" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Evaluated Alternative Suppliers Table */}
              {pool.supplier_evaluation.evaluated_suppliers && pool.supplier_evaluation.evaluated_suppliers.length > 1 && (
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                  <span className="text-[11px] font-medium text-slate-500 block">
                    Evaluated Wholesale Suppliers:
                  </span>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-500 uppercase">
                        <tr>
                          <th className="p-1.5">Supplier</th>
                          <th className="p-1.5 text-center">MOQ</th>
                          <th className="p-1.5 text-center">Stock</th>
                          <th className="p-1.5 text-center">Radius</th>
                          <th className="p-1.5 text-right">Price</th>
                          <th className="p-1.5 text-center">Status</th>
                          <th className="p-1.5">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                        {pool.supplier_evaluation.evaluated_suppliers.map((cand, idx) => (
                          <tr key={idx} className="py-1">
                            <td className="p-1.5 font-medium text-slate-800 dark:text-slate-200">{cand.supplier_name}</td>
                            <td className="p-1.5 text-center">{cand.moq}</td>
                            <td className="p-1.5 text-center">{cand.available_stock}</td>
                            <td className="p-1.5 text-center">{cand.service_radius_km} km</td>
                            <td className="p-1.5 text-right font-semibold text-slate-900 dark:text-white">{formatINR(cand.unit_price)}</td>
                            <td className="p-1.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                cand.is_feasible ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-700'
                              }`}>
                                {cand.is_feasible ? 'Feasible' : 'Rejected'}
                              </span>
                            </td>
                            <td className="p-1.5 text-slate-500">
                              {cand.is_feasible 
                                ? 'Meets constraints' 
                                : cand.rejection_reasons?.join(', ')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-3.5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end space-x-2 bg-slate-50/50 dark:bg-slate-900/50">
          <button 
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onAccept(pool);
              onClose();
            }}
            className="px-4 py-1.5 rounded-md text-xs font-medium bg-emerald-800 hover:bg-emerald-900 text-white flex items-center space-x-1.5 transition shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{t('acceptPoolBtn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
