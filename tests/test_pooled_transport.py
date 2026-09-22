"""
Comprehensive Test Suite for Samooh Pooled Inventory & Transport Recommendation Engine.
Tests all 8 mandatory scenarios:
1. One retailer
2. Multiple retailers
3. MOQ satisfied
4. MOQ not satisfied
5. One vehicle sufficient
6. Multiple vehicles required
7. Missing/invalid quantity
8. Missing transport information (distance/weight fallback)
9. Dynamic recalculation when a retailer leaves or changes quantity
"""

import sys
import os

# Add repo root to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.transport import TransportPlanningEngine, transport_engine, PROTOTYPE_VEHICLE_FLEET


def test_1_one_retailer():
    """
    Scenario 1: Single participating retailer in the pool.
    Verify pooled quantity equals single retailer demand and vehicle is appropriately assigned.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_001",
        "name": "Sona Masoori Rice (25kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "min_wholesale_quantity": 10.0
    }
    demands = {"ret_001": 15.0}

    inv = engine.calculate_pooled_inventory(demands, product)
    assert inv["retailer_count"] == 1, f"Expected 1 retailer, got {inv['retailer_count']}"
    assert inv["total_quantity"] == 15.0, f"Expected 15.0 bags, got {inv['total_quantity']}"
    assert inv["total_weight_kg"] == 375.0, f"Expected 375.0 kg, got {inv['total_weight_kg']}"
    assert inv["moq_satisfied"] is True, "MOQ should be satisfied"

    trans = engine.recommend_transport(inv, delivery_distance_km=3.0, delivery_stops_count=1)
    assert trans["vehicles_required"] == 1, "Expected 1 vehicle required"
    assert trans["transport_status"] in ["SUITABLE", "NEAR_CAPACITY"], f"Unexpected status {trans['transport_status']}"
    assert trans["total_load_kg"] == 375.0
    # 375 kg fits in 3-Wheeler E-Loader (500kg capacity)
    assert "Piaggio Ape" in trans["recommended_vehicle"] or "Tata Ace" in trans["recommended_vehicle"]
    print("PASS: Scenario 1 - One retailer successfully verified.")


def test_2_multiple_retailers():
    """
    Scenario 2: Multiple retailers (5 stores) pooling demands.
    Verify sum of demands, individual weight allocation, and multi-drop transport cost.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_001",
        "name": "Sona Masoori Rice (25kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "min_wholesale_quantity": 40.0
    }
    # 5 stores: 12 + 10 + 11 + 9 + 8 = 50 bags (1,250 kg)
    demands = {
        "ret_001": 12.0,
        "ret_002": 10.0,
        "ret_003": 11.0,
        "ret_004": 9.0,
        "ret_005": 8.0
    }

    inv = engine.calculate_pooled_inventory(demands, product)
    assert inv["retailer_count"] == 5, f"Expected 5 retailers, got {inv['retailer_count']}"
    assert inv["total_quantity"] == 50.0, f"Expected 50.0 bags, got {inv['total_quantity']}"
    assert inv["total_weight_kg"] == 1250.0, f"Expected 1,250.0 kg, got {inv['total_weight_kg']}"
    assert len(inv["retailer_weights"]) == 5
    assert inv["retailer_weights"]["ret_001"] == 300.0  # 12 * 25

    trans = engine.recommend_transport(inv, delivery_distance_km=4.5, delivery_stops_count=5)
    assert trans["vehicles_required"] == 1
    assert trans["total_load_kg"] == 1250.0
    # 1,250 kg exceeds 1,000kg (Tata Ace) -> should pick Eicher Pro 2,500kg
    assert "Eicher Pro" in trans["recommended_vehicle"]
    assert trans["transport_savings_inr"] > 0, "Consolidated transport should yield savings"
    print("PASS: Scenario 2 - Multiple retailers successfully verified.")


