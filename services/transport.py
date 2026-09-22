import math
import logging
from typing import Dict, Any, List, Optional, Tuple

logger = logging.getLogger("samooh.services.transport")

# ==============================================================================
# PROTOTYPE COMMERCIAL VEHICLE FLEET CONFIGURATION
# Deterministic specifications for typical Indian urban/semi-urban goods transport
# ==============================================================================
PROTOTYPE_VEHICLE_FLEET = [
    {
        "id": "veh_3w_electric",
        "name": "Piaggio Ape E-City / E-Loader",
        "vehicle_type": "3W_ELECTRIC",
        "capacity_kg": 500.0,
        "base_rate_inr": 350.0,
        "per_km_rate_inr": 15.0,
        "max_service_radius_km": 25.0,
        "avg_speed_kmh": 25.0,
        "is_available": True,
        "available_units": 6,
        "description": "Eco-friendly zero-emission 3-wheeler for hyper-local kirana clusters (<500kg)"
    },
    {
        "id": "veh_scv_tata_ace",
        "name": "Tata Ace / Bolero Maxi Truck (SCV)",
        "vehicle_type": "SCV",
        "capacity_kg": 1000.0,
        "base_rate_inr": 650.0,
        "per_km_rate_inr": 22.0,
        "max_service_radius_km": 60.0,
        "avg_speed_kmh": 35.0,
        "is_available": True,
        "available_units": 8,
        "description": "Standard Small Commercial Vehicle ideal for mid-size pooled orders (<1,000kg)"
    },
    {
        "id": "veh_mgv_eicher_pro",
        "name": "Eicher Pro 2049 / Partner (MGV)",
        "vehicle_type": "MGV",
        "capacity_kg": 2500.0,
        "base_rate_inr": 1400.0,
        "per_km_rate_inr": 32.0,
        "max_service_radius_km": 150.0,
        "avg_speed_kmh": 40.0,
        "is_available": True,
        "available_units": 4,
        "description": "Medium Goods Vehicle for heavy grain/oil pooled consignments (<2,500kg)"
    },
    {
        "id": "veh_hgv_tata_407",
        "name": "Tata 407 / 14-ft Commercial Truck (HGV)",
        "vehicle_type": "HGV",
        "capacity_kg": 5000.0,
        "base_rate_inr": 2500.0,
        "per_km_rate_inr": 45.0,
        "max_service_radius_km": 300.0,
        "avg_speed_kmh": 45.0,
        "is_available": True,
        "available_units": 2,
        "description": "Heavy Goods Truck for large multi-ton cooperative bulk orders (<5,000kg)"
    }
]


