import React, { useState } from 'react';
import { Trash2, ArrowRight, ArrowLeft, Package, AlertCircle } from 'lucide-react';
import { getProductById, getProductDisplayName, resolveCanonicalProductId } from '../../../data/productCatalog';
import { useApp } from '../../../context/AppContext';

const DEFAULT_UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons', 'units', 'quintal'];
const REPLENISHMENT = ['Weekly', 'Bi-weekly', 'Monthly', 'Daily', 'On Demand'];

export default function SupplierInventoryStep({ data, onUpdate, onNext, onBack }) {
  const { currentLanguage } = useApp();

  // Controlled product state with stable canonical IDs and string-backed numeric fields
  const [products, setProducts] = useState(() => {
    if (Array.isArray(data.configuredProducts) && data.configuredProducts.length > 0) {
      return data.configuredProducts.map(p => {
        const canonicalId = p.productId || p.canonical_product_id || resolveCanonicalProductId(p.name) || p.id;
        const catalogProd = getProductById(canonicalId);

        return {
          id: canonicalId,
          productId: canonicalId,
          canonical_product_id: canonicalId,
          name: catalogProd?.name || p.name || 'Wholesale Commodity',
          category: catalogProd?.groupName || p.category || 'General Wholesale',
          availableStock: p.availableStock != null ? String(p.availableStock) : (p.available_quantity != null ? String(p.available_quantity) : ''),
          unit: p.unit || catalogProd?.defaultUnit || 'kg',
          allowedUnits: catalogProd?.allowedUnits || DEFAULT_UNITS,
          price: p.price != null ? String(p.price) : (p.wholesale_price != null ? String(p.wholesale_price) : ''),
          moq: p.moq != null ? String(p.moq) : '',
          restockFrequency: p.restockFrequency || p.replenishment_cycle || 'Weekly',
          quantity_tiers: p.quantity_tiers || []
        };
      });
    }
    return [];
  });

  const [error, setError] = useState('');

  // Controlled change handler for individual product fields
  // Does NOT convert to number during typing, so "" stays "" and cursor never jumps
  const handleFieldChange = (id, field, value) => {
    setError('');
    setProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== id && p.productId !== id) return p;
        return { ...p, [field]: value };
      });

      // Synchronize with parent state & UID-scoped localStorage draft
      onUpdate({
        configuredProducts: next.map(p => ({
          ...p,
          available_quantity: p.availableStock === '' ? null : Number(p.availableStock),
          wholesale_price: p.price === '' ? null : Number(p.price),
          moq: p.moq === '' ? null : Number(p.moq),
          replenishment_cycle: p.restockFrequency
        }))
      });

      return next;
    });
  };

  // Remove Product button removes by stable ID
  const handleRemoveProduct = (id) => {
    setError('');
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id && p.productId !== id);
      const remainingIds = next.map(p => p.productId || p.id);

      onUpdate({
        selectedProductIds: remainingIds,
        productsSupplied: next.map(p => p.name),
        configuredProducts: next.map(p => ({
          ...p,
          available_quantity: p.availableStock === '' ? null : Number(p.availableStock),
          wholesale_price: p.price === '' ? null : Number(p.price),
          moq: p.moq === '' ? null : Number(p.moq),
          replenishment_cycle: p.restockFrequency
        }))
      });
      return next;
    });
  };

  // Validation executes only when user clicks Continue / Next
  const handleContinue = () => {
    if (products.length === 0) {
      setError('Please select at least one standardized product to configure inventory and pricing.');
      return;
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const rowNum = i + 1;
      if (!p.name?.trim()) {
        setError(`Product #${rowNum}: Product name is required.`);
        return;
      }
      if (p.availableStock === '' || isNaN(Number(p.availableStock)) || Number(p.availableStock) < 0) {
        setError(`"${p.name}": Available stock must be greater than or equal to 0.`);
        return;
      }
      if (p.price === '' || isNaN(Number(p.price)) || Number(p.price) <= 0) {
        setError(`"${p.name}": Wholesale base price must be greater than 0.`);
        return;
      }
      if (p.moq === '' || isNaN(Number(p.moq)) || Number(p.moq) <= 0) {
        setError(`"${p.name}": Supplier wholesale MOQ must be greater than 0.`);
        return;
      }
    }

    // Prepare complete data representation for downstream steps
    const finalProducts = products.map(p => ({
      ...p,
      productId: p.productId || p.id,
      canonical_product_id: p.productId || p.id,
      name: p.name.trim(),
      available_quantity: Number(p.availableStock),
      wholesale_price: Number(p.price),
      moq: Number(p.moq),
      replenishment_cycle: p.restockFrequency,
      quantity_tiers: p.quantity_tiers?.length > 0 ? p.quantity_tiers : [
        {
          min_quantity: Number(p.moq),
          max_quantity: Number(p.moq) * 2.5,
          unit_price: Number(p.price),
          discount_percentage: 0.0
        },
        {
          min_quantity: Number(p.moq) * 2.5 + 1,
          max_quantity: Number(p.moq) * 5,
          unit_price: Math.round(Number(p.price) * 0.95 * 100) / 100,
          discount_percentage: 5.0
        }
      ]
    }));

    onUpdate({ configuredProducts: finalProducts });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 3: Inventory Stock, Wholesale Price & MOQ
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure available wholesale inventory, base unit rate, and minimum order quantity (MOQ) for your selected commodities.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {products.length === 0 ? (
        <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg text-slate-500 text-xs space-y-3">
          <Package className="w-8 h-8 mx-auto text-slate-400" />
          <p className="font-semibold text-slate-700 dark:text-slate-300">No standardized products selected yet.</p>
          <p className="text-slate-400 text-[11px]">
            Please return to Step 2 to select the products your enterprise supplies.
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
          {products.map((p, idx) => {
            const catalogProd = getProductById(p.productId || p.id);
            const localizedName = catalogProd ? getProductDisplayName(catalogProd, currentLanguage) : p.name;
            const unitsList = p.allowedUnits || DEFAULT_UNITS;

            return (
              <div 
                key={p.id || p.productId || idx}
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
                      {localizedName !== p.name && (
                        <span className="text-[10px] text-slate-400 ml-1.5">
                          ({p.name})
                        </span>
                      )}
                      <span className="ml-2 text-[10px] uppercase font-semibold text-slate-400 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        {p.category || 'Wholesale Commodity'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveProduct(p.id || p.productId)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove product"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Variable Values Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  {/* Available Stock */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Available Stock <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="0"
                      placeholder="e.g. 500"
                      value={p.availableStock}
                      onChange={(e) => handleFieldChange(p.id, 'availableStock', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  {/* Unit */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Unit
                    </label>
                    <select
                      value={p.unit}
                      onChange={(e) => handleFieldChange(p.id, 'unit', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    >
                      {unitsList.map(u => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>

                  {/* Base Wholesale Price */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Wholesale Price (₹) <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="e.g. 72"
                      value={p.price}
                      onChange={(e) => handleFieldChange(p.id, 'price', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  {/* MOQ */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Supplier MOQ <span className="text-rose-600">*</span>
                    </label>
                    <input
                      type="number"
                      step="any"
                      min="1"
                      placeholder="e.g. 100"
                      value={p.moq}
                      onChange={(e) => handleFieldChange(p.id, 'moq', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    />
                  </div>

                  {/* Restock Frequency */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Restock Cycle
                    </label>
                    <select
                      value={p.restockFrequency}
                      onChange={(e) => handleFieldChange(p.id, 'restockFrequency', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                    >
                      {REPLENISHMENT.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
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
          disabled={products.length === 0}
          className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 disabled:opacity-50 text-white text-xs font-semibold rounded-md transition shadow-sm flex items-center space-x-1.5"
        >
          <span>Continue to Pricing Tiers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
