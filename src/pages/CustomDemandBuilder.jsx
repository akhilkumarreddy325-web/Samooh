import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, CheckCircle, Sparkles, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CATALOG_ITEMS = [
  {
    id: 'prod_001',
    name: 'Sona Masoori Rice (25kg Bag)',
    category: 'Grains & Pulses',
    retailPrice: 1450,
    wholesalePrice: 1180,
    unit: 'Bag (25kg)',
    minQty: 1,
    defaultQty: 10,
    supplier: 'Deccan Wholesale Grains'
  },
  {
    id: 'prod_006',
    name: 'Freedom Sunflower Oil (15L Tin)',
    category: 'Oils & Dairy',
    retailPrice: 1950,
    wholesalePrice: 1620,
    unit: 'Tin (15L)',
    minQty: 1,
    defaultQty: 5,
    supplier: 'Telangana Oil Mills'
  },
  {
    id: 'prod_010',
    name: 'Guntur Red Chilli Powder (5kg Pack)',
    category: 'Spices & Condiments',
    retailPrice: 1750,
    wholesalePrice: 1390,
    unit: 'Pack (5kg)',
    minQty: 1,
    defaultQty: 4,
    supplier: 'South India Spice Hub'
  },
  {
    id: 'prod_014',
    name: 'Red Label Tea Master Carton (1kg x 12)',
    category: 'Beverages & Snacks',
    retailPrice: 4800,
    wholesalePrice: 3950,
    unit: 'Carton (12kg)',
    minQty: 1,
    defaultQty: 2,
    supplier: 'Hindustan Wholesale Depot'
  },
  {
    id: 'prod_018',
    name: 'Surf Excel Easy Wash Carton (1kg x 20)',
    category: 'Personal Care',
    retailPrice: 2800,
    wholesalePrice: 2250,
    unit: 'Carton (20kg)',
    minQty: 1,
    defaultQty: 3,
    supplier: 'FMCG Mega Distributors'
  },
  {
    id: 'prod_002',
    name: 'Royal Toor Dal Premium (10kg Bag)',
    category: 'Grains & Pulses',
    retailPrice: 1600,
    wholesalePrice: 1320,
    unit: 'Bag (10kg)',
    minQty: 1,
    defaultQty: 6,
    supplier: 'Deccan Wholesale Grains'
  }
];