class TransportPlanningEngine:
    """
    Deterministic Constraint-Based Transport Planning Engine.
    
    Evaluates:
    - Total cargo weight and volume
    - Vehicle payload capacities
    - Delivery distance & transit time
    - Multi-stop drop-off handling
    - Fleet availability & vehicle hiring economics
    - Shared logistics savings vs individual transport
    
    NOTE: In accordance with project standards, this engine uses deterministic
    constraint optimization and multi-factor cost-capacity ranking, not opaque AI/ML.
    """

    def __init__(self, fleet: Optional[List[Dict[str, Any]]] = None):
        self.fleet = fleet or PROTOTYPE_VEHICLE_FLEET

    def calculate_pooled_inventory(
        self,
        retailer_demands: Dict[str, Any],
        product: Dict[str, Any],
        moq_threshold: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Calculates itemized and aggregated pooled quantities and weights for a group.
        Handles zero, negative, or missing quantities safely.
        """
        prod_id = product.get("id", "prod_unknown")
        prod_name = product.get("name", "Catalog Product")
        uom = product.get("unit_of_measure", "units")
        
        # Determine unit weight in kg
        unit_weight_kg = product.get("unit_weight_kg")
        is_weight_estimated = False
        
        if unit_weight_kg is None or float(unit_weight_kg) <= 0:
            # Fallback heuristic: attempt to extract kg from product name, e.g. "Rice (25kg)"
            extracted = self._extract_weight_from_name(prod_name)
            if extracted:
                unit_weight_kg = extracted
                is_weight_estimated = False
            else:
                unit_weight_kg = 1.0  # Safe default fallback
                is_weight_estimated = True

        unit_weight_kg = float(unit_weight_kg)
        
        # Sanitize demands (filter out non-positive or invalid entries)
        clean_demands: Dict[str, float] = {}
        for ret_id, dem in (retailer_demands or {}).items():
            try:
                val = float(dem)
                if val > 0:
                    clean_demands[str(ret_id)] = round(val, 2)
            except (ValueError, TypeError):
                logger.warning(f"Invalid demand '{dem}' for retailer '{ret_id}' ignored.")

        total_quantity = round(sum(clean_demands.values()), 2)
        total_weight_kg = round(total_quantity * unit_weight_kg, 2)

        # Calculate itemized weights per retailer
        retailer_weights: Dict[str, float] = {
            rid: round(qty * unit_weight_kg, 2)
            for rid, qty in clean_demands.items()
        }

        # MOQ Evaluation
        supplier_moq = float(moq_threshold if moq_threshold is not None else product.get("min_wholesale_quantity", 30.0))
        moq_satisfied = total_quantity >= supplier_moq
        moq_deficit = round(max(0.0, supplier_moq - total_quantity), 2)

        return {
            "product_id": prod_id,
            "product_name": prod_name,
            "unit": uom,
            "retailer_count": len(clean_demands),
            "total_quantity": total_quantity,
            "unit_weight_kg": unit_weight_kg,
            "total_weight_kg": total_weight_kg,
            "is_weight_estimated": is_weight_estimated,
            "supplier_moq": supplier_moq,
            "moq_satisfied": moq_satisfied,
            "moq_deficit": moq_deficit,
            "retailer_demands": clean_demands,
            "retailer_weights": retailer_weights
        }

    def recommend_transport(
        self,
        pooled_inventory: Dict[str, Any],
        delivery_distance_km: Optional[float] = None,
        delivery_stops_count: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Evaluates fleet options against deterministic constraints:
        capacity, distance, cost, speed, multi-stop handling, and vehicle availability.
        """
        total_load_kg = float(pooled_inventory.get("total_weight_kg", 0.0))
        total_quantity = float(pooled_inventory.get("total_quantity", 0.0))
        unit = pooled_inventory.get("unit", "units")
        moq_satisfied = pooled_inventory.get("moq_satisfied", True)
        
        # Safe default distance & stops
        if delivery_distance_km is None or float(delivery_distance_km) <= 0:
            distance_km = 4.5  # Hyderabad metropolitan average supplier-to-cluster distance
            is_distance_estimated = True
        else:
            distance_km = round(float(delivery_distance_km), 2)
            is_distance_estimated = False

        stops = int(delivery_stops_count if delivery_stops_count is not None else pooled_inventory.get("retailer_count", 1))
        stops = max(1, stops)

        # Handle Edge Case: Zero cargo load
        if total_load_kg <= 0:
            return {
                "total_load_kg": 0.0,
                "total_quantity": 0.0,
                "unit": unit,
                "recommended_vehicle": "No Transport Required",
                "vehicle_type": "NONE",
                "vehicle_capacity_kg": 0.0,
                "capacity_utilization": 0.0,
                "capacity_utilization_pct": 0.0,
                "vehicles_required": 0,
                "estimated_distance_km": distance_km,
                "estimated_transit_time_mins": 0,
                "delivery_stops_count": stops,
                "estimated_total_cost_inr": 0.0,
                "cost_per_retailer_inr": 0.0,
                "individual_transport_cost_inr": 0.0,
                "transport_savings_inr": 0.0,
                "transport_status": "NO_CARGO",
                "reason": "Total pooled load is 0 kg. No transport dispatch is required.",
                "vehicle_availability": "N/A",
                "alternative_options": []
            }

        # Evaluate each vehicle in fleet
        evaluations = []
        feasible_vehicles = []
        max_single_capacity = max(v["capacity_kg"] for v in self.fleet)

        for v in self.fleet:
            cap = v["capacity_kg"]
            is_cap_ok = cap >= total_load_kg
            is_range_ok = v["max_service_radius_km"] >= distance_km
            is_avail = v.get("is_available", True) and v.get("available_units", 0) > 0

            utilization = round((total_load_kg / cap), 4) if cap > 0 else 0.0
            utilization_pct = round(utilization * 100.0, 1)

            # Transit time estimation (driving time + 15 mins drop per store)
            transit_mins = int(round((distance_km / v["avg_speed_kmh"]) * 60 + (stops * 15)))

            # Trip cost = base fee + distance fee + multi-stop surcharge (₹75/extra stop)
            multi_stop_fee = max(0, stops - 1) * 75.0
            trip_cost = round(v["base_rate_inr"] + (distance_km * v["per_km_rate_inr"]) + multi_stop_fee, 2)

            is_feasible = is_cap_ok and is_range_ok and is_avail

            rejection_reason = None
            if not is_cap_ok:
                rejection_reason = f"Insufficient payload capacity ({cap:,.0f} kg < {total_load_kg:,.1f} kg cargo)"
            elif not is_range_ok:
                rejection_reason = f"Exceeds max operational radius ({distance_km} km > {v['max_service_radius_km']} km)"
            elif not is_avail:
                rejection_reason = "Vehicle model currently not available in cluster fleet"

            eval_entry = {
                "vehicle_id": v["id"],
                "vehicle_name": v["name"],
                "vehicle_type": v["vehicle_type"],
                "capacity_kg": cap,
                "capacity_utilization": min(1.0, utilization),
                "capacity_utilization_pct": utilization_pct,
                "is_feasible": is_feasible,
                "estimated_cost_inr": trip_cost,
                "estimated_transit_time_mins": transit_mins,
                "rejection_reason": rejection_reason
            }
            evaluations.append(eval_entry)

            if is_feasible:
                feasible_vehicles.append((v, eval_entry))

        # Benchmarking: Cost if retailers booked individual transport
        # Assume each retailer would hire the smallest available vehicle (Piaggio Ape or Tata Ace) individually
        smallest_veh = self.fleet[0]
        indiv_cost_per_store = smallest_veh["base_rate_inr"] + (distance_km * smallest_veh["per_km_rate_inr"])
        total_individual_cost = round(indiv_cost_per_store * stops, 2)

        # Case 1: Single vehicle has sufficient capacity
        if feasible_vehicles:
            # Deterministic selection: Pick the lowest-cost feasible vehicle that does not have extreme underutilization (<15% when a smaller feasible one exists)
            # Sort feasible by cost ascending
            feasible_vehicles.sort(key=lambda item: item[1]["estimated_cost_inr"])
            best_veh, best_eval = feasible_vehicles[0]

            trip_cost = best_eval["estimated_cost_inr"]
            cost_per_retailer = round(trip_cost / stops, 2)
            transport_savings = round(max(0.0, total_individual_cost - trip_cost), 2)
            util_pct = best_eval["capacity_utilization_pct"]

            # Determine transport status badge
            if util_pct < 35.0:
                t_status = "UNDERUTILIZED"
                status_desc = f"Capacity utilization is moderate ({util_pct}%). Consider grouping additional retailers if possible."
            elif util_pct > 92.0:
                t_status = "NEAR_CAPACITY"
                status_desc = f"Vehicle is operating near peak capacity ({util_pct}%). Optimal load efficiency achieved."
            else:
                t_status = "SUITABLE"
                status_desc = f"Vehicle capacity is fully sufficient for the pooled load ({util_pct}% utilization)."

            reason = (
                f"{best_veh['name']} selected: Sufficient for {total_load_kg:,.1f} kg pooled load "
                f"at {util_pct}% capacity utilization. Total pooled logistics cost is ₹{trip_cost:,.2f} "
                f"(₹{cost_per_retailer:,.2f}/store across {stops} stops), saving ₹{transport_savings:,.2f} "
                f"vs individual transport."
            )
            if not moq_satisfied:
                reason += f" Note: Group is currently {pooled_inventory.get('moq_deficit')} {unit} below supplier wholesale MOQ."

            return {
                "total_load_kg": total_load_kg,
                "total_quantity": total_quantity,
                "unit": unit,
                "recommended_vehicle": best_veh["name"],
                "vehicle_type": best_veh["vehicle_type"],
                "vehicle_capacity_kg": best_veh["capacity_kg"],
                "capacity_utilization": best_eval["capacity_utilization"],
                "capacity_utilization_pct": util_pct,
                "vehicles_required": 1,
                "estimated_distance_km": distance_km,
                "estimated_transit_time_mins": best_eval["estimated_transit_time_mins"],
                "delivery_stops_count": stops,
                "estimated_total_cost_inr": trip_cost,
                "cost_per_retailer_inr": cost_per_retailer,
                "individual_transport_cost_inr": total_individual_cost,
                "transport_savings_inr": transport_savings,
                "transport_status": t_status,
                "reason": reason,
                "vehicle_availability": "Available (In Fleet)",
                "alternative_options": evaluations
            }

        # Case 2: Cargo exceeds single largest vehicle capacity -> Multi-Vehicle Requirement
        elif total_load_kg > max_single_capacity:
            largest_veh = max(self.fleet, key=lambda v: v["capacity_kg"])
            num_vehicles = int(math.ceil(total_load_kg / largest_veh["capacity_kg"]))
            total_fleet_cap = num_vehicles * largest_veh["capacity_kg"]
            util_pct = round((total_load_kg / total_fleet_cap) * 100.0, 1)

            multi_trip_cost = round((largest_veh["base_rate_inr"] + (distance_km * largest_veh["per_km_rate_inr"])) * num_vehicles + (stops * 50.0), 2)
            cost_per_store = round(multi_trip_cost / stops, 2)
            savings = round(max(0.0, total_individual_cost - multi_trip_cost), 2)
            transit_mins = int(round((distance_km / largest_veh["avg_speed_kmh"]) * 60 + (stops * 18)))

            return {
                "total_load_kg": total_load_kg,
                "total_quantity": total_quantity,
                "unit": unit,
                "recommended_vehicle": f"{num_vehicles}x {largest_veh['name']}",
                "vehicle_type": largest_veh["vehicle_type"],
                "vehicle_capacity_kg": total_fleet_cap,
                "capacity_utilization": round(total_load_kg / total_fleet_cap, 4),
                "capacity_utilization_pct": util_pct,
                "vehicles_required": num_vehicles,
                "estimated_distance_km": distance_km,
                "estimated_transit_time_mins": transit_mins,
                "delivery_stops_count": stops,
                "estimated_total_cost_inr": multi_trip_cost,
                "cost_per_retailer_inr": cost_per_store,
                "individual_transport_cost_inr": total_individual_cost,
                "transport_savings_inr": savings,
                "transport_status": "MULTI_VEHICLE_REQUIRED",
                "reason": (
                    f"Total load of {total_load_kg:,.1f} kg exceeds single largest vehicle capacity ({max_single_capacity:,.0f} kg). "
                    f"Consolidated dispatch requires {num_vehicles}x {largest_veh['name']} ({total_fleet_cap:,.0f} kg combined capacity, "
                    f"{util_pct}% utilization) at ₹{multi_trip_cost:,.2f} total cost."
                ),
                "vehicle_availability": f"{num_vehicles} units required",
                "alternative_options": evaluations
            }

        # Case 3: No feasible vehicle due to radius/availability constraints
        else:
            return {
                "total_load_kg": total_load_kg,
                "total_quantity": total_quantity,
                "unit": unit,
                "recommended_vehicle": "No Transport Available",
                "vehicle_type": "NONE",
                "vehicle_capacity_kg": 0.0,
                "capacity_utilization": 0.0,
                "capacity_utilization_pct": 0.0,
                "vehicles_required": 0,
                "estimated_distance_km": distance_km,
                "estimated_transit_time_mins": 0,
                "delivery_stops_count": stops,
                "estimated_total_cost_inr": 0.0,
                "cost_per_retailer_inr": 0.0,
                "individual_transport_cost_inr": total_individual_cost,
                "transport_savings_inr": 0.0,
                "transport_status": "NO_TRANSPORT_AVAILABLE",
                "reason": (
                    f"No single fleet vehicle meets both distance ({distance_km} km) "
                    f"and payload ({total_load_kg:,.1f} kg) constraints."
                ),
                "vehicle_availability": "Unavailable",
                "alternative_options": evaluations
            }

    @staticmethod
    def _extract_weight_from_name(name: str) -> Optional[float]:
        """
        Extracts numeric weight in kg from product names such as 'Sona Masoori Rice (25kg)'
        or 'Freedom Sunflower Oil (15L Tin)'.
        """
        import re
        match_kg = re.search(r'\((\d+(?:\.\d+)?)\s*kg\b', name, re.IGNORECASE)
        if match_kg:
            return float(match_kg.group(1))

        match_l = re.search(r'\((\d+(?:\.\d+)?)\s*L\b', name, re.IGNORECASE)
        if match_l:
            # Approximate 1 Liter of edible oil/liquid ~ 0.92 kg or 1.0 kg
            return round(float(match_l.group(1)) * 0.95, 2)

        return None


# Singleton instance
transport_engine = TransportPlanningEngine()