def test_3_moq_satisfied():
    """
    Scenario 3: Pooled quantity satisfies supplier wholesale MOQ.
    Verify moq_satisfied == True and moq_deficit == 0.0.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_006",
        "name": "Freedom Sunflower Oil (15L Tin)",
        "unit_of_measure": "tin",
        "unit_weight_kg": 14.2,
        "min_wholesale_quantity": 30.0
    }
    # 35 tins > 30 MOQ
    demands = {"ret_001": 15.0, "ret_002": 20.0}

    inv = engine.calculate_pooled_inventory(demands, product)
    assert inv["moq_satisfied"] is True
    assert inv["moq_deficit"] == 0.0
    assert inv["total_quantity"] == 35.0
    print("PASS: Scenario 3 - MOQ satisfied successfully verified.")


def test_4_moq_not_satisfied():
    """
    Scenario 4: Pooled quantity is below supplier MOQ.
    Verify moq_satisfied == False, deficit is precisely calculated, and reason notes the shortfall.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_006",
        "name": "Freedom Sunflower Oil (15L Tin)",
        "unit_of_measure": "tin",
        "unit_weight_kg": 14.2,
        "min_wholesale_quantity": 40.0
    }
    # 25 tins < 40 MOQ -> shortfall = 15 tins
    demands = {"ret_001": 10.0, "ret_002": 15.0}

    inv = engine.calculate_pooled_inventory(demands, product)
    assert inv["moq_satisfied"] is False, "Expected MOQ not satisfied"
    assert inv["moq_deficit"] == 15.0, f"Expected deficit 15.0, got {inv['moq_deficit']}"

    trans = engine.recommend_transport(inv, delivery_distance_km=2.0, delivery_stops_count=2)
    assert "below supplier wholesale MOQ" in trans["reason"] or "MOQ" in trans["reason"]
    print("PASS: Scenario 4 - MOQ not satisfied successfully verified.")


def test_5_one_vehicle_sufficient():
    """
    Scenario 5: Single vehicle is sufficient for cargo load.
    Verify vehicles_required == 1, utilization calculated, and reasonable cost returned.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_010",
        "name": "Guntur Red Chilli Powder (5kg)",
        "unit_of_measure": "pack",
        "unit_weight_kg": 5.0,
        "min_wholesale_quantity": 20.0
    }
    # 150 packs * 5 kg = 750 kg load
    demands = {"ret_001": 50.0, "ret_002": 50.0, "ret_003": 50.0}

    inv = engine.calculate_pooled_inventory(demands, product)
    trans = engine.recommend_transport(inv, delivery_distance_km=5.0, delivery_stops_count=3)

    assert trans["vehicles_required"] == 1
    assert trans["total_load_kg"] == 750.0
    assert trans["capacity_utilization_pct"] == 75.0  # 750 / 1000 in Tata Ace
    assert "Tata Ace" in trans["recommended_vehicle"]
    assert trans["transport_status"] == "SUITABLE"
    print("PASS: Scenario 5 - One vehicle sufficient successfully verified.")


def test_6_multiple_vehicles_required():
    """
    Scenario 6: Extremely heavy collective cargo exceeding largest single truck (5,000 kg).
    Verify system handles multi-vehicle requirement without crashing,
    calculates required vehicle count, and sets status to MULTI_VEHICLE_REQUIRED.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_004",
        "name": "Wheat Whole Whole-grain (50kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": 50.0,
        "min_wholesale_quantity": 50.0
    }
    # 250 bags * 50 kg = 12,500 kg load (> 5,000 kg max truck)
    demands = {
        f"ret_{i:03d}": 25.0 for i in range(1, 11)
    }

    inv = engine.calculate_pooled_inventory(demands, product)
    assert inv["total_weight_kg"] == 12500.0

    trans = engine.recommend_transport(inv, delivery_distance_km=15.0, delivery_stops_count=10)
    assert trans["vehicles_required"] == 3, f"Expected 3 trucks for 12,500kg, got {trans['vehicles_required']}"
    assert trans["transport_status"] == "MULTI_VEHICLE_REQUIRED"
    assert "3x Tata 407" in trans["recommended_vehicle"]
    print("PASS: Scenario 6 - Multiple vehicles required successfully verified.")


