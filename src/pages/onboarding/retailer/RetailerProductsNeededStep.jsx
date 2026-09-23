import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Package, AlertCircle } from 'lucide-react';

const UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons', 'units', 'quintal'];
const FREQUENCIES = [
  'Weekly',
  'Several times a week',
  'Every 2 weeks',
  'Monthly',
  'Daily',
  'As needed'
];

function generateProductId() {
  return `ret_prod_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
}

export default function RetailerProductsNeededStep({ data, onUpdate, onNext, onBack }) {
  // Controlled product state with stable IDs and string-backed numeric fields
  const [items, setItems] = useState(() => {
    if (Array.isArray(data.productsNeeded) && data.productsNeeded.length > 0) {
      return data.productsNeeded.map(item => ({
        id: item.id || generateProductId(),
        name: item.name || item.product_name || '',
        typicalQuantity: item.typicalQuantity != null ? String(item.typicalQuantity) : (item.typical_quantity != null ? String(item.typical_quantity) : ''),
        unit: item.unit || 'kg',
        purchaseFrequency: item.purchaseFrequency || item.purchase_frequency || 'Weekly',
        approxBudget: item.approxBudget != null ? String(item.approxBudget) : (item.approx_budget != null ? String(item.approx_budget) : '')
      }));
    }
    // New users start completely empty
    return [];
  });

  const [error, setError] = useState('');

  // Controlled change handler for individual product fields
  const handleFieldChange = (id, field, value) => {
    setError('');
    setItems(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;
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

  // Add Product button creates one completely empty product row
  const handleAddItem = () => {
    setError('');
    const newRow = {
      id: generateProductId(),
      name: '',
      typicalQuantity: '',
      unit: 'kg',
      purchaseFrequency: 'Weekly',
      approxBudget: ''
    };

    setItems(prev => {
      const next = [...prev, newRow];
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
      const next = prev.filter(item => item.id !== id);
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

  // Validation executes only when user clicks Continue / Next
  const handleContinue = () => {
    if (items.length === 0) {
      setError('Please add at least one product you regularly procure.');
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
        setError(`"${item.name}": Typical quantity must be greater than 0.`);
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
          Step 3: Products Needed & Demand Signal
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Specify regular inventory items your store procures to unlock wholesale group pooling discounts.
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Product List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No products added yet.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click "+ Add Product" below to add commodities you regularly procure.
            </p>
          </div>
        ) : (
          items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Procurement Item #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1"
                  title="Remove this item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: Product Name, Typical Quantity, Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product / Commodity Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sona Masoori Rice (25kg)"
                    value={item.name}
                    onChange={(e) => handleFieldChange(item.id, 'name', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Typical Needed Quantity <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 25"
                    value={item.typicalQuantity}
                    onChange={(e) => handleFieldChange(item.id, 'typicalQuantity', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={item.unit}
                    onChange={(e) => handleFieldChange(item.id, 'unit', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Purchase Frequency & Est. Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Purchase Frequency
                  </label>
                  <select
                    value={item.purchaseFrequency}
                    onChange={(e) => handleFieldChange(item.id, 'purchaseFrequency', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Est. Budget per Order (₹ Optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5000"
                    value={item.approxBudget}
                    onChange={(e) => handleFieldChange(item.id, 'approxBudget', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>
              </div>
            </div>
          ))
        )}

        {/* Clear + Add Product button */}
        <button
          type="button"
          onClick={handleAddItem}
          className="w-full py-2.5 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-700 dark:hover:border-emerald-500 text-slate-700 dark:text-slate-300 hover:text-emerald-800 dark:hover:text-emerald-400 text-xs font-semibold transition flex items-center justify-center space-x-1.5 bg-slate-50/50 dark:bg-slate-850"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Product</span>
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={onBack}
          className="py-2 px-4 rounded-md border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>

        <button
          type="button"
          onClick={handleContinue}
          className="py-2 px-6 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center space-x-1.5"
        >
          <span>Continue to Procurement Preferences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
