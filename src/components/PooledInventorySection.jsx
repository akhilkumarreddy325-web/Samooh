import React, { useState } from 'react';
import { 
  Truck, 
  Scale, 
  Package, 
  CheckCircle2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  DollarSign, 
  Store, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  ShieldCheck, 
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PooledInventorySection({ 
  pool, 
  interactive = true, 
  compact = false 
}) {
  const { theme, t } = useApp();
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [simulatedDemands, setSimulatedDemands] = useState(null);
  const [simulatedDistance, setSimulatedDistance] = useState(null);

  if (!pool) return null;

  // Extract base or simulated data
  const basePooled = pool.pooled_inventory || {
    product_id: pool.product_id,
    product_name: pool.product_name,
    unit: 'units',
    retailer_count: pool.retailer_names ? pool.retailer_names.length : 4,
    total_quantity: pool.current_pool_quantity || 40,
    unit_weight_kg: 25.0,
    total_weight_kg: (pool.current_pool_quantity || 40) * 25.0,
    supplier_moq: pool.threshold_quantity || 40,
    moq_satisfied: pool.threshold_status === 'ACHIEVED',
    moq_deficit: Math.max(0, (pool.threshold_quantity || 40) - (pool.current_pool_quantity || 40)),
    retailer_demands: pool.retailer_demands || {}
  };

  const baseTransport = pool.transport || {
    total_load_kg: basePooled.total_weight_kg,
    total_quantity: basePooled.total_quantity,
    unit: basePooled.unit,
    recommended_vehicle: 'Tata Ace / Bolero Maxi Truck (SCV)',
    vehicle_type: 'SCV',
    vehicle_capacity_kg: 1000.0,
    capacity_utilization: Math.min(1.0, basePooled.total_weight_kg / 1000.0),
    capacity_utilization_pct: Math.round((basePooled.total_weight_kg / 1000.0) * 100),
    vehicles_required: Math.ceil(basePooled.total_weight_kg / 1000.0) || 1,
    estimated_distance_km: pool.average_cluster_distance_km || 2.5,
    estimated_transit_time_mins: 45,
    delivery_stops_count: basePooled.retailer_count || 4,
    estimated_total_cost_inr: 720.0,
    cost_per_retailer_inr: 180.0,
    individual_transport_cost_inr: 1600.0,
    transport_savings_inr: 880.0,
    transport_status: 'SUITABLE',
    reason: `Vehicle capacity is sufficient for the ${basePooled.total_weight_kg} kg pooled load. Shared dispatch saves ₹880 compared to separate individual store transport.`,
    vehicle_availability: 'Available (In Fleet)',
    alternative_options: []
  };

  // Handle local dynamic recalculation for the what-if jury simulator
  const activeDemands = simulatedDemands !== null ? simulatedDemands : basePooled.retailer_demands;
  const activeDistance = simulatedDistance !== null ? simulatedDistance : (pool.average_cluster_distance_km || 2.5);

  // Recompute reactive values if simulator is active
  let currentPooled = basePooled;
  let currentTransport = baseTransport;

  if (simulatedDemands !== null || simulatedDistance !== null) {
    const unitW = basePooled.unit_weight_kg || 25.0;
    const cleanD = {};
    Object.entries(activeDemands).forEach(([k, v]) => {
      const num = parseFloat(v);
      if (num > 0) cleanD[k] = num;
    });
    const totQty = Object.values(cleanD).reduce((a, b) => a + b, 0);
    const totWeight = totQty * unitW;
    const moq = basePooled.supplier_moq;
    const isMet = totQty >= moq;
    const deficit = Math.max(0, moq - totQty);
    const retCount = Object.keys(cleanD).length;

    currentPooled = {
      ...basePooled,
      retailer_count: retCount,
      total_quantity: Math.round(totQty * 10) / 10,
      total_weight_kg: Math.round(totWeight * 10) / 10,
      moq_satisfied: isMet,
      moq_deficit: Math.round(deficit * 10) / 10,
      retailer_demands: cleanD
    };

    // Deterministic vehicle selection for simulated load
    let recVeh = 'Tata Ace / Bolero Maxi Truck (SCV)';
    let vehCap = 1000.0;
    let vehType = 'SCV';
    let vCount = 1;
    let tStatus = 'SUITABLE';

    if (totWeight <= 500) {
      recVeh = 'Piaggio Ape E-City / E-Loader';
      vehCap = 500.0;
      vehType = '3W_ELECTRIC';
    } else if (totWeight <= 1000) {
      recVeh = 'Tata Ace / Bolero Maxi Truck (SCV)';
      vehCap = 1000.0;
      vehType = 'SCV';
    } else if (totWeight <= 2500) {
      recVeh = 'Eicher Pro 2049 / Partner (MGV)';
      vehCap = 2500.0;
      vehType = 'MGV';
    } else if (totWeight <= 5000) {
      recVeh = 'Tata 407 / 14-ft Truck (HGV)';
      vehCap = 5000.0;
      vehType = 'HGV';
    } else {
      vCount = Math.ceil(totWeight / 5000.0);
      recVeh = `${vCount}x Tata 407 / 14-ft Truck (HGV)`;
      vehCap = vCount * 5000.0;
      vehType = 'HGV';
      tStatus = 'MULTI_VEHICLE_REQUIRED';
    }

    const utilPct = vehCap > 0 ? Math.round((totWeight / vehCap) * 100) : 0;
    const tripCost = Math.round(650 + (activeDistance * 22) + Math.max(0, retCount - 1) * 75);
    const indivCost = Math.round((350 + activeDistance * 15) * Math.max(1, retCount));
    const sav = Math.max(0, indivCost - tripCost);

    currentTransport = {
      ...baseTransport,
      total_load_kg: Math.round(totWeight * 10) / 10,
      total_quantity: Math.round(totQty * 10) / 10,
      recommended_vehicle: recVeh,
      vehicle_type: vehType,
      vehicle_capacity_kg: vehCap,
      capacity_utilization: Math.min(1.0, totWeight / vehCap),
      capacity_utilization_pct: utilPct,
      vehicles_required: vCount,
      estimated_distance_km: activeDistance,
      delivery_stops_count: retCount,
      estimated_total_cost_inr: tripCost,
      cost_per_retailer_inr: Math.round(tripCost / Math.max(1, retCount)),
      individual_transport_cost_inr: indivCost,
      transport_savings_inr: sav,
      transport_status: tStatus,
      reason: `Vehicle capacity is sufficient for the ${totWeight} kg simulated load (${utilPct}% utilization). Shared delivery across ${retCount} stores saves ₹${sav}.`
    };
  }

  // Helper for status badge styling
  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUITABLE':
        return {
          bg: theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
          text: 'Suitable'
        };
      case 'NEAR_CAPACITY':
        return {
          bg: theme === 'light' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-blue-500/10 text-blue-400 border-blue-500/30',
          text: 'Near Capacity (Optimal)'
        };
      case 'MULTI_VEHICLE_REQUIRED':
        return {
          bg: theme === 'light' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-amber-500/10 text-amber-400 border-amber-500/30',
          text: 'Multi-Vehicle Required'
        };
      case 'UNDERUTILIZED':
        return {
          bg: theme === 'light' ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-800 text-slate-300 border-slate-700',
          text: 'Underutilized'
        };
      default:
        return {
          bg: theme === 'light' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-rose-500/10 text-rose-400 border-rose-500/30',
          text: status
        };
    }
  };

  const statusStyle = getStatusBadge(currentTransport.transport_status);

  return (
    <div className="space-y-5">
      {/* ------------------------------------------------------------- */}
      {/* SECTION 1: POOLED INVENTORY */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-5 rounded-2xl border transition-all ${
        theme === 'light' 
          ? 'bg-slate-50/90 border-slate-200 shadow-sm' 
          : 'bg-[#0E1526]/80 border-slate-800'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-600 dark:text-accentPurple flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-purple-600 dark:text-accentPurple">
                Pooled Inventory Engine
              </span>
              <h3 className={`text-sm font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {currentPooled.product_name}
              </h3>
            </div>
          </div>

          {/* MOQ Status Badge */}
          {currentPooled.moq_satisfied ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-500" />
              MOQ Satisfied
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500" />
              MOQ Shortfall: {currentPooled.moq_deficit} {currentPooled.unit}
            </span>
          )}
        </div>

        {/* Inventory KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className={`text-[11px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Retailers In Group
            </span>
            <div className={`text-base font-extrabold mt-0.5 flex items-center ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            }`}>
              <Store className="w-3.5 h-3.5 mr-1 text-purple-500" />
              {currentPooled.retailer_count} Stores
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className={`text-[11px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Total Pooled Quantity
            </span>
            <div className="text-base font-extrabold text-blue-600 dark:text-accentBlue mt-0.5">
              {currentPooled.total_quantity} <span className="text-xs font-normal text-slate-400">{currentPooled.unit}</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className={`text-[11px] block ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
              Unit Weight
            </span>
            <div className={`text-base font-extrabold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {currentPooled.unit_weight_kg} <span className="text-xs font-normal text-slate-400">kg/{currentPooled.unit}</span>
            </div>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-emerald-950/20 border-emerald-500/20'
          }`}>
            <span className="text-[11px] block text-emerald-600 dark:text-emerald-400 font-semibold">
              Supplier Wholesale MOQ
            </span>
            <div className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
              {currentPooled.supplier_moq} <span className="text-xs font-normal">{currentPooled.unit}</span>
            </div>
          </div>
        </div>

        {/* Itemized Stores Demand Breakdown (if demands present) */}
        {Object.keys(currentPooled.retailer_demands || {}).length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800">
            <span className={`text-[10px] uppercase font-bold tracking-wider block mb-2 ${
              theme === 'light' ? 'text-slate-500' : 'text-slate-400'
            }`}>
              Itemized Store Demand & Weight Allocation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(currentPooled.retailer_demands).map(([retId, demand], idx) => {
                const storeName = pool.retailer_names && pool.retailer_names[idx] ? pool.retailer_names[idx] : `Retailer ${retId}`;
                const weightKg = Math.round(demand * (currentPooled.unit_weight_kg || 1) * 10) / 10;
                return (
                  <div key={retId} className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                    theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/40 border-slate-800/80'
                  }`}>
                    <div className="flex items-center space-x-2">
                      <span className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-600 dark:text-accentBlue flex items-center justify-center text-[10px] font-bold">
                        {idx + 1}
                      </span>
                      <span className={`font-semibold line-clamp-1 ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>
                        {storeName}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-600 dark:text-accentBlue">{demand} {currentPooled.unit}</span>
                      <span className="text-[10px] text-slate-400 block">({weightKg} kg)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SECTION 2: TRANSPORT RECOMMENDATION */}
      {/* ------------------------------------------------------------- */}
      <div className={`p-5 rounded-2xl border transition-all ${
        theme === 'light' 
          ? 'bg-blue-50/40 border-blue-200/80 shadow-sm' 
          : 'bg-[#0B1222]/90 border-blue-900/40'
      }`}>
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-blue-200/60 dark:border-blue-900/40">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <Truck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-accentBlue">
                Logistics & Fleet Optimization Engine
              </span>
              <h3 className={`text-base font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                {currentTransport.recommended_vehicle}
              </h3>
            </div>
          </div>

          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${statusStyle.bg}`}>
            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            {statusStyle.text}
          </span>
        </div>

        {/* Cargo Load & Vehicle Capacity Meter */}
        <div className="mt-4 p-4 rounded-xl border bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center font-semibold text-slate-500">
              <Scale className="w-3.5 h-3.5 mr-1 text-blue-500" />
              Total Pooled Load vs Vehicle Capacity
            </span>
            <span className={`font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              <strong className="text-blue-600 dark:text-accentBlue font-black text-sm">
                {currentTransport.total_load_kg.toLocaleString()} kg
              </strong> / {currentTransport.vehicle_capacity_kg.toLocaleString()} kg ({currentTransport.capacity_utilization_pct}%)
            </span>
          </div>

          {/* Color-Coded Utilization Bar */}
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                currentTransport.capacity_utilization_pct > 95
                  ? 'bg-rose-500'
                  : currentTransport.capacity_utilization_pct > 75
                  ? 'bg-blue-600'
                  : currentTransport.capacity_utilization_pct > 35
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
              style={{ width: `${Math.min(100, currentTransport.capacity_utilization_pct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>Vehicles Required: <strong className="text-slate-700 dark:text-slate-200 font-bold">{currentTransport.vehicles_required} unit(s)</strong></span>
            <span>Capacity Utilization: <strong className="text-slate-700 dark:text-slate-200 font-bold">{currentTransport.capacity_utilization_pct}%</strong></span>
          </div>
        </div>

        {/* Transport Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 block flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-blue-500" />
              Delivery Distance
            </span>
            <div className={`text-sm font-extrabold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              {currentTransport.estimated_distance_km} km
            </div>
            <span className="text-[10px] text-slate-400">Cluster Radius</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 block flex items-center">
              <Clock className="w-3 h-3 mr-1 text-purple-500" />
              Transit Time
            </span>
            <div className={`text-sm font-extrabold mt-0.5 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
              ~{currentTransport.estimated_transit_time_mins} mins
            </div>
            <span className="text-[10px] text-slate-400">{currentTransport.delivery_stops_count} drop-off stops</span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
          }`}>
            <span className="text-[11px] text-slate-400 block flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-emerald-500" />
              Total Pooled Cost
            </span>
            <div className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              ₹{currentTransport.estimated_total_cost_inr.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ₹{currentTransport.cost_per_retailer_inr}/store
            </span>
          </div>

          <div className={`p-3 rounded-xl border ${
            theme === 'light' ? 'bg-emerald-50/70 border-emerald-200' : 'bg-emerald-500/10 border-emerald-500/30'
          }`}>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 block font-semibold">
              Logistics Savings
            </span>
            <div className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400 mt-0.5">
              ₹{currentTransport.transport_savings_inr.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-300">
              vs individual trips
            </span>
          </div>
        </div>

        {/* Explainable Decision Narrative Box */}
        <div className={`mt-4 p-3.5 rounded-xl border flex items-start space-x-2.5 ${
          theme === 'light' ? 'bg-white/80 border-slate-200' : 'bg-slate-900/50 border-slate-800'
        }`}>
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300 block mb-0.5">
              Deterministic Evaluation Rationale:
            </span>
            <p className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
              {currentTransport.reason}
            </p>
          </div>
        </div>

        {/* Collapsible Alternative Fleet Comparison */}
        {currentTransport.alternative_options && currentTransport.alternative_options.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="text-xs font-semibold text-blue-600 dark:text-accentBlue flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <span>{showAlternatives ? 'Hide' : 'View'} Fleet Constraint Comparison ({currentTransport.alternative_options.length} options evaluated)</span>
              {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAlternatives && (
              <div className="mt-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead className={theme === 'light' ? 'bg-slate-100 text-slate-600' : 'bg-slate-900 text-slate-400'}>
                    <tr>
                      <th className="p-2.5">Vehicle Model</th>
                      <th className="p-2.5">Capacity</th>
                      <th className="p-2.5">Utilization</th>
                      <th className="p-2.5">Trip Cost</th>
                      <th className="p-2.5">Feasibility Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {currentTransport.alternative_options.map((alt) => (
                      <tr key={alt.vehicle_id} className={alt.is_feasible ? 'bg-emerald-500/5' : 'opacity-60'}>
                        <td className="p-2.5 font-semibold text-slate-800 dark:text-slate-200">{alt.vehicle_name}</td>
                        <td className="p-2.5">{alt.capacity_kg} kg</td>
                        <td className="p-2.5 font-bold">{alt.capacity_utilization_pct}%</td>
                        <td className="p-2.5">₹{alt.estimated_cost_inr}</td>
                        <td className="p-2.5">
                          {alt.is_feasible ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">✓ Feasible</span>
                          ) : (
                            <span className="text-rose-500 font-medium">{alt.rejection_reason || 'Infeasible'}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ----------------------------------------------------------- */}
        {/* INTERACTIVE WHAT-IF SCENARIO SIMULATOR (SIH JURY DEMO TOOL) */}
        {/* ----------------------------------------------------------- */}
        {interactive && (
          <div className="mt-4 pt-3 border-t border-blue-200/50 dark:border-blue-900/30">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer ${
                  showSimulator
                    ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                    : theme === 'light'
                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                    : 'bg-purple-500/10 text-accentPurple border-purple-500/30 hover:bg-purple-500/20'
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{showSimulator ? 'Close Live Jury Simulator' : '⚡ Test Dynamic Group Changes (Jury Test Mode)'}</span>
              </button>

              {simulatedDemands !== null && (
                <button
                  onClick={() => {
                    setSimulatedDemands(null);
                    setSimulatedDistance(null);
                  }}
                  className="text-xs text-rose-500 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset to Original Pool
                </button>
              )}
            </div>

            {showSimulator && (
              <div className={`mt-3 p-4 rounded-xl border space-y-3 ${
                theme === 'light' ? 'bg-white border-purple-200 shadow-sm' : 'bg-[#111827] border-purple-900/40'
              }`}>
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-purple-700 dark:text-accentPurple flex items-center">
                    <ShieldCheck className="w-4 h-4 mr-1.5" />
                    Real-Time Group Dynamic Recalculation
                  </h4>
                  <span className="text-[10px] text-slate-400">
                    Adjust store quantities or simulate store departure to watch transport adapt instantly
                  </span>
                </div>

                {/* Demand adjustment sliders */}
                <div className="space-y-2">
                  {Object.entries(activeDemands).map(([retId, demand], idx) => {
                    const storeName = pool.retailer_names && pool.retailer_names[idx] ? pool.retailer_names[idx] : `Retailer ${retId}`;
                    return (
                      <div key={retId} className="flex items-center justify-between text-xs gap-3">
                        <span className="w-44 truncate font-medium text-slate-700 dark:text-slate-300">
                          {storeName}
                        </span>
                        <input
                          type="range"
                          min="0"
                          max="80"
                          step="5"
                          value={demand}
                          onChange={(e) => {
                            const newD = { ...activeDemands, [retId]: parseFloat(e.target.value) };
                            setSimulatedDemands(newD);
                          }}
                          className="flex-1 accent-purple-600"
                        />
                        <span className="w-16 text-right font-mono font-bold text-blue-600 dark:text-accentBlue">
                          {demand} {currentPooled.unit}
                        </span>
                        <button
                          onClick={() => {
                            const newD = { ...activeDemands };
                            delete newD[retId];
                            setSimulatedDemands(newD);
                          }}
                          className="text-[10px] text-rose-500 hover:text-rose-700 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900 cursor-pointer"
                          title="Simulate retailer leaving pool"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Distance slider */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-3">
                  <span className="w-44 font-medium text-slate-700 dark:text-slate-300">
                    Simulate Delivery Distance:
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={activeDistance}
                    onChange={(e) => setSimulatedDistance(parseFloat(e.target.value))}
                    className="flex-1 accent-blue-600"
                  />
                  <span className="w-16 text-right font-mono font-bold text-purple-600 dark:text-accentPurple">
                    {activeDistance} km
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