export default function CustomDemandBuilder() {
  const { theme, t, setActiveInvoice, user } = useApp();
  const navigate = useNavigate();

  // Quantities state dictionary keyed by product ID
  const [quantities, setQuantities] = useState({
    prod_001: 10,
    prod_006: 5,
    prod_010: 4,
    prod_014: 2
  });

  const updateQuantity = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [id]: next };
    });
  };

  // Calculate live financial arbitrage totals
  let totalRetailCost = 0;
  let totalWholesaleCost = 0;
  let totalItemsCount = 0;

  const selectedLineItems = CATALOG_ITEMS.filter(item => (quantities[item.id] || 0) > 0).map(item => {
    const qty = quantities[item.id];
    const lineRetail = item.retailPrice * qty;
    const lineWholesale = item.wholesalePrice * qty;
    const lineSavings = lineRetail - lineWholesale;

    totalRetailCost += lineRetail;
    totalWholesaleCost += lineWholesale;
    totalItemsCount += qty;

    return {
      ...item,
      qty,
      lineRetail,
      lineWholesale,
      lineSavings
    };
  });

  const totalSavings = totalRetailCost - totalWholesaleCost;
  const overallSavingsPct = totalRetailCost > 0 ? ((totalSavings / totalRetailCost) * 100).toFixed(1) : '0.0';

  const handleGenerateInvoice = () => {
    if (selectedLineItems.length === 0) {
      alert('Please select at least 1 item to build a group order.');
      return;
    }

    const invoicePayload = {
      invoiceNo: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      storeName: user?.storeName || 'Sri Lakshmi Kirana & General Store',
      storeAddress: user?.address || 'Door No 42, Road No 12, Banjara Hills, Hyderabad (500034)',
      clusterHub: user?.clusterHub || 'Hyderabad South-West Wholesale Cluster #4',
      items: selectedLineItems,
      totalRetailCost,
      totalWholesaleCost,
      totalSavings,
      overallSavingsPct,
      totalItemsCount,
      taxGst: Math.round(totalWholesaleCost * 0.05),
      finalPayable: Math.round(totalWholesaleCost * 1.05)
    };

    setActiveInvoice(invoicePayload);
    navigate('/processing');
  };

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight flex items-center ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            <ShoppingBag className="w-6 h-6 text-blue-600 dark:text-accentBlue mr-2.5" />
            {t('builderTitle')}
            <span className={`ml-3 text-xs font-semibold px-2.5 py-1 rounded-full border flex items-center space-x-1 ${
              theme === 'light'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-accentPurple/10 text-accentPurple border-accentPurple/30'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-purple-500" />
              <span>Live Arbitrage Calculator</span>
            </span>
          </h1>
          <p className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
            {t('builderDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Product Catalog Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className={`text-sm font-bold uppercase tracking-wider ${
            theme === 'light' ? 'text-slate-800' : 'text-white'
          }`}>
            {t('selectQuantity')} ({CATALOG_ITEMS.length} Wholesale Items)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {CATALOG_ITEMS.map((item) => {
              const qty = quantities[item.id] || 0;
              const unitDiscountPct = Math.round(((item.retailPrice - item.wholesalePrice) / item.retailPrice) * 100);

              return (
                <div 
                  key={item.id}
                  className={`glass-card rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between ${
                    qty > 0
                      ? theme === 'light'
                        ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-400/30'
                        : 'bg-[#131A2A] border-accentBlue shadow-glow-blue'
                      : theme === 'light'
                        ? 'bg-white/80 border-slate-200/80 shadow-sm'
                        : 'bg-[#131A2A]/60 border-slate-800'
                  }`}
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        {unitDiscountPct}% OFF Bulk
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold mt-2.5 ${
                      theme === 'light' ? 'text-slate-900' : 'text-white'
                    }`}>{item.name}</h4>
                    <p className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      Supplier: {item.supplier}
                    </p>

                    {/* Price Comparison */}
                    <div className="mt-3 grid grid-cols-2 gap-2 p-2.5 rounded-xl border bg-slate-50/80 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 text-xs">
                      <div>
                        <span className={`text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} block`}>Retail Price</span>
                        <span className="text-slate-400 line-through font-semibold">₹{item.retailPrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold block">Samooh Group</span>
                        <span className="text-emerald-600 dark:text-accentGreen font-bold">₹{item.wholesalePrice.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper Control */}
                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
                    <span className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {t('unitMeasure')}: <strong className={theme === 'light' ? 'text-slate-700' : 'text-slate-200'}>{item.unit}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition ${
                          theme === 'light'
                            ? 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'
                            : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className={`w-8 text-center text-sm font-extrabold ${
                        qty > 0 ? (theme === 'light' ? 'text-blue-600' : 'text-accentBlue') : (theme === 'light' ? 'text-slate-400' : 'text-slate-500')
                      }`}>
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Column: Live Financial Summary Box */}
        <div className="space-y-6">
          <div className={`glass-card rounded-2xl p-6 border sticky top-20 transition-all duration-300 ${
            theme === 'light'
              ? 'bg-white/90 border-slate-200/90 shadow-lg'
              : 'bg-[#131A2A] border-slate-800'
          }`}>
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className={`text-sm font-bold uppercase tracking-wider flex items-center ${
                theme === 'light' ? 'text-slate-800' : 'text-white'
              }`}>
                <Tag className="w-4 h-4 text-emerald-500 mr-2" />
                Order Savings Summary
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-accentBlue border border-blue-500/20">
                {totalItemsCount} Units Selected
              </span>
            </div>

            {/* Selected Items Mini List */}
            <div className="py-4 space-y-2.5 max-h-52 overflow-y-auto border-b border-slate-200 dark:border-slate-800">
              {selectedLineItems.length > 0 ? (
                selectedLineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>{item.name}</span>
                      <span className={`block text-[10px] ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>{item.qty} × ₹{item.wholesalePrice}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{item.lineWholesale.toLocaleString()}</span>
                      <span className="block text-[10px] text-emerald-500">Saved ₹{item.lineSavings.toLocaleString()}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className={`text-xs text-center py-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                  No items selected yet. Use the `+` buttons to add custom demand.
                </p>
              )}
            </div>

            {/* Totals Calculation */}
            <div className="py-4 space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t('singleStoreRetailTotal')}</span>
                <span className="line-through">₹{totalRetailCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-600 dark:text-accentGreen">
                <span>{t('samoohGroupWholesaleTotal')}</span>
                <span className="text-sm">₹{totalWholesaleCost.toLocaleString()}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <span className={`font-bold ${theme === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  {t('yourInstantSavings')}
                </span>
                <div className="text-right">
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 block">
                    ₹{totalSavings.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    {overallSavingsPct}% TOTAL DISCOUNT
                  </span>
                </div>
              </div>
            </div>

            {/* AI Guarantee Snippet */}
            <div className={`p-3 rounded-xl border text-[11px] mb-4 flex items-start space-x-2 ${
              theme === 'light' ? 'bg-purple-50/80 border-purple-200 text-purple-800' : 'bg-accentPurple/10 border-accentPurple/20 text-slate-300'
            }`}>
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-accentPurple flex-shrink-0 mt-0.5" />
              <span>{t('bulkTierUnlocked')} Instantly locks maximum supplier discount across 4 cluster Kiranas.</span>
            </div>

            {/* Action Submit Button */}
            <button
              onClick={handleGenerateInvoice}
              disabled={selectedLineItems.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-50"
            >
              <span>{t('createGroupOrderBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
