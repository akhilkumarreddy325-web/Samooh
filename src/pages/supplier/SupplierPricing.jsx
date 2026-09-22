import React, { useState, useEffect } from 'react';
import { 
  Tag, Plus, Trash2, Save, RefreshCw, 
  CheckCircle2, Calculator, AlertCircle, Percent, Info
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierProducts, updateSupplierProduct } from '../../services/api';

export default function SupplierPricing() {
  const { currentSupplier } = useApp();
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form states for selected product
  const [wholesalePrice, setWholesalePrice] = useState(1180);
  const [moq, setMoq] = useState(40);
  const [discountPct, setDiscountPct] = useState(0);
  const [tiers, setTiers] = useState([]);

  // Live Test Quantity for Simulator
  const [testQty, setTestQty] = useState(75);

  const supId = currentSupplier?.id || 'sup_01';

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await getSupplierProducts(supId);
      setProducts(data);
      if (data && data.length > 0) {
        selectProduct(data[0]);
      }
    } catch (err) {
      console.error("Error loading products:", err);
    } finally {
      setLoading(false);
    }
  };

  const selectProduct = (prod) => {
    setSelectedProductId(prod.id);
    setWholesalePrice(prod.wholesale_price || 100);
    setMoq(prod.min_wholesale_quantity || 30);
    setDiscountPct(prod.discount_pct || 0);
    setTiers(prod.quantity_tiers || [
      { min_quantity: 1, max_quantity: Math.max(1, (prod.min_wholesale_quantity || 30) - 1), price_per_unit: prod.retail_price ? prod.retail_price * 0.9 : 120 },
      { min_quantity: prod.min_wholesale_quantity || 30, max_quantity: (prod.min_wholesale_quantity || 30) * 3, price_per_unit: prod.wholesale_price || 100 },
      { min_quantity: (prod.min_wholesale_quantity || 30) * 3 + 1, max_quantity: null, price_per_unit: (prod.wholesale_price || 100) * 0.95 }
    ]);
    setTestQty((prod.min_wholesale_quantity || 30) * 1.5);
  };

  useEffect(() => {
    loadProducts();
  }, [supId]);

  const handleProductChange = (e) => {
    const p = products.find(prod => prod.id === e.target.value);
    if (p) selectProduct(p);
  };

  const handleAddTier = () => {
    const lastTier = tiers[tiers.length - 1];
    const newMin = lastTier && lastTier.max_quantity ? lastTier.max_quantity + 1 : (moq + 50);
    setTiers([...tiers, { min_quantity: newMin, max_quantity: null, price_per_unit: wholesalePrice * 0.9 }]);
  };

  const handleRemoveTier = (idx) => {
    setTiers(tiers.filter((_, i) => i !== idx));
  };

  const handleTierChange = (idx, field, value) => {
    const updated = [...tiers];
    updated[idx][field] = field === 'price_per_unit' || field === 'min_quantity' 
      ? parseFloat(value || 0)
      : (value === '' || value === null ? null : parseFloat(value));
    setTiers(updated);
  };

  const handleSaveTerms = async () => {
    if (!selectedProductId) return;
    setSaving(true);
    try {
      const payload = {
        wholesale_price: parseFloat(wholesalePrice),
        min_wholesale_quantity: parseFloat(moq),
        discount_pct: parseFloat(discountPct),
        quantity_tiers: tiers
      };
      await updateSupplierProduct(supId, selectedProductId, payload);
      setNotification("Wholesale commercial terms and MOQ successfully saved");
      setTimeout(() => setNotification(null), 3500);
      await loadProducts();
    } catch (err) {
      alert("Failed to update terms: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Live Calculator Calculation
  const activeProduct = products.find(p => p.id === selectedProductId);
  const uom = activeProduct?.unit_of_measure || 'units';

  let calculatedTierPrice = wholesalePrice;
  let appliedTier = null;
  const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);

  for (const t of sortedTiers) {
    if (t.max_quantity != null) {
      if (testQty >= t.min_quantity && testQty <= t.max_quantity) {
        calculatedTierPrice = t.price_per_unit;
        appliedTier = t;
        break;
      }
    } else {
      if (testQty >= t.min_quantity) {
        calculatedTierPrice = t.price_per_unit;
        appliedTier = t;
      }
    }
  }

  const additionalDiscountAmount = (discountPct / 100) * calculatedTierPrice;
  const finalUnitPrice = Math.max(0, calculatedTierPrice - additionalDiscountAmount);
  const finalOrderValue = testQty * finalUnitPrice;
  const isMoqSatisfied = testQty >= moq;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Commercial Terms
            </span>
            <span className="text-xs text-slate-500 font-normal">
              Direct Procurement Integration
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-1">
            Wholesale Pricing & MOQ Manager
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure volume-based wholesale price tiers and minimum order quantities (MOQ). Changes dynamically drive the Samooh Procurement Engine.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={loadProducts}
            className="px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700/60 transition flex items-center space-x-1.5 shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveTerms}
            disabled={saving}
            className="px-3.5 py-1.5 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium transition shadow-sm flex items-center space-x-1.5"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Terms'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Config Form & Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Commercial Configuration (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm space-y-5">
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
              Select Wholesale Product
            </label>
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) — Current MOQ: {p.min_wholesale_quantity} {p.unit_of_measure}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Terms: Wholesale Base Price & MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Base Wholesale Price
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-800"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">per {uom}</span>
            </div>

            <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Supplier MOQ (Minimum)
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="1"
                  value={moq}
                  onChange={(e) => setMoq(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-800"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">Pooled {uom} required</span>
            </div>

            <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-1">
                Volume Discount (%)
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                  className="w-full text-base font-bold bg-transparent border-b border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-800"
                />
                <Percent className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">On unlocked tier</span>
            </div>
          </div>

          {/* Quantity-Based Wholesale Price Tiers */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center space-x-2">
                  <Tag className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
                  <span>Quantity Price Tiers</span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Larger aggregated Kirana orders unlock lower unit prices
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div 
                  key={idx}
                  className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-2 text-xs"
                >
                  <span className="w-6 font-semibold text-slate-400 text-center text-[11px]">#{idx + 1}</span>

                  <div className="flex-1 flex items-center space-x-1.5">
                    <input
                      type="number"
                      value={tier.min_quantity}
                      onChange={(e) => handleTierChange(idx, 'min_quantity', e.target.value)}
                      placeholder="Min"
                      className="w-20 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-[11px]">to</span>
                    <input
                      type="number"
                      value={tier.max_quantity ?? ''}
                      onChange={(e) => handleTierChange(idx, 'max_quantity', e.target.value)}
                      placeholder="∞"
                      className="w-20 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-center font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-slate-500 text-[11px]">{uom}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="font-medium text-slate-500">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tier.price_per_unit}
                      onChange={(e) => handleTierChange(idx, 'price_per_unit', e.target.value)}
                      className="w-24 border border-slate-200 dark:border-slate-700 rounded px-2 py-1 text-right font-semibold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-slate-400 text-[11px]">/{uom}</span>
                  </div>

                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                      title="Remove Tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Live What-If Testing Calculator (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center space-x-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs tracking-tight">
              <Calculator className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
              <span>Procurement Simulator</span>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Simulated Pooled Order
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Test how the procurement engine evaluates your tier rates for grouped retailers.
              </p>
            </div>

            {/* Test Quantity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">Pooled Retailer Demand:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{testQty} {uom}</span>
              </div>
              <input
                type="range"
                min="5"
                max={Math.max(300, moq * 4)}
                step="5"
                value={testQty}
                onChange={(e) => setTestQty(parseFloat(e.target.value))}
                className="w-full accent-emerald-800 h-1.5 rounded cursor-pointer bg-slate-200 dark:bg-slate-700"
              />
            </div>

            {/* Live MOQ Status Card */}
            <div className={`p-3 rounded-md border text-xs flex items-center space-x-2.5 ${
              isMoqSatisfied 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                : 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
            }`}>
              {isMoqSatisfied ? (
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-700" />
              ) : (
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-700" />
              )}
              <div>
                <div className="font-semibold">
                  {isMoqSatisfied ? 'MOQ Satisfied' : 'MOQ Deficit (Pool Ineligible)'}
                </div>
                <div className="text-[11px] opacity-90 mt-0.5">
                  {isMoqSatisfied 
                    ? `Order quantity (${testQty} ${uom}) meets minimum threshold of ${moq} ${uom}.`
                    : `Shortfall of ${moq - testQty} ${uom} needed to reach minimum wholesale threshold.`
                  }
                </div>
              </div>
            </div>

            {/* Itemized Financial Breakdown */}
            <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Base Wholesale Price:</span>
                <span className="font-medium">₹{Number(wholesalePrice || 0).toFixed(2)}/{uom}</span>
              </div>

              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Unlocked Quantity Tier:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{Number(calculatedTierPrice || 0).toFixed(2)}/{uom}
                  {appliedTier && (
                    <span className="text-[10px] text-slate-400 ml-1 font-normal">
                      ({appliedTier.min_quantity}–{appliedTier.max_quantity || '∞'} {uom})
                    </span>
                  )}
                </span>
              </div>

              {discountPct > 0 && (
                <div className="flex items-center justify-between text-emerald-800 dark:text-emerald-400 font-medium">
                  <span>Additional Discount ({discountPct}%):</span>
                  <span>-₹{Number(additionalDiscountAmount || 0).toFixed(2)}/{uom}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between font-bold text-xs">
                <span className="text-slate-900 dark:text-white">Final Unit Price:</span>
                <span className="text-sm text-emerald-800 dark:text-emerald-400">₹{Number(finalUnitPrice || 0).toFixed(2)}/{uom}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500">Total Group Invoice:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ₹{finalOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 dark:bg-slate-900/40 p-3 rounded-md border border-slate-200 dark:border-slate-700 flex items-start space-x-2">
            <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>Commercial terms are directly evaluated when Kirana stores pool demand through the procurement engine.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
