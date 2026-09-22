import React, { useState } from 'react';
import { Check, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';

const COMMON_CATEGORIES = [
  'Rice',
  'Wheat & Flour',
  'Pulses & Dal',
  'Sugar',
  'Salt',
  'Cooking Oil',
  'Spices & Masala',
  'Tea & Coffee',
  'Biscuits & Snacks',
  'Beverages',
  'Dairy Products',
  'Personal Care',
  'Household Products',
  'Cleaning Products',
  'Packaged Foods'
];

export default function RetailerProductsSoldStep({ data, onUpdate, onNext, onBack }) {
  const [selectedProducts, setSelectedProducts] = useState(data.productsSold || ['Rice', 'Cooking Oil', 'Pulses & Dal', 'Sugar']);
  const [customItem, setCustomItem] = useState('');
  const [error, setError] = useState('');

  const toggleCategory = (cat) => {
    setError('');
    if (selectedProducts.includes(cat)) {
      setSelectedProducts(selectedProducts.filter(c => c !== cat));
    } else {
      setSelectedProducts([...selectedProducts, cat]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customItem.trim()) return;
    const trimmed = customItem.trim();
    if (!selectedProducts.includes(trimmed)) {
      setSelectedProducts([...selectedProducts, trimmed]);
    }
    setCustomItem('');
  };

  const handleRemove = (item) => {
    setSelectedProducts(selectedProducts.filter(i => i !== item));
  };

  const handleContinue = () => {
    if (selectedProducts.length === 0) {
      setError('Please select at least one product category currently sold in your store.');
      return;
    }
    onUpdate({ productsSold: selectedProducts });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 2: Products Currently Sold
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select the commodities and categories your store regularly carries in its retail catalog.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Grid of Selectable Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {COMMON_CATEGORIES.map(category => {
          const isSelected = selectedProducts.includes(category);
          return (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`p-2.5 rounded-md border text-left text-xs font-medium transition flex items-center justify-between ${
                isSelected
                  ? 'border-emerald-700 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <span>{category}</span>
              {isSelected && (
                <Check className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 stroke-[2.5]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Custom Tag Input */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Add Custom Product / Tag
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g. Basmati Rice, Dry Fruits, Jaggery"
            value={customItem}
            onChange={(e) => setCustomItem(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(e); }}
            className="flex-1 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
          <button
            type="button"
            onClick={handleAddCustom}
            className="py-1.5 px-3 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium hover:bg-slate-200 transition flex items-center space-x-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Selected Items summary tags */}
      {selectedProducts.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
            Active Catalog Items ({selectedProducts.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedProducts.map(item => (
              <span
                key={item}
                className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

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
          <span>Continue to Products Needed</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
