import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, ArrowLeft, Users, DollarSign, MapPin, Calendar } from 'lucide-react';

const FREQUENCIES = [
  'Weekly',
  'Several times a week',
  'Every 2 weeks',
  'Monthly',
  'Daily'
];

export default function RetailerPreferencesStep({ data, onUpdate, onNext, onBack }) {
  const [maxBudget, setMaxBudget] = useState(data.maxProcurementBudget || 25000);
  const [maxQty, setMaxQty] = useState(data.maxComfortableQuantity || 200);
  const [radius, setRadius] = useState(data.deliveryRadiusKm || 5.0);
  const [frequency, setFrequency] = useState(data.purchaseFrequency || 'Weekly');
  const [participate, setParticipate] = useState(data.participateGroupProcurement !== false);

  const handleContinue = (e) => {
    e.preventDefault();
    onUpdate({
      maxProcurementBudget: Number(maxBudget),
      maxComfortableQuantity: Number(maxQty),
      deliveryRadiusKm: Number(radius),
      purchaseFrequency: frequency,
      participateGroupProcurement: participate
    });
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 4: Procurement Preferences & Affordability
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure your store's capital capacity and group buying constraints.
        </p>
      </div>

      {/* Architectural Distinction Alert */}
      <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
        <div className="font-semibold text-slate-900 dark:text-white flex items-center space-x-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 flex-shrink-0" />
          <span>Samooh Affordability vs Supplier MOQ Rule</span>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
          Your parameters define your <strong>affordability ceiling</strong> (what you can comfortably stock and finance). Suppliers set the <strong>wholesale MOQ</strong>. The Samooh procurement engine combines allocations across neighboring stores to satisfy supplier MOQ without ever forcing your store over its individual capacity.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Maximum Comfortable Procurement Budget */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Max Comfortable Procurement Budget (₹)
          </label>
          <div className="relative">
            <DollarSign className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="1000"
              step="500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Suggested: ₹25,000 to ₹1,50,000 per procurement cycle.
          </span>
        </div>

        {/* Max Comfortable Quantity */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Max Comfortable Single Item Volume (kg / units)
          </label>
          <input
            type="number"
            min="10"
            step="10"
            value={maxQty}
            onChange={(e) => setMaxQty(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
          <span className="text-[11px] text-slate-500 mt-1 block">
            Maximum single-order batch size your shop storage can hold.
          </span>
        </div>

        {/* Preferred Delivery Radius */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Preferred Cluster Radius (km)
          </label>
          <div className="relative">
            <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="1"
              max="50"
              step="0.5"
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Stores within this radius will be grouped for shared logistics.
          </span>
        </div>

        {/* Preferred Purchasing Frequency */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Preferred Procurement Frequency
          </label>
          <div className="relative">
            <Calendar className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            >
              {FREQUENCIES.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Group Procurement Participation Toggle */}
      <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start justify-between space-x-3">
        <div className="flex items-start space-x-2.5">
          <Users className="w-4 h-4 text-emerald-800 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-semibold text-slate-900 dark:text-white block">
              Enable Collective Group Procurement
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Allow Samooh algorithms to automatically pair your demand with verified neighboring Kirana merchants to trigger tier-4 wholesale pricing and shared dispatch.
            </p>
          </div>
        </div>

        <input
          type="checkbox"
          checked={participate}
          onChange={(e) => setParticipate(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-800 focus:ring-emerald-800"
        />
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
          type="submit"
          className="py-2 px-6 rounded-md bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs shadow-sm transition flex items-center space-x-1.5"
        >
          <span>Continue to Final Review</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </form>
  );
}
