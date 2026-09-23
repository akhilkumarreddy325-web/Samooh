import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Package, AlertCircle } from 'lucide-react';

const UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons', 'units', 'quintal'];
const REPLENISHMENT = ['Weekly', 'Bi-weekly', 'Monthly', 'Daily', 'On Demand'];

function generateProductId() {
  return `prod_${Date.now()}_${Math.random().toString(36).substr(2, 7)}`;
}

export default function SupplierInventoryStep({ data, onUpdate, onNext, onBack }) {
  // Controlled product state with stable IDs and string-backed numeric fields
  const [products, setProducts] = useState(() => {
    if (Array.isArray(data.configuredProducts) && data.configuredProducts.length > 0) {
      return data.configuredProducts.map(p => ({
        id: p.id || generateProductId(),
        name: p.name || '',
        availableStock: p.availableStock != null ? String(p.availableStock) : (p.available_quantity != null ? String(p.available_quantity) : ''),
        unit: p.unit || 'kg',
        price: p.price != null ? String(p.price) : (p.wholesale_price != null ? String(p.wholesale_price) : ''),
        moq: p.moq != null ? String(p.moq) : '',
        restockFrequency: p.restockFrequency || p.replenishment_cycle || 'Weekly',
        category: p.category || data.productsSupplied?.[0] || 'General Wholesale'
      }));
    }
    // New users start completely empty
    return [];
  });

  const [error, setError] = useState('');

  // Controlled change handler for individual product fields
  // Does NOT convert to number during typing, so "" stays "" and cursor never jumps
  const handleFieldChange = (id, field, value) => {
    setError('');
    setProducts(prev => {
      const next = prev.map(p => {
        if (p.id !== id) return p;
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

  // Add Product button creates one completely empty product row
  const handleAddProduct = () => {
    setError('');
    const newRow = {
      id: generateProductId(),
      name: '',
      availableStock: '',
      unit: 'kg',
      price: '',
      moq: '',
      restockFrequency: 'Weekly',
      category: data.productsSupplied?.[0] || 'General Wholesale'
    };

    setProducts(prev => {
      const next = [...prev, newRow];
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
      const next = prev.filter(p => p.id !== id);
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

  // Validation executes only when user clicks Continue / Next
  const handleContinue = () => {
    if (products.length === 0) {
      setError('Please add at least one wholesale product to your catalog.');
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
        setError(`"${p.name}": Price must be greater than 0.`);
        return;
      }
      if (p.moq === '' || isNaN(Number(p.moq)) || Number(p.moq) <= 0) {
        setError(`"${p.name}": MOQ must be greater than 0.`);
        return;
      }
    }

    // Prepare complete data representation for downstream steps
    const finalProducts = products.map(p => ({
      ...p,
      name: p.name.trim(),
      available_quantity: Number(p.availableStock),
      wholesale_price: Number(p.price),
      moq: Number(p.moq),
      replenishment_cycle: p.restockFrequency,
      quantity_tiers: p.quantity_tiers || [
        { min_quantity: 1, max_quantity: Math.max(1, Number(p.moq) - 1), price_per_unit: Number(p.price) + 2 },
        { min_quantity: Number(p.moq), max_quantity: null, price_per_unit: Number(p.price) }
      ]
    }));

    onUpdate({ configuredProducts: finalProducts });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 3: Products & Inventory Setup
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure ready-to-dispatch products, current stock levels, baseline wholesale prices, and minimum order quantities (MOQ).
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
        {products.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
            <Package className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              No products added yet.
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click "+ Add Product" below to add your first catalog item.
            </p>
          </div>
        ) : (
          products.map((product, idx) => (
            <div
              key={product.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Product #{idx + 1}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveProduct(product.id)}
                  className="text-xs text-rose-600 hover:text-rose-700 dark:text-rose-400 flex items-center space-x-1"
                  title="Remove this product"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>

              {/* Row 1: Product Name, Available Stock, Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Product Name <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sona Masoori Rice (25kg)"
                    value={product.name}
                    onChange={(e) => handleFieldChange(product.id, 'name', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Available Stock <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 2500"
                    value={product.availableStock}
                    onChange={(e) => handleFieldChange(product.id, 'availableStock', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Unit
                  </label>
                  <select
                    value={product.unit}
                    onChange={(e) => handleFieldChange(product.id, 'unit', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>

              {/* Row 2: Wholesale Price, MOQ, Restock Frequency */}
              <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Wholesale Price (₹) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    placeholder="e.g. 48"
                    value={product.price}
                    onChange={(e) => handleFieldChange(product.id, 'price', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    MOQ ({product.unit}) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 200"
                    value={product.moq}
                    onChange={(e) => handleFieldChange(product.id, 'moq', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Restock Frequency
                  </label>
                  <select
                    value={product.restockFrequency}
                    onChange={(e) => handleFieldChange(product.id, 'restockFrequency', e.target.value)}
                    className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
                  >
                    {REPLENISHMENT.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Clear + Add Product button */}
        <button
          type="button"
          onClick={handleAddProduct}
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
          <span>Continue to Pricing Tiers</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
