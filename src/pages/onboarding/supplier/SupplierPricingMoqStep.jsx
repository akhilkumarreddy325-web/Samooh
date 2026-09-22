import React, { useState } from 'react';
import { DollarSign, ShieldAlert, Plus, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function SupplierPricingMoqStep({ data, onUpdate, onNext, onBack }) {
  const [products, setProducts] = useState(data.configuredProducts || []);
  const [activeProdIndex, setActiveProdIndex] = useState(0);
  const [validationError, setValidationError] = useState('');

  const currentProduct = products[activeProdIndex] || products[0];

  const handlePriceChange = (field, val) => {
    setValidationError('');
    const updated = [...products];
    updated[activeProdIndex][field] = parseFloat(val) || 0;
    setProducts(updated);
  };

  const handleTierChange = (tierIdx, field, val) => {
    setValidationError('');
    const updated = [...products];
    const tiers = [...(updated[activeProdIndex].quantity_tiers || [])];
    const parsed = val === '' ? null : (parseFloat(val) || 0);
    tiers[tierIdx][field] = parsed;
    updated[activeProdIndex].quantity_tiers = tiers;
    setProducts(updated);
  };

  const handleAddTier = () => {
    const updated = [...products];
    const currentTiers = updated[activeProdIndex].quantity_tiers || [];
    const lastTier = currentTiers[currentTiers.length - 1];
    const newMin = lastTier ? (lastTier.max_quantity ? lastTier.max_quantity + 1 : lastTier.min_quantity + 100) : 1;
    
    currentTiers.push({
      min_quantity: newMin,
      max_quantity: null,
      price_per_unit: Math.max(1, (updated[activeProdIndex].wholesale_price || 50) - 2)
    });

    updated[activeProdIndex].quantity_tiers = currentTiers;
    setProducts(updated);
  };

  const handleRemoveTier = (tierIdx) => {
    const updated = [...products];
    const currentTiers = (updated[activeProdIndex].quantity_tiers || []).filter((_, i) => i !== tierIdx);
    updated[activeProdIndex].quantity_tiers = currentTiers;
    setProducts(updated);
  };

  // Comprehensive Tier & MOQ Validation (Specification Section 42 & 43)
  const validateCurrent = () => {
    for (let pIdx = 0; pIdx < products.length; pIdx++) {
      const p = products[pIdx];
      if (!p.wholesale_price || p.wholesale_price <= 0) {
        setValidationError(`"${p.name}": Wholesale base price must be greater than 0.`);
        setActiveProdIndex(pIdx);
        return false;
      }
      if (!p.moq || p.moq <= 0) {
        setValidationError(`"${p.name}": Supplier MOQ must be greater than 0.`);
        setActiveProdIndex(pIdx);
        return false;
      }

      const tiers = p.quantity_tiers || [];
      for (let i = 0; i < tiers.length; i++) {
        const tier = tiers[i];
        if (tier.min_quantity < 0) {
          setValidationError(`"${p.name}" Tier ${i + 1}: Minimum quantity cannot be negative.`);
          setActiveProdIndex(pIdx);
          return false;
        }
        if (tier.price_per_unit <= 0) {
          setValidationError(`"${p.name}" Tier ${i + 1}: Price per unit must be greater than 0.`);
          setActiveProdIndex(pIdx);
          return false;
        }
        if (tier.max_quantity !== null && tier.max_quantity !== undefined) {
          if (tier.max_quantity <= tier.min_quantity) {
            setValidationError(`"${p.name}" Tier ${i + 1}: Maximum quantity (${tier.max_quantity}) must be greater than minimum quantity (${tier.min_quantity}).`);
            setActiveProdIndex(pIdx);
            return false;
          }
        }
        // Check overlap with next tier
        if (i < tiers.length - 1) {
          const nextTier = tiers[i + 1];
          if (tier.max_quantity === null) {
            setValidationError(`"${p.name}" Tier ${i + 1}: Only the last tier can have an unbounded (null) maximum.`);
            setActiveProdIndex(pIdx);
            return false;
          }
          if (nextTier.min_quantity <= tier.max_quantity) {
            setValidationError(`"${p.name}": Overlapping tiers detected between Tier ${i + 1} (up to ${tier.max_quantity}) and Tier ${i + 2} (starts at ${nextTier.min_quantity}).`);
            setActiveProdIndex(pIdx);
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleContinue = () => {
    if (validateCurrent()) {
      onUpdate({ configuredProducts: products });
      onNext();
    }
  };

  if (!currentProduct) {
    return <div>No products configured. Please go back to Step 3.</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 4: Wholesale Pricing, MOQ & Volume Tiers
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure baseline wholesale prices, minimum order thresholds (MOQ), and volume-based discounts.
        </p>
      </div>

      {/* Distinction Info Banner */}
      <div className="p-3 rounded-md bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-xs flex items-start space-x-2">
        <CheckCircle2 className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
        <span className="text-slate-700 dark:text-slate-300 text-[11px] leading-relaxed">
          <strong>Supplier-Side MOQ Control:</strong> Your Minimum Order Quantity (MOQ) defines the threshold below which your warehouse will not dispatch. When individual Kirana stores order smaller amounts, Samooh pools multiple stores together to meet your MOQ in a single combined shipment.
        </span>
      </div>

      {validationError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{validationError}</span>
        </div>
      )}

      {/* Product Tab Selector */}
      <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto space-x-2 pb-1">
        {products.map((p, idx) => (
          <button
            key={p.id || idx}
            type="button"
            onClick={() => { setActiveProdIndex(idx); setValidationError(''); }}
            className={`py-1.5 px-3 rounded-t-md text-xs font-medium whitespace-nowrap transition border-b-2 ${
              activeProdIndex === idx
                ? 'border-emerald-800 text-emerald-900 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/30 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {p.name.split(' ')[0]} {p.name.split(' ')[1] || ''}
          </button>
        ))}
      </div>

      {/* Active Product Details */}
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              {currentProduct.name}
            </h4>
            <span className="text-xs text-slate-500">Unit: per {currentProduct.unit}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Base Wholesale Price */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Base Wholesale Price (₹ per {currentProduct.unit}) <span className="text-rose-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={currentProduct.wholesale_price || ''}
                onChange={(e) => handlePriceChange('wholesale_price', e.target.value)}
                className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
              />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Default baseline price before unlocked volume tiers.
            </span>
          </div>

          {/* Supplier MOQ */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Minimum Wholesale Order Quantity (MOQ in {currentProduct.unit}) <span className="text-rose-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              value={currentProduct.moq || ''}
              onChange={(e) => handlePriceChange('moq', e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Minimum aggregate load required to dispatch this item.
            </span>
          </div>
        </div>

        {/* Quantity-Based Pricing Tiers */}
        <div className="pt-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Quantity-Tier Pricing (Unlocked by Pooled Groups)
            </label>
            <button
              type="button"
              onClick={handleAddTier}
              className="text-xs text-emerald-800 dark:text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <Plus className="w-3 h-3" />
              <span>Add Tier</span>
            </button>
          </div>

          <div className="border border-slate-200 dark:border-slate-700 rounded-md overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-2 px-3">Tier Range ({currentProduct.unit})</th>
                  <th className="py-2 px-3">Min Qty</th>
                  <th className="py-2 px-3">Max Qty (leave empty for 500+)</th>
                  <th className="py-2 px-3">Tier Price (₹/{currentProduct.unit})</th>
                  <th className="py-2 px-3 w-12 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                {(currentProduct.quantity_tiers || []).map((t, tIdx) => (
                  <tr key={tIdx}>
                    <td className="py-2 px-3 text-slate-600 font-medium">
                      Tier {tIdx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        value={t.min_quantity}
                        onChange={(e) => handleTierChange(tIdx, 'min_quantity', e.target.value)}
                        className="w-24 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        placeholder="No upper limit"
                        value={t.max_quantity === null || t.max_quantity === undefined ? '' : t.max_quantity}
                        onChange={(e) => handleTierChange(tIdx, 'max_quantity', e.target.value)}
                        className="w-28 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0.1"
                        step="0.5"
                        value={t.price_per_unit}
                        onChange={(e) => handleTierChange(tIdx, 'price_per_unit', e.target.value)}
                        className="w-24 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold text-emerald-800 dark:text-emerald-400"
                      />
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveTier(tIdx)}
                        className="text-slate-400 hover:text-rose-600 transition"
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
          <span>Continue to Delivery Capability</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
