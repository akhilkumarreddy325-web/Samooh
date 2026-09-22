import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Plus, Minus, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatINR } from '../utils/currency';

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
  const { theme, t, setActiveInvoice, user, addOrderToHistory } = useApp();
  const navigate = useNavigate();

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
      alert('Please select at least 1 item to build an order.');
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
    addOrderToHistory(invoicePayload);
    navigate('/processing');
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
            <ShoppingBag className="w-5 h-5 text-emerald-800 dark:text-emerald-400 mr-2" />
            {t('builderTitle')}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('builderDesc')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Product Catalog Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            {t('selectQuantity')} ({CATALOG_ITEMS.length} Wholesale Items)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {CATALOG_ITEMS.map((item) => {
              const qty = quantities[item.id] || 0;
              const unitDiscountPct = Math.round(((item.retailPrice - item.wholesalePrice) / item.retailPrice) * 100);

              return (
                <div 
                  key={item.id}
                  className={`rounded-lg p-4 border transition-all duration-200 flex flex-col justify-between ${
                    qty > 0
                      ? 'bg-white dark:bg-slate-800 border-emerald-700 shadow-sm'
                      : 'bg-white dark:bg-slate-800 border-slate-200/90 dark:border-slate-700/80 shadow-sm'
                  }`}
                >
                  <div>
                    {/* Header badges */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {item.category}
                      </span>
                      <span className="text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                        {unitDiscountPct}% Bulk Margin
                      </span>
                    </div>

                    <h4 className="text-sm font-bold mt-2 text-slate-900 dark:text-white">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Supplier: {item.supplier}
                    </p>

                    {/* Price Comparison */}
                    <div className="mt-2.5 grid grid-cols-2 gap-2 p-2 rounded-md border bg-slate-50/60 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Retail Benchmark</span>
                        <span className="text-slate-400 line-through font-medium">{formatINR(item.retailPrice)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-emerald-800 dark:text-emerald-400 font-medium block">Wholesale Rate</span>
                        <span className="text-emerald-800 dark:text-emerald-400 font-bold">{formatINR(item.wholesalePrice)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Quantity Stepper Control */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <span className="text-xs text-slate-500">
                      {t('unitMeasure')}: <strong className="text-slate-700 dark:text-slate-300 font-semibold">{item.unit}</strong>
                    </span>

                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="w-7 h-7 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 flex items-center justify-center transition"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-7 text-center text-xs font-bold text-slate-900 dark:text-white">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-7 h-7 rounded bg-emerald-800 text-white flex items-center justify-center hover:bg-emerald-900 transition shadow-sm"
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

        {/* Right 1 Column: Financial Summary Box */}
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 p-5 shadow-sm sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800 dark:text-white flex items-center">
                <Tag className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 mr-1.5" />
                Order Summary
              </h3>
              <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                {totalItemsCount} Units
              </span>
            </div>

            {/* Selected Items Mini List */}
            <div className="py-3 space-y-2 max-h-52 overflow-y-auto border-b border-slate-200 dark:border-slate-700">
              {selectedLineItems.length > 0 ? (
                selectedLineItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-xs">
                    <div className="truncate pr-2">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="block text-[10px] text-slate-400">{item.qty} × {formatINR(item.wholesalePrice)}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">{formatINR(item.lineWholesale)}</span>
                      <span className="block text-[10px] text-emerald-800 dark:text-emerald-400">Save {formatINR(item.lineSavings)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-center py-4 text-slate-400">
                  No items selected yet. Adjust quantities to add items.
                </p>
              )}
            </div>

            {/* Totals Calculation */}
            <div className="py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>{t('singleStoreRetailTotal')}</span>
                <span className="line-through">{formatINR(totalRetailCost)}</span>
              </div>
              <div className="flex justify-between font-medium text-slate-800 dark:text-slate-200">
                <span>{t('samoohGroupWholesaleTotal')}</span>
                <span className="font-bold">{formatINR(totalWholesaleCost)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <span className="font-semibold text-slate-800 dark:text-white">
                  {t('yourInstantSavings')}
                </span>
                <div className="text-right">
                  <span className="text-base font-bold text-emerald-800 dark:text-emerald-400 block">
                    {formatINR(totalSavings)}
                  </span>
                  <span className="text-[10px] font-medium text-emerald-800 dark:text-emerald-300">
                    {overallSavingsPct}% TOTAL SAVINGS
                  </span>
                </div>
              </div>
            </div>

            {/* Bulk Tier Snippet */}
            <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 text-[11px] mb-3 flex items-start space-x-2 text-slate-600 dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{t('bulkTierUnlocked')} Wholesale price tiers unlocked via cluster pooling.</span>
            </div>

            {/* Action Submit Button */}
            <button
              onClick={handleGenerateInvoice}
              disabled={selectedLineItems.length === 0}
              className="w-full py-2 px-4 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
            >
              <span>{t('createGroupOrderBtn')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