def test_7_missing_and_invalid_quantities():
    """
    Scenario 7: Safe failure handling for missing, zero, negative, and invalid quantities.
    Verify non-positive entries are sanitized, non-crashing behavior, and zero load handled cleanly.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_001",
        "name": "Sona Masoori Rice (25kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "min_wholesale_quantity": 20.0
    }
    # Dirty input with negative, zero, None, string
    dirty_demands = {
        "ret_001": 15.0,
        "ret_002": -5.0,     # Invalid negative
        "ret_003": 0.0,      # Zero demand
        "ret_004": "invalid", # Non-numeric string
        "ret_005": 10.0
    }

    inv = engine.calculate_pooled_inventory(dirty_demands, product)
    assert inv["retailer_count"] == 2, f"Expected 2 valid retailers, got {inv['retailer_count']}"
    assert inv["total_quantity"] == 25.0, f"Expected 25.0 bags, got {inv['total_quantity']}"
    assert inv["total_weight_kg"] == 625.0

    # Test complete zero demands
    zero_inv = engine.calculate_pooled_inventory({"ret_001": 0.0, "ret_002": -10.0}, product)
    assert zero_inv["total_quantity"] == 0.0
    assert zero_inv["total_weight_kg"] == 0.0

    zero_trans = engine.recommend_transport(zero_inv)
    assert zero_trans["transport_status"] == "NO_CARGO"
    print("PASS: Scenario 7 - Missing and invalid quantities safely sanitized.")


def test_8_missing_transport_data_and_fallbacks():
    """
    Scenario 8: Product missing unit weight in catalog, and distance missing in request.
    Verify system applies fallback weight extraction/estimation and default distance without failure.
    """
    engine = TransportPlanningEngine()
    # Product with no unit_weight_kg, but name contains (25kg)
    product_with_name_weight = {
        "id": "prod_099",
        "name": "Basmati Heritage Rice (25kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": None,
        "min_wholesale_quantity": 10.0
    }
    demands = {"ret_001": 10.0}

    inv = engine.calculate_pooled_inventory(demands, product_with_name_weight)
    assert inv["unit_weight_kg"] == 25.0, "Should extract 25.0 kg from name"
    assert inv["total_weight_kg"] == 250.0

    # Product with zero weight and no parsable name
    product_no_weight = {
        "id": "prod_100",
        "name": "Generic Plastic Bucket",
        "unit_of_measure": "piece",
        "unit_weight_kg": None,
        "min_wholesale_quantity": 10.0
    }
    inv_fallback = engine.calculate_pooled_inventory(demands, product_no_weight)
    assert inv_fallback["is_weight_estimated"] is True
    assert inv_fallback["unit_weight_kg"] == 1.0  # Safe default 1.0 kg/piece

    # Delivery without distance specified
    trans_no_dist = engine.recommend_transport(inv_fallback, delivery_distance_km=None)
    assert trans_no_dist["estimated_distance_km"] > 0, "Default distance should be populated"
    print("PASS: Scenario 8 - Missing transport data and fallback handling successfully verified.")


def test_9_dynamic_group_recalculation():
    """
    Scenario 9: Group modification simulation.
    Store leaves group or demand is modified -> recalculation adapts transport plan dynamically.
    """
    engine = TransportPlanningEngine()
    product = {
        "id": "prod_001",
        "name": "Sona Masoori Rice (25kg)",
        "unit_of_measure": "bag",
        "unit_weight_kg": 25.0,
        "min_wholesale_quantity": 40.0
    }
    initial_demands = {
        "ret_001": 20.0,
        "ret_002": 20.0,
        "ret_003": 10.0
    }
    inv_1 = engine.calculate_pooled_inventory(initial_demands, product)
    assert inv_1["total_quantity"] == 50.0
    assert inv_1["total_weight_kg"] == 1250.0
    trans_1 = engine.recommend_transport(inv_1, delivery_distance_km=4.0)
    assert "Eicher Pro" in trans_1["recommended_vehicle"]

    # Store 3 leaves group (ret_003 removed) -> 40 bags = 1,000 kg
    updated_demands = {
        "ret_001": 20.0,
        "ret_002": 20.0
    }
    inv_2 = engine.calculate_pooled_inventory(updated_demands, product)
    assert inv_2["total_quantity"] == 40.0
    assert inv_2["total_weight_kg"] == 1000.0
    trans_2 = engine.recommend_transport(inv_2, delivery_distance_km=4.0)
    # 1,000 kg fits in Tata Ace
    assert "Tata Ace" in trans_2["recommended_vehicle"]
    assert trans_2["total_load_kg"] == 1000.0
    print("PASS: Scenario 9 - Dynamic group recalculation successfully verified.")


if __name__ == "__main__":
    print("==================================================================")
    print("Running Samooh Pooled Inventory & Transport Verification Test Suite")
    print("==================================================================")
    test_1_one_retailer()
    test_2_multiple_retailers()
    test_3_moq_satisfied()
    test_4_moq_not_satisfied()
    test_5_one_vehicle_sufficient()
    test_6_multiple_vehicles_required()
    test_7_missing_and_invalid_quantities()
    test_8_missing_transport_data_and_fallbacks()
    test_9_dynamic_group_recalculation()
    print("==================================================================")
    print("ALL 9 TEST SCENARIOS PASSED WITH ZERO ERRORS!")
    print("==================================================================")
