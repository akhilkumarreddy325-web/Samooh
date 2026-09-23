import React, { useState } from 'react';
import { Check, Plus, X, ArrowRight, ArrowLeft } from 'lucide-react';

const SUPPLIER_CATEGORIES = [
  'Grains & Staples',
  'Rice (Raw & Boiled)',
  'Wheat, Atta & Flours',
  'Pulses, Dal & Legumes',
  'Edible & Cooking Oils',
  'Sugar & Sweeteners',
  'Spices & Whole Condiments',
  'Tea, Coffee & Beverages',
  'Biscuits, Bakery & Snacks',
  'Personal Care & Hygiene',
  'Cleaning & Laundry Supplies',
  'Packaged FMCG Foods'
];

export default function SupplierProductsStep({ data, onUpdate, onNext, onBack }) {
  const [selectedCats, setSelectedCats] = useState(Array.isArray(data.productsSupplied) ? data.productsSupplied : []);
  const [customCat, setCustomCat] = useState('');
  const [error, setError] = useState('');

  const toggleCategory = (cat) => {
    setError('');
    if (selectedCats.includes(cat)) {
      setSelectedCats(selectedCats.filter(c => c !== cat));
    } else {
      setSelectedCats([...selectedCats, cat]);
    }
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customCat.trim()) return;
    const trimmed = customCat.trim();
    if (!selectedCats.includes(trimmed)) {
      setSelectedCats([...selectedCats, trimmed]);
    }
    setCustomCat('');
  };

  const handleRemove = (cat) => {
    setSelectedCats(selectedCats.filter(c => c !== cat));
  };

  const handleContinue = () => {
    if (selectedCats.length === 0) {
      setError('Please select at least one product category your enterprise supplies.');
      return;
    }
    onUpdate({ productsSupplied: selectedCats });
    onNext();
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 2: Wholesale Categories Supplied
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Select the core commodity categories you distribute to regional kirana store clusters.
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs">
          {error}
        </div>
      )}

      {/* Grid of Selectable Categories */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {SUPPLIER_CATEGORIES.map(category => {
          const isSelected = selectedCats.includes(category);
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

      {/* Custom Category Input */}
      <div className="pt-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Add Specialized Wholesale Line
        </label>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="e.g. Organic Millet, Cold Pressed Oils, Bulk Spices"
            value={customCat}
            onChange={(e) => setCustomCat(e.target.value)}
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

      {/* Selected Items Tags */}
      {selectedCats.length > 0 && (
        <div className="pt-2">
          <span className="text-[11px] font-medium text-slate-500 block mb-1.5">
            Active Supply Lines ({selectedCats.length}):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {selectedCats.map(cat => (
              <span
                key={cat}
                className="inline-flex items-center space-x-1 text-xs px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemove(cat)}
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
          <span>Continue to Inventory Setup</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
