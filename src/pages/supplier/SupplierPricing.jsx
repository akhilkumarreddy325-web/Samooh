import React, { useState, useEffect } from 'react';
import { 
  FileText, Tag, Plus, Trash2, Save, RefreshCw, 
  CheckCircle2, Calculator, ArrowRight, AlertCircle, Percent
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupplierProducts, updateSupplierProduct } from '../../services/api';

export default function SupplierPricing() {
  const { theme, currentSupplier } = useApp();
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

  // Live Test Quantity for What-If Calculator
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
      setNotification("Wholesale commercial terms and MOQ successfully saved!");
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

  // Find tier matching testQty
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
  const grossValue = testQty * wholesalePrice;
  const finalOrderValue = testQty * finalUnitPrice;
  const totalSavings = Math.max(0, grossValue - finalOrderValue);
  const isMoqSatisfied = testQty >= moq;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Commercial Terms Engine
            </span>
            <span className="text-xs text-slate-400">
              Direct Procurement Integration
            </span>
          </div>
          <h1 className={`text-2xl font-black tracking-tight mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
            Wholesale Pricing & MOQ Manager
          </h1>
          <p className={`text-xs mt-0.5 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            Configure quantity-based wholesale price tiers and minimum order quantities (MOQ). Changes dynamically drive the Samooh Procurement Engine.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={loadProducts}
            className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 shadow-sm ${
              theme === 'light' 
                ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                : 'bg-[#131A2A] border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>

          <button
            onClick={handleSaveTerms}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold transition shadow-md flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Save & Publish Commercial Terms'}</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center space-x-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Grid: Config Form & Live Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Commercial Configuration (7 cols) */}
        <div className={`lg:col-span-7 p-6 rounded-3xl border space-y-6 ${
          theme === 'light' ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#131A2A] border-slate-800 text-white'
        }`}>
          {/* Product Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">
              Select Wholesale Product
            </label>
            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold transition ${
                theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-[#0B1020] border-slate-800 text-slate-200'
              }`}
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.category}) — Current MOQ: {p.min_wholesale_quantity} {p.unit_of_measure}
                </option>
              ))}
            </select>
          </div>

          {/* Primary Terms: Wholesale Base Price & MOQ */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className={`p-4 rounded-2xl border ${
              theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0B1020]/80 border-slate-800'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Base Wholesale Price
              </span>
              <div className="flex items-center space-x-1">
                <span className="text-base font-black text-amber-500">₹</span>
                <input
                  type="number"
                  step="0.5"
                  value={wholesalePrice}
                  onChange={(e) => setWholesalePrice(parseFloat(e.target.value) || 0)}
                  className={`w-full text-lg font-black bg-transparent border-b focus:outline-none ${
                    theme === 'light' ? 'border-slate-300 text-slate-900 focus:border-amber-500' : 'border-slate-700 text-white focus:border-amber-500'
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">per {uom}</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              theme === 'light' ? 'bg-amber-50/50 border-amber-200' : 'bg-amber-500/5 border-amber-500/20'
            }`}>
              <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block mb-1">
                Supplier MOQ (Minimum)
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="1"
                  value={moq}
                  onChange={(e) => setMoq(parseFloat(e.target.value) || 0)}
                  className={`w-full text-lg font-black bg-transparent border-b focus:outline-none ${
                    theme === 'light' ? 'border-amber-300 text-amber-900 focus:border-amber-500' : 'border-amber-600/40 text-amber-300 focus:border-amber-400'
                  }`}
                />
              </div>
              <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70 mt-1 block">Total pooled {uom} required</span>
            </div>

            <div className={`p-4 rounded-2xl border ${
              theme === 'light' ? 'bg-slate-50/80 border-slate-200' : 'bg-[#0B1020]/80 border-slate-800'
            }`}>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Percentage Discount (%)
              </span>
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="50"
                  value={discountPct}
                  onChange={(e) => setDiscountPct(parseFloat(e.target.value) || 0)}
                  className={`w-full text-lg font-black bg-transparent border-b focus:outline-none ${
                    theme === 'light' ? 'border-slate-300 text-slate-900 focus:border-amber-500' : 'border-slate-700 text-white focus:border-amber-500'
                  }`}
                />
                <Percent className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Applied on unlocked tier</span>
            </div>
          </div>

          {/* Quantity-Based Wholesale Price Tiers */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-amber-500" />
                  <span>Quantity-Based Price Tiers</span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Larger aggregated Kirana orders unlock lower unit prices
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddTier}
                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold transition flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Tier</span>
              </button>
            </div>

            <div className="space-y-2">
              {tiers.map((tier, idx) => (
                <div 
                  key={idx}
                  className={`p-3 rounded-xl border flex items-center gap-2 text-xs ${
                    theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-[#0B1020] border-slate-800'
                  }`}
                >
                  <span className="w-6 font-bold text-slate-400 text-center">#{idx + 1}</span>

                  <div className="flex-1 flex items-center space-x-1.5">
                    <input
                      type="number"
                      value={tier.min_quantity}
                      onChange={(e) => handleTierChange(idx, 'min_quantity', e.target.value)}
                      placeholder="Min"
                      className={`w-20 border rounded-lg px-2 py-1 text-center font-bold ${
                        theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                    <span className="text-slate-400">to</span>
                    <input
                      type="number"
                      value={tier.max_quantity ?? ''}
                      onChange={(e) => handleTierChange(idx, 'max_quantity', e.target.value)}
                      placeholder="∞"
                      className={`w-20 border rounded-lg px-2 py-1 text-center font-bold ${
                        theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                    <span className="text-slate-400">{uom}</span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-amber-500">₹</span>
                    <input
                      type="number"
                      step="0.5"
                      value={tier.price_per_unit}
                      onChange={(e) => handleTierChange(idx, 'price_per_unit', e.target.value)}
                      className={`w-24 border rounded-lg px-2 py-1 text-right font-black ${
                        theme === 'light' ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-700'
                      }`}
                    />
                    <span className="text-slate-400">/{uom}</span>
                  </div>

                  {tiers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(idx)}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 transition"
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
        <div className={`lg:col-span-5 p-6 rounded-3xl border flex flex-col justify-between space-y-6 ${
          theme === 'light' ? 'bg-amber-500/5 border-amber-500/20' : 'bg-[#131A2A] border-amber-500/30'
        }`}>
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Calculator className="w-4 h-4" />
              <span>Live Procurement Simulator</span>
            </div>

            <div>
              <h3 className={`text-base font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Simulated Pooled Order
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Test how the procurement engine evaluates your current pricing tiers for grouped retailers.
              </p>
            </div>

            {/* Test Quantity Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500 dark:text-slate-400">Pooled Retailer Demand:</span>
                <span className="text-base font-black text-amber-500">{testQty} {uom}</span>
              </div>
              <input
                type="range"
                min="5"
                max={Math.max(300, moq * 4)}
                step="5"
                value={testQty}
                onChange={(e) => setTestQty(parseFloat(e.target.value))}
                className="w-full accent-amber-500 h-2 rounded-lg cursor-pointer bg-slate-200 dark:bg-slate-800"
              />
            </div>

            {/* Live MOQ Status Card */}
            <div className={`p-3.5 rounded-2xl border flex items-center space-x-3 text-xs ${
              isMoqSatisfied 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
                : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
            }`}>
              {isMoqSatisfied ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <div>
                <div className="font-black">
                  {isMoqSatisfied ? '✓ MOQ Satisfied' : '⚠ MOQ Deficit (Group Ineligible)'}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  {isMoqSatisfied 
                    ? `Order quantity (${testQty} ${uom}) meets or exceeds configured MOQ of ${moq} ${uom}.`
                    : `Shortfall of ${moq - testQty} ${uom} needed to reach minimum wholesale threshold.`
                  }
                </div>
              </div>
            </div>

            {/* Itemized Financial Breakdown */}
            <div className={`p-4 rounded-2xl border space-y-2.5 text-xs ${
              theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-[#0B1020]/80 border-slate-800'
            }`}>
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Base Wholesale Price:</span>
                <span className="font-bold">₹{Number(wholesalePrice || 0).toFixed(2)}/{uom}</span>
              </div>

              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span>Unlocked Quantity Tier:</span>
                <span className="font-black text-amber-500">
                  ₹{Number(calculatedTierPrice || 0).toFixed(2)}/{uom}
                  {appliedTier && (
                    <span className="text-[10px] text-slate-400 ml-1">
                      ({appliedTier.min_quantity}–{appliedTier.max_quantity || '∞'} {uom})
                    </span>
                  )}
                </span>
              </div>

              {discountPct > 0 && (
                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>Additional Discount ({discountPct}%):</span>
                  <span>-₹{Number(additionalDiscountAmount || 0).toFixed(2)}/{uom}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-black text-sm">
                <span className={theme === 'light' ? 'text-slate-900' : 'text-white'}>Final Unit Price:</span>
                <span className="text-amber-500 text-base">₹{Number(finalUnitPrice || 0).toFixed(2)}/{uom}</span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-400">Total Group Invoice Value:</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  ₹{finalOrderValue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-black/5 dark:border-white/5">
            💡 <strong>Dynamic Synchronization:</strong> Once saved, these terms are directly evaluated when Kirana stores pool demand. No hardcoded rates exist inside the engine.
          </div>
        </div>
      </div>
    </div>
  );
}
