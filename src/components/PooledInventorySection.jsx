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
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function PooledInventorySection({ 
  pool, 
  interactive = true, 
  compact = false 
}) {
  const { theme } = useApp();
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

  // Handle local dynamic recalculation for simulator
  const activeDemands = simulatedDemands !== null ? simulatedDemands : basePooled.retailer_demands;
  const activeDistance = simulatedDistance !== null ? simulatedDistance : (pool.average_cluster_distance_km || 2.5);

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

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUITABLE':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          text: 'Suitable'
        };
      case 'NEAR_CAPACITY':
        return {
          bg: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600',
          text: 'Optimal Capacity'
        };
      case 'MULTI_VEHICLE_REQUIRED':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          text: 'Multi-Vehicle Required'
        };
      default:
        return {
          bg: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          text: status
        };
    }
  };

  const statusStyle = getStatusBadge(currentTransport.transport_status);

  return (
    <div className="space-y-4">
      {/* SECTION 1: POOLED INVENTORY */}
      <div className="p-4 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Package className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Pooled Demand
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentPooled.product_name}
              </h3>
            </div>
          </div>

          {/* MOQ Status Badge */}
          {currentPooled.moq_satisfied ? (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-700" />
              MOQ Satisfied
            </span>
          ) : (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800">
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-700" />
              MOQ Shortfall: {currentPooled.moq_deficit} {currentPooled.unit}
            </span>
          )}
        </div>

        {/* Inventory KPI Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block">
              Stores In Group
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 flex items-center">
              <Store className="w-3.5 h-3.5 mr-1 text-slate-400" />
              {currentPooled.retailer_count} Kiranas
            </div>
          </div>

          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block">
              Total Quantity
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {currentPooled.total_quantity} <span className="text-xs font-normal text-slate-400">{currentPooled.unit}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block">
              Unit Weight
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {currentPooled.unit_weight_kg} <span className="text-xs font-normal text-slate-400">kg/{currentPooled.unit}</span>
            </div>
          </div>

          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block">
              Wholesale MOQ
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {currentPooled.supplier_moq} <span className="text-xs font-normal text-slate-400">{currentPooled.unit}</span>
            </div>
          </div>
        </div>

        {/* Itemized Stores Demand Breakdown */}
        {Object.keys(currentPooled.retailer_demands || {}).length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Itemized Store Demand & Allocation
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(currentPooled.retailer_demands).map(([retId, demand], idx) => {
                const storeName = pool.retailer_names && pool.retailer_names[idx] ? pool.retailer_names[idx] : `Retailer ${retId}`;
                const weightKg = Math.round(demand * (currentPooled.unit_weight_kg || 1) * 10) / 10;
                return (
                  <div key={retId} className="p-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate pr-2">
                      {storeName}
                    </span>
                    <div className="text-right flex-shrink-0">
                      <span className="font-semibold text-slate-900 dark:text-white">{demand} {currentPooled.unit}</span>
                      <span className="text-[10px] text-slate-400 ml-1">({weightKg} kg)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* SECTION 2: TRANSPORT RECOMMENDATION */}
      <div className="p-4 rounded-lg border border-slate-200/90 dark:border-slate-700/80 bg-white dark:bg-slate-800 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center space-x-2">
            <Truck className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">
                Transport Planning
              </span>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {currentTransport.recommended_vehicle}
              </h3>
            </div>
          </div>

          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${statusStyle.bg}`}>
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {statusStyle.text}
          </span>
        </div>

        {/* Cargo Load & Vehicle Capacity Meter */}
        <div className="mt-3 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center font-medium text-slate-600 dark:text-slate-400">
              <Scale className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Pooled Load vs Vehicle Capacity
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {currentTransport.total_load_kg.toLocaleString()} kg / {currentTransport.vehicle_capacity_kg.toLocaleString()} kg ({currentTransport.capacity_utilization_pct}%)
            </span>
          </div>

          {/* Utilization Bar */}
          <div className="w-full h-2 rounded bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div 
              className="h-full rounded bg-emerald-800 transition-all duration-300"
              style={{ width: `${Math.min(100, currentTransport.capacity_utilization_pct)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>Vehicles: <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentTransport.vehicles_required} unit(s)</strong></span>
            <span>Capacity Used: <strong className="font-semibold text-slate-700 dark:text-slate-300">{currentTransport.capacity_utilization_pct}%</strong></span>
          </div>
        </div>

        {/* Transport Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3">
          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block flex items-center">
              <MapPin className="w-3 h-3 mr-1 text-slate-400" />
              Delivery Distance
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              {currentTransport.estimated_distance_km} km
            </div>
            <span className="text-[10px] text-slate-400">Hub Radius</span>
          </div>

          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block flex items-center">
              <Clock className="w-3 h-3 mr-1 text-slate-400" />
              Transit Time
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              ~{currentTransport.estimated_transit_time_mins} mins
            </div>
            <span className="text-[10px] text-slate-400">{currentTransport.delivery_stops_count} drop points</span>
          </div>

          <div className="p-2.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[11px] text-slate-500 block flex items-center">
              <DollarSign className="w-3 h-3 mr-1 text-slate-400" />
              Total Pooled Cost
            </span>
            <div className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
              ₹{currentTransport.estimated_total_cost_inr.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500">
              ₹{currentTransport.cost_per_retailer_inr}/store
            </span>
          </div>

          <div className="p-2.5 rounded-md border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-900/40">
            <span className="text-[11px] text-emerald-800 dark:text-emerald-400 block font-medium">
              Logistics Savings
            </span>
            <div className="text-sm font-bold text-emerald-900 dark:text-emerald-300 mt-0.5">
              ₹{currentTransport.transport_savings_inr.toLocaleString()}
            </div>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400">
              vs individual trips
            </span>
          </div>
        </div>

        {/* Explainable Decision Narrative Box */}
        <div className="mt-3 p-3 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/40 flex items-start space-x-2">
          <Info className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            {currentTransport.reason}
          </p>
        </div>

        {/* Collapsible Alternative Fleet Comparison */}
        {currentTransport.alternative_options && currentTransport.alternative_options.length > 0 && (
          <div className="mt-3">
            <button
              onClick={() => setShowAlternatives(!showAlternatives)}
              className="text-xs font-medium text-emerald-800 dark:text-emerald-400 flex items-center space-x-1 hover:underline cursor-pointer"
            >
              <span>{showAlternatives ? 'Hide' : 'View'} Fleet Constraint Comparison ({currentTransport.alternative_options.length} options evaluated)</span>
              {showAlternatives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showAlternatives && (
              <div className="mt-2 overflow-x-auto rounded-md border border-slate-200 dark:border-slate-700">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/50 text-[11px] font-semibold text-slate-500 uppercase">
                    <tr>
                      <th className="p-2.5">Vehicle Model</th>
                      <th className="p-2.5">Capacity</th>
                      <th className="p-2.5">Utilization</th>
                      <th className="p-2.5">Trip Cost</th>
                      <th className="p-2.5">Feasibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {currentTransport.alternative_options.map((alt) => (
                      <tr key={alt.vehicle_id} className={alt.is_feasible ? 'bg-emerald-50/30' : 'opacity-60'}>
                        <td className="p-2.5 font-medium text-slate-800 dark:text-slate-200">{alt.vehicle_name}</td>
                        <td className="p-2.5">{alt.capacity_kg} kg</td>
                        <td className="p-2.5 font-semibold">{alt.capacity_utilization_pct}%</td>
                        <td className="p-2.5">₹{alt.estimated_cost_inr}</td>
                        <td className="p-2.5">
                          {alt.is_feasible ? (
                            <span className="text-emerald-800 dark:text-emerald-400 font-medium">Feasible</span>
                          ) : (
                            <span className="text-rose-700 font-medium">{alt.rejection_reason || 'Infeasible'}</span>
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

        {/* WHAT-IF SCENARIO SIMULATOR */}
        {interactive && (
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setShowSimulator(!showSimulator)}
                className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center space-x-1.5 cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                <span>{showSimulator ? 'Close Live Simulator' : 'Simulate Group Dynamic Changes'}</span>
              </button>

              {simulatedDemands !== null && (
                <button
                  onClick={() => {
                    setSimulatedDemands(null);
                    setSimulatedDistance(null);
                  }}
                  className="text-xs text-rose-700 hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Reset to Original Pool
                </button>
              )}
            </div>

            {showSimulator && (
              <div className="mt-3 p-3.5 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    Real-Time Group Dynamic Recalculation
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Adjust store quantities or simulate store departure
                  </span>
                </div>

                {/* Demand adjustment sliders */}
                <div className="space-y-2">
                  {Object.entries(activeDemands).map(([retId, demand], idx) => {
                    const storeName = pool.retailer_names && pool.retailer_names[idx] ? pool.retailer_names[idx] : `Retailer ${retId}`;
                    return (
                      <div key={retId} className="flex items-center justify-between text-xs gap-3">
                        <span className="w-40 truncate font-medium text-slate-700 dark:text-slate-300">
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
                          className="flex-1 accent-emerald-800 h-1.5"
                        />
                        <span className="w-16 text-right font-medium text-slate-900 dark:text-white">
                          {demand} {currentPooled.unit}
                        </span>
                        <button
                          onClick={() => {
                            const newD = { ...activeDemands };
                            delete newD[retId];
                            setSimulatedDemands(newD);
                          }}
                          className="text-[11px] text-rose-700 hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Distance slider */}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs gap-3">
                  <span className="w-40 font-medium text-slate-700 dark:text-slate-300">
                    Simulate Delivery Distance:
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    step="1"
                    value={activeDistance}
                    onChange={(e) => setSimulatedDistance(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-800 h-1.5"
                  />
                  <span className="w-16 text-right font-semibold text-slate-900 dark:text-white">
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
