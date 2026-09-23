import React, { useState, useEffect } from 'react';
import { Trash2, ArrowRight, ArrowLeft, Package, AlertCircle, Plus } from 'lucide-react';
import { getProductById, getProductDisplayName, resolveCanonicalProductId } from '../../../data/productCatalog';
import { useApp } from '../../../context/AppContext';

const DEFAULT_UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons', 'units', 'quintal'];
const FREQUENCIES = [
  'Weekly',
  'Several times a week',
  'Every 2 weeks',
  'Monthly',
  'Daily',
  'As needed'
];

export default function RetailerProductsNeededStep({ data, onUpdate, onNext, onBack }) {
  const { currentLanguage } = useApp();

  // Controlled product state with stable canonical IDs and string-backed numeric fields
  const [items, setItems] = useState(() => {
    if (Array.isArray(data.productsNeeded) && data.productsNeeded.length > 0) {
      return data.productsNeeded.map(item => {
        const canonicalId = item.productId || item.canonical_product_id || resolveCanonicalProductId(item.name || item.product_name) || item.id;
        const catalogProd = getProductById(canonicalId);

        return {
          id: canonicalId,
          productId: canonicalId,
          canonical_product_id: canonicalId,
          name: catalogProd?.name || item.name || item.product_name || 'Standard Commodity',
          category: catalogProd?.groupName || item.category || 'General Staples',
          typicalQuantity: item.typicalQuantity != null ? String(item.typicalQuantity) : (item.typical_quantity != null ? String(item.typical_quantity) : ''),
          unit: item.unit || catalogProd?.defaultUnit || 'kg',
          allowedUnits: catalogProd?.allowedUnits || DEFAULT_UNITS,
          purchaseFrequency: item.purchaseFrequency || item.purchase_frequency || 'Weekly',
          approxBudget: item.approxBudget != null ? String(item.approxBudget) : (item.approx_budget != null ? String(item.approx_budget) : '')
        };
      });
    }
    return [];
  });

  const [error, setError] = useState('');

  // Controlled change handler for individual product fields
  // Never converts empty strings to 0 during typing
  const handleFieldChange = (id, field, value) => {
    setError('');
    setItems(prev => {
      const next = prev.map(item => {
        if (item.id !== id && item.productId !== id) return item;
        return { ...item, [field]: value };
      });

      // Synchronize with parent state & UID-scoped localStorage draft
      onUpdate({
        productsNeeded: next.map(item => ({
          ...item,
          typical_quantity: item.typicalQuantity === '' ? null : Number(item.typicalQuantity),
          purchase_frequency: item.purchaseFrequency,
          approx_budget: item.approxBudget === '' ? null : Number(item.approxBudget)
        }))
      });

      return next;
    });
  };

  // Remove Product button removes by stable ID
  const handleRemoveItem = (id) => {
    setError('');
    setItems(prev => {
      const next = prev.filter(item => item.id !== id && item.productId !== id);
      const remainingIds = next.map(item => item.productId || item.id);
      
      onUpdate({
        selectedProductIds: remainingIds,
        productsSold: next.map(i => i.name),
        productsNeeded: next.map(item => ({
          ...item,
          typical_quantity: item.typicalQuantity === '' ? null : Number(item.typicalQuantity),
          purchase_frequency: item.purchaseFrequency,
          approx_budget: item.approxBudget === '' ? null : Number(item.approxBudget)
        }))
      });
      return next;
    });
  };

  // Validation executes only when user clicks Continue
  const handleContinue = () => {
    if (items.length === 0) {
      setError('Please select at least one standardized product to configure requirements.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const rowNum = i + 1;
      if (!item.name?.trim()) {
        setError(`Product #${rowNum}: Product name is required.`);
        return;
      }
      if (item.typicalQuantity === '' || isNaN(Number(item.typicalQuantity)) || Number(item.typicalQuantity) <= 0) {
        setError(`"${item.name}": Typical requirement quantity must be greater than 0.`);
        return;
      }
      if (item.approxBudget !== '' && (isNaN(Number(item.approxBudget)) || Number(item.approxBudget) < 0)) {
        setError(`"${item.name}": Estimated budget cannot be negative.`);
        return;
      }
    }

    // Prepare complete data representation for downstream steps
    const finalItems = items.map(item => ({
      ...item,
      productId: item.productId || item.id,
      canonical_product_id: item.productId || item.id,
      name: item.name.trim(),
      product_name: item.name.trim(),
      typical_quantity: Number(item.typicalQuantity),
      purchase_frequency: item.purchaseFrequency,
      approx_budget: item.approxBudget ? Number(item.approxBudget) : Number(item.typicalQuantity) * 50
    }));

    onUpdate({ productsNeeded: finalItems });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 3: Product Demand & Procurement Details
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter your store's regular demand quantities and restock cycles for your selected standardized commodities.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-xs space-y-3">
          <Package className="w-8 h-8 mx-auto text-slate-400" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No standardized products selected yet.</p>
          <p className="text-slate-400 text-[11px]">
            Please return to Step 2 to pick products from the standardized catalog.
          </p>
          <button
            type="button"
            onClick={onBack}
            className="px-3 py-1.5 bg-emerald-800 text-white rounded-md text-xs font-semibold"
          >
            ← Select Products in Step 2
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, idx) => {
            const catalogProd = getProductById(item.productId || item.id);
            const localizedName = catalogProd ? getProductDisplayName(catalogProd, currentLanguage) : item.name;
            const unitsList = item.allowedUnits || DEFAULT_UNITS;

            return (
              <div 
                key={item.id || item.productId || idx}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-3 sm:p-4 bg-white dark:bg-slate-800/90 shadow-xs space-y-3"
              >
                {/* Product Name Header (Standardized & Non-editable) */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-[10px] flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                      {idx + 1}
                    </span>
                    <div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {localizedName}
                      </span>
                      {localizedName !== item.name && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ({item.name})
                        </span>
                      )}
                      <span className="ml-2 text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {item.category || 'Commodity'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id || item.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove from demand list"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Variable Information Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  {/* Quantity */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Typical Order Qty <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="e.g. 50"
                      value={item.typicalQuantity}
                      onChange={(e) => handleFieldChange(item.id, 'typicalQuantity', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unit
                    </label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    >
                      {unitsList.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Restock Frequency */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Restock Frequency
                    </label>
                    <select
                      value={item.purchaseFrequency}
                      onChange={(e) => handleFieldChange(item.id, 'purchaseFrequency', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    >
                      {FREQUENCIES.map(f => (
                        <option key={f} value={f}>{f}</option>
                      ))}
                    </select>
                  </div>

                  {/* Estimated Budget / Target Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Est. Budget (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 3500"
                      value={item.approxBudget}
                      onChange={(e) => handleFieldChange(item.id, 'approxBudget', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="px-3.5 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Product Selection</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          disabled={items.length === 0}
          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition shadow-sm flex items-center space-x-1.5"
        >
          <span>Continue to Preferences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
