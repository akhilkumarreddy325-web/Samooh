import React, { useState } from 'react';
import { Plus, Trash2, ArrowRight, ArrowLeft, Info } from 'lucide-react';

const UNITS = ['kg', 'litres', 'bags (25kg)', 'bags (50kg)', 'cartons', 'units'];
const FREQUENCIES = [
  'Weekly',
  'Several times a week',
  'Every 2 weeks',
  'Monthly',
  'Daily',
  'As needed'
];

export default function RetailerProductsNeededStep({ data, onUpdate, onNext, onBack }) {
  const [items, setItems] = useState(data.productsNeeded || [
    { name: 'Sona Masoori Rice', category: 'Rice', typical_quantity: 100, unit: 'kg', purchase_frequency: 'Weekly', approx_budget: 4800 },
    { name: 'Sunflower Cooking Oil', category: 'Cooking Oil', typical_quantity: 50, unit: 'litres', purchase_frequency: 'Every 2 weeks', approx_budget: 5500 },
    { name: 'Refined Sugar (M-30)', category: 'Sugar', typical_quantity: 40, unit: 'kg', purchase_frequency: 'Weekly', approx_budget: 1600 }
  ]);

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemFreq, setNewItemFreq] = useState('Weekly');
  const [newItemBudget, setNewItemBudget] = useState('');
  const [error, setError] = useState('');

  const handleAddItem = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) {
      setError('Product name is required');
      return;
    }
    const qty = parseFloat(newItemQty) || 10;
    const budget = parseFloat(newItemBudget) || (qty * 50);

    setItems([...items, {
      name: newItemName.trim(),
      category: 'General Staples',
      typical_quantity: qty,
      unit: newItemUnit,
      purchase_frequency: newItemFreq,
      approx_budget: budget
    }]);

    setNewItemName('');
    setNewItemQty('');
    setNewItemBudget('');
    setError('');
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleContinue = () => {
    if (items.length === 0) {
      setError('Please add at least one inventory item you regularly procure.');
      return;
    }
    onUpdate({ productsNeeded: items });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 3: Products Needed & Demand Signal
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Specify the inventory you regularly procure from suppliers to unlock volume pooling and price discounts.
        </p>
      </div>

      {/* Honest Demand Signal Alert */}
      <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start space-x-2">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <span className="leading-relaxed">
          <strong>Demand Intelligence Note:</strong> These procurement quantities serve as your initial demand signal. As your store places orders on Samooh, actual replenishment history will continually refine cluster pooling accuracy.
        </span>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Products Needed Table */}
      <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-semibold">
              <tr>
                <th className="py-2.5 px-3">Product Name</th>
                <th className="py-2.5 px-3 w-28">Typical Qty</th>
                <th className="py-2.5 px-3 w-28">Unit</th>
                <th className="py-2.5 px-3 w-32">Frequency</th>
                <th className="py-2.5 px-3 w-28">Est. Budget (₹)</th>
                <th className="py-2.5 px-3 w-12 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-750">
                  <td className="py-2 px-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="w-full border-0 bg-transparent text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-0 p-0"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="1"
                      value={item.typical_quantity}
                      onChange={(e) => handleItemChange(idx, 'typical_quantity', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(idx, 'unit', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <select
                      value={item.purchase_frequency}
                      onChange={(e) => handleItemChange(idx, 'purchase_frequency', e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    >
                      {FREQUENCIES.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="number"
                      min="0"
                      value={item.approx_budget || ''}
                      onChange={(e) => handleItemChange(idx, 'approx_budget', parseFloat(e.target.value) || 0)}
                      className="w-full border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                    />
                  </td>
                  <td className="py-2 px-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
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

      {/* Add New Product Row */}
      <div className="p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block mb-2">
          Add Another Procurement Commodity:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
          <input
            type="text"
            placeholder="Commodity (e.g. Toor Dal)"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="sm:col-span-2 border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
          <input
            type="number"
            min="1"
            placeholder="Qty"
            value={newItemQty}
            onChange={(e) => setNewItemQty(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded px-2.5 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          />
          <select
            value={newItemUnit}
            onChange={(e) => setNewItemUnit(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
          >
            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <button
            type="button"
            onClick={handleAddItem}
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
          <span>Continue to Procurement Preferences</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
