import React, { useState } from 'react';
import { Truck, Clock, MapPin, CheckSquare, ArrowRight, ArrowLeft } from 'lucide-react';

export default function SupplierDeliveryStep({ data, onUpdate, onNext, onBack }) {
  const [serviceRadius, setServiceRadius] = useState(data.serviceRadiusKm || 50);
  const [leadTime, setLeadTime] = useState(data.leadTimeDays || 2);
  const [distributionArea, setDistributionArea] = useState(data.distributionArea || 'Hyderabad Greater Metro & Industrial Belts');
  const [pickupAvailable, setPickupAvailable] = useState(data.pickupAvailable !== false);

  const handleContinue = (e) => {
    e.preventDefault();
    onUpdate({
      serviceRadiusKm: Number(serviceRadius),
      leadTimeDays: Number(leadTime),
      distributionArea,
      pickupAvailable
    });
    onNext();
  };

  return (
    <form onSubmit={handleContinue} className="space-y-5">
      <div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">
          Step 5: Delivery & Fulfillment Capability
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Define transit parameters, fleet delivery reach, and lead times for logistics pairing.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Service Radius */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Service / Dispatch Radius (km)
          </label>
          <div className="relative">
            <Truck className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="5"
              max="250"
              value={serviceRadius}
              onChange={(e) => setServiceRadius(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Maximum road distance your vehicles or partner fleet will service.
          </span>
        </div>

        {/* Lead Time Days */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Standard Order Lead Time (Days)
          </label>
          <div className="relative">
            <Clock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              min="1"
              max="14"
              value={leadTime}
              onChange={(e) => setLeadTime(e.target.value)}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
            />
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Average days between group order confirmation and hub delivery.
          </span>
        </div>
      </div>

      {/* Distribution Area Description */}
      <div>
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Primary Regional Coverage Zones
        </label>
        <div className="relative">
          <MapPin className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={distributionArea}
            onChange={(e) => setDistributionArea(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-800"
          />
        </div>
      </div>

      {/* Pickup Availability */}
      <div className="p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-start justify-between space-x-3">
        <div>
          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
            Enable Warehouse Pickup by Samooh Logistics
          </span>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
            Allow Samooh-recommended shared transport vehicles (Tata Ace, 407, Bolero Maxi) to load directly from your warehouse loading dock.
          </p>
        </div>

        <input
          type="checkbox"
          checked={pickupAvailable}
          onChange={(e) => setPickupAvailable(e.target.checked)}
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
