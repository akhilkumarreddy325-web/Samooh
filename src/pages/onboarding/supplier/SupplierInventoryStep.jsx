import React, { useState } from 'react';
import { Package, Plus, Trash2, ArrowRight, ArrowLeft } from 'lucide-react';

const UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons'];
const REPLENISHMENT = ['Weekly', 'Bi-weekly', 'Monthly', 'Daily', 'On Demand'];

export default function SupplierInventoryStep({ data, onUpdate, onNext, onBack }) {
  // Pre-seed configured products based on Step 2 categories if not already populated
  const [products, setProducts] = useState(() => {
    if (data.configuredProducts && data.configuredProducts.length > 0) {
      return data.configuredProducts;
    }
    return [
      {
        id: 'prod_seed_1',
        name: 'Sona Masoori Raw Rice (25kg Bag)',
        category: 'Rice (Raw & Boiled)',
        unit: 'kg',
        available_quantity: 2500,
        max_supply_quantity: 10000,
        replenishment_cycle: 'Weekly',
        wholesale_price: 48,
        moq: 200,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 99, price_per_unit: 52 },
          { min_quantity: 100, max_quantity: 199, price_per_unit: 50 },
          { min_quantity: 200, max_quantity: 499, price_per_unit: 48 },
          { min_quantity: 500, max_quantity: null, price_per_unit: 45 }
        ]
      },
      {
        id: 'prod_seed_2',
        name: 'Freedom Refined Sunflower Oil (15L Tin)',
        category: 'Edible & Cooking Oils',
        unit: 'litres',
        available_quantity: 1200,
        max_supply_quantity: 5000,
        replenishment_cycle: 'Weekly',
        wholesale_price: 110,
        moq: 100,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 49, price_per_unit: 118 },
          { min_quantity: 50, max_quantity: 99, price_per_unit: 114 },
          { min_quantity: 100, max_quantity: null, price_per_unit: 110 }
        ]
      },
      {
        id: 'prod_seed_3',
        name: 'Premium M-30 Pure Sugar (50kg Bag)',
        category: 'Sugar & Sweeteners',
        unit: 'kg',
        available_quantity: 3000,
        max_supply_quantity: 15000,
        replenishment_cycle: 'Bi-weekly',
        wholesale_price: 38,
        moq: 150,
        quantity_tiers: [
          { min_quantity: 1, max_quantity: 149, price_per_unit: 42 },
          { min_quantity: 150, max_quantity: 499, price_per_unit: 38 },
          { min_quantity: 500, max_quantity: null, price_per_unit: 36 }
        ]
      }
    ];
  });

  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState(data.productsSupplied?.[0] || 'Grains & Staples');
  const [newProdUnit, setNewProdUnit] = useState('kg');
  const [newProdStock, setNewProdStock] = useState('1000');
  const [error, setError] = useState('');

  const handleProductChange = (idx, field, value) => {
    const updated = [...products];
    updated[idx][field] = value;
    setProducts(updated);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProdName.trim()) {
      setError('Product title is required');
      return;
    }
    const stock = parseFloat(newProdStock) || 500;
    const newP = {
      id: `prod_seed_${Date.now()}`,
      name: newProdName.trim(),
      category: newProdCategory,
      unit: newProdUnit,
      available_quantity: stock,
      max_supply_quantity: stock * 4,
      replenishment_cycle: 'Weekly',
      wholesale_price: 50,
      moq: 100,
      quantity_tiers: [
        { min_quantity: 1, max_quantity: 99, price_per_unit: 55 },
        { min_quantity: 100, max_quantity: null, price_per_unit: 50 }
      ]
    };
    setProducts([...products, newP]);
    setNewProdName('');
    setNewProdStock('1000');
    setError('');
  };

  const handleRemoveProduct = (idx) => {
    setProducts(products.filter((_, i) => i !== idx));
  };

  const handleContinue = () => {
    if (products.length === 0) {
      setError('Please configure at least one wholesale product with available stock.');
      return;
    }
    onUpdate({ configuredProducts: products });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 3: Inventory Stock & Supply Capacity
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Enter current ready-to-dispatch warehouse stock levels and replenishment cycles.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Inventory Table */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 w-32">Unit</th>
                <th className="py-2.5 px-3 w-32">Available Stock</th>
                <th className="py-2.5 px-3 w-32">Max Capacity</th>
                <th className="py-2.5 px-3 w-32">Restock Cycle</th>
                <th className="py-2.5 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {products.map((p, idx) => (
                <tr key={p.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handleProductChange(idx, 'name', e.target.value)}
                      className="w-full border-0 bg-transparent text-xs font-semibold text-slate-900 dark:text-slate-100 focus:ring-0 p-0"
                    />
                    <span className="text-[10px] text-slate-400 block">{p.category}</span>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={p.unit}
                      onChange={(e) => handleProductChange(idx, 'unit', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      value={p.available_quantity}
                      onChange={(e) => handleProductChange(idx, 'available_quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      value={p.max_supply_quantity}
                      onChange={(e) => handleProductChange(idx, 'max_supply_quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={p.replenishment_cycle}
                      onChange={(e) => handleProductChange(idx, 'replenishment_cycle', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {REPLENISHMENT.map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(idx)}
                      className="text-slate-400 hover:text-rose-600 transition"
                      title="Remove product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Quick Row */}
      <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
          Add Another Catalog Item & Stock Level:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Product Title"
            value={newProdName}
            onChange={(e) => setNewProdName(e.target.value)}
            className="sm:col-span-2 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            min="10"
            placeholder="Initial Stock"
            value={newProdStock}
            onChange={(e) => setNewProdStock(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
          <select
            value={newProdUnit}
            onChange={(e) => setNewProdUnit(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button
            type="button"
            onClick={handleAddProduct}
            className="py-1.5 px-3 rounded bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition flex items-center justify-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
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
          <span>Continue to Pricing & MOQ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
