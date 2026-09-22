"""
Comprehensive Automated Test Suite for Samooh Supplier Portal.
Validates all 15 mandatory requirements:
1. Supplier registration / profile creation
2. Product creation with commercial fields
3. Product editing (prices, terms, availability)
4. Dynamic MOQ update and pool impact
5. Inventory update and stock level monitoring
6. Quantity-tier pricing calculation and discount resolution
7. MOQ validation (satisfied vs deficit)
8. Inventory insufficiency check (shortage calculation and acceptance prevention)
9. Multi-supplier feasibility filtering & selection explainability
10. Supplier order creation from pooled demand
11. Supplier order acceptance with warehouse stock decrement and snapshot freezing
12. Supplier order rejection with documented reason
13. Complete order status lifecycle transitions
14. Strict supplier data isolation (Supplier A cannot access or mutate Supplier B's records)
15. End-to-end integration with demand forecasting, pooling, and transport engine
"""

import sys
import os
import datetime

# Ensure project root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.repository import repo
from backend.database.seed_data import seed_demo_data
from services.supplier import supplier_service, SupplierService
from services.procurement import procurement_engine, ProcurementEngine
from services.recommendation import RecommendationEngine
from models.supplier import SupplierProfile, SupplierOrder, PricingTier


def setup_fresh_db():
    seed_demo_data()


# 1. Supplier Registration & Profile
def test_1_supplier_registration():
    setup_fresh_db()
    new_sup = {
        "id": "sup_test_01",
        "name": "Hyderabad Organic Mega Hub",
        "contact_person": "Praveen Kumar",
        "email": "praveen@organichub.in",
        "phone": "+91 99887 76655",
        "address": "Warehouse 8, Shameerpet Logistics Park",
        "categories": ["Grains", "Oils"],
        "service_radius_km": 55.0,
        "lead_time_days": 2,
        "rating": 4.9,
        "status": "ACTIVE"
    }
    repo.set_document("suppliers", new_sup["id"], new_sup)
    fetched = repo.get_by_id("suppliers", "sup_test_01")
    assert fetched is not None, "Supplier not saved"
    assert fetched["name"] == "Hyderabad Organic Mega Hub"
    assert fetched["email"] == "praveen@organichub.in"
    print("PASS: Scenario 1 - Supplier registration & profile successfully created.")


# 2. Product Creation with Commercial Fields
def test_2_product_creation():
    setup_fresh_db()
    new_prod = {
        "id": "prod_test_01",
        "name": "Organic Black Rice (10kg)",
        "category": "Grains",
        "unit_of_measure": "bag",
        "unit_weight_kg": 10.0,
        "retail_price": 2200.0,
        "wholesale_price": 1750.0,
        "min_wholesale_quantity": 20.0,
        "available_quantity": 400.0,
        "max_order_quantity": 800.0,
        "supplier_id": "sup_01",
        "supplier_name": "Deccan Wholesale Grains & Pulses",
        "service_radius_km": 60.0,
        "lead_time_days": 2,
        "discount_pct": 2.5,
        "is_available": True,
        "quantity_tiers": [
            {"min_quantity": 1.0, "max_quantity": 19.0, "price_per_unit": 1900.0},
            {"min_quantity": 20.0, "max_quantity": 49.0, "price_per_unit": 1750.0},
            {"min_quantity": 50.0, "max_quantity": None, "price_per_unit": 1650.0}
        ]
    }
    repo.set_document("products", new_prod["id"], new_prod)
    fetched = repo.get_by_id("products", "prod_test_01")
    assert fetched["name"] == "Organic Black Rice (10kg)"
    assert fetched["wholesale_price"] == 1750.0
    assert len(fetched["quantity_tiers"]) == 3
    print("PASS: Scenario 2 - Product creation with commercial fields successfully verified.")


# 3. Product Editing
def test_3_product_editing():
    setup_fresh_db()
    prod = repo.get_by_id("products", "prod_001")
    assert prod is not None
    # Supplier edits wholesale price, available quantity, and service radius
    prod["wholesale_price"] = 1150.0
    prod["available_quantity"] = 920.0
    prod["service_radius_km"] = 75.0
    repo.set_document("products", "prod_001", prod)

    updated = repo.get_by_id("products", "prod_001")
    assert updated["wholesale_price"] == 1150.0
    assert updated["available_quantity"] == 920.0
    assert updated["service_radius_km"] == 75.0
    print("PASS: Scenario 3 - Product editing successfully verified.")


# 4. Dynamic MOQ Update
def test_4_moq_update():
    setup_fresh_db()
    prod = repo.get_by_id("products", "prod_001")
    initial_moq = prod["min_wholesale_quantity"]
    assert initial_moq == 40.0

    # Supplier changes MOQ from 40 to 60
    prod["min_wholesale_quantity"] = 60.0
    repo.set_document("products", "prod_001", prod)

    updated = repo.get_by_id("products", "prod_001")
    assert updated["min_wholesale_quantity"] == 60.0

    # Verify procurement engine uses the updated MOQ dynamically
    eval_res = procurement_engine.evaluate_supplier_feasibility(
        product=updated,
        pooled_quantity=50.0,
        delivery_distance_km=10.0
    )
    # With pooled=50 and MOQ=60, candidate sup_01 must have MOQ deficit
    cand_01 = next(c for c in eval_res["evaluated_suppliers"] if c["supplier_id"] == "sup_01")
    assert cand_01["moq"] == 60.0
    assert any("MOQ not satisfied" in r for r in cand_01["rejection_reasons"])
    print("PASS: Scenario 4 - Dynamic MOQ update and pool impact successfully verified.")


# 5. Inventory Update
def test_5_inventory_update():
    setup_fresh_db()
    prod = repo.get_by_id("products", "prod_006")
    prod["available_quantity"] = 120.0
    repo.set_document("products", "prod_006", prod)

    metrics = supplier_service.get_supplier_dashboard_metrics("sup_02")
    assert metrics["total_products"] > 0
    # Freedom Sunflower Oil has MOQ 35, 120 units is low stock (< 35*1.5 = 52.5? No, 120 > 52.5)
    # Now set below MOQ (e.g. 20 units)
    prod["available_quantity"] = 20.0
    repo.set_document("products", "prod_006", prod)
    metrics_alert = supplier_service.get_supplier_dashboard_metrics("sup_02")
    alert_prod_ids = [a["product_id"] for a in metrics_alert["inventory_alerts"]]
    assert "prod_006" in alert_prod_ids, "Expected below-MOQ alert for prod_006"
    print("PASS: Scenario 5 - Inventory update and alert monitoring successfully verified.")


# 6. Quantity-Tier Pricing Calculation
def test_6_quantity_tier_pricing():
    tiers = [
        {"min_quantity": 1.0, "max_quantity": 99.0, "price_per_unit": 52.0},
        {"min_quantity": 100.0, "max_quantity": 199.0, "price_per_unit": 50.0},
        {"min_quantity": 200.0, "max_quantity": 499.0, "price_per_unit": 48.0},
        {"min_quantity": 500.0, "max_quantity": None, "price_per_unit": 45.0}
    ]

    # Test tier 1 (50 units)
    calc1 = supplier_service.calculate_tiered_price(tiers, quantity=50.0, base_wholesale_price=52.0)
    assert calc1["final_unit_price"] == 52.0
    assert calc1["final_order_value"] == 2600.0

    # Test tier 2 (150 units)
    calc2 = supplier_service.calculate_tiered_price(tiers, quantity=150.0, base_wholesale_price=52.0)
    assert calc2["final_unit_price"] == 50.0
    assert calc2["final_order_value"] == 7500.0

    # Test tier 3 (300 units with 5% discount)
    calc3 = supplier_service.calculate_tiered_price(tiers, quantity=300.0, discount_pct=5.0, base_wholesale_price=52.0)
    # Tier price is 48.0. 5% of 48 = 2.4. Final unit price = 45.6
    assert calc3["quantity_tier_price"] == 48.0
    assert calc3["additional_discount"] == 2.4
    assert calc3["final_unit_price"] == 45.6
    assert calc3["final_order_value"] == round(300.0 * 45.6, 2)
    assert calc3["discount_amount"] > 0
    print("PASS: Scenario 6 - Quantity-tier pricing & discount resolution successfully verified.")


# 7. MOQ Validation (Satisfied vs Deficit)
def test_7_moq_validation():
    # Satisfied
    v1 = supplier_service.validate_moq(supplier_moq=100.0, pooled_quantity=150.0)
    assert v1["moq_satisfied"] is True
    assert v1["moq_deficit"] == 0.0
    assert v1["status"] == "SATISFIED"

    # Deficit
    v2 = supplier_service.validate_moq(supplier_moq=200.0, pooled_quantity=140.0)
    assert v2["moq_satisfied"] is False
    assert v2["moq_deficit"] == 60.0
    assert v2["status"] == "DEFICIT"
    print("PASS: Scenario 7 - MOQ validation (satisfied & deficit) successfully verified.")


# 8. Inventory Insufficiency (Shortage Calculation & Blocking)
def test_8_inventory_shortage():
    # Available = 350, Requested = 500
    check = supplier_service.validate_inventory(available_quantity=350.0, requested_quantity=500.0)
    assert check["is_sufficient"] is False
    assert check["shortage"] == 150.0
    assert check["status"] == "INSUFFICIENT INVENTORY"

    # Attempt to accept order with insufficient inventory must raise ValueError
    setup_fresh_db()
    order = repo.get_by_id("supplierOrders", "sord_init_002")
    assert order["status"] == "PENDING"
    # Set product available inventory lower than requested 38 bags
    prod = repo.get_by_id("products", order["product_id"])
    prod["available_quantity"] = 25.0  # Needs 38
    repo.set_document("products", prod["id"], prod)

    try:
        supplier_service.transition_order_status(
            order_id="sord_init_002",
            supplier_id="sup_01",
            new_status="ACCEPTED"
        )
        assert False, "Should have thrown ValueError for insufficient inventory!"
    except ValueError as e:
        assert "INSUFFICIENT INVENTORY" in str(e)
        assert "Shortage: 13.0" in str(e)

    print("PASS: Scenario 8 - Inventory insufficiency & shortage blocking successfully verified.")


# 9. Multi-Supplier Feasibility Filtering & Explainability
def test_9_supplier_feasibility_filtering():
    setup_fresh_db()
    # Sona Masoori Rice is offered by both sup_01 (MOQ=40, Price=1180, Radius=60km, Inv=850)
    # and sup_05 (prod_021, MOQ=80, Price=1150, Radius=25km, Inv=350)
    rice_prod = repo.get_by_id("products", "prod_001")

    # Case A: Pooled quantity = 50 (sup_01 is feasible; sup_05 rejected because MOQ=80 > 50)
    eval_a = procurement_engine.evaluate_supplier_feasibility(
        product=rice_prod,
        pooled_quantity=50.0,
        delivery_distance_km=15.0
    )
    assert eval_a["selected_supplier_id"] == "sup_01"
    # Verify candidate sup_05 had rejection reason about MOQ
    sup_05_cand = next(c for c in eval_a["evaluated_suppliers"] if c["supplier_id"] == "sup_05")
    assert any("MOQ not satisfied" in r for r in sup_05_cand["rejection_reasons"])
    assert any("Lowest net procurement wholesale cost" in r for r in eval_a["selection_reasons"])

    # Case B: Pooled quantity = 100, Distance = 35km
    # sup_05 MOQ (80) is satisfied, but distance 35km > radius 25km! So sup_05 rejected on radius.
    eval_b = procurement_engine.evaluate_supplier_feasibility(
        product=rice_prod,
        pooled_quantity=100.0,
        delivery_distance_km=35.0
    )
    assert eval_b["selected_supplier_id"] == "sup_01"
    sup_05_b = next(c for c in eval_b["evaluated_suppliers"] if c["supplier_id"] == "sup_05")
    assert any("Outside delivery radius" in r for r in sup_05_b["rejection_reasons"])
    print("PASS: Scenario 9 - Multi-supplier feasibility filtering & explainability successfully verified.")


# 10. Supplier Order Creation from Pooled Demand
def test_10_supplier_order_creation():
    setup_fresh_db()
    clusters = [
        {
            "product_id": "prod_001",
            "retailer_ids": ["ret_001", "ret_002", "ret_003"],
            "retailer_demands": {"ret_001": 20.0, "ret_002": 15.0, "ret_003": 15.0},
            "average_distance_km": 3.2
        }
    ]
    pools = procurement_engine.create_procurement_pools(clusters)
    assert len(pools) == 1
    p = pools[0]
    assert p["supplier_id"] == "sup_01"
    assert p["total_demand"] == 50.0

    # Verify supplier order was created
    all_sorders = repo.get_all("supplierOrders")
    matching = [o for o in all_sorders if o.get("pool_id") == p["id"]]
    assert len(matching) == 1
    ord_obj = matching[0]
    assert ord_obj["supplier_id"] == "sup_01"
    assert ord_obj["pooled_quantity"] == 50.0
    assert ord_obj["status"] == "PENDING"
    print("PASS: Scenario 10 - Supplier order creation from pooled demand successfully verified.")


# 11. Supplier Order Acceptance with Stock Decrement and Term Freezing
def test_11_order_acceptance_and_snapshot():
    setup_fresh_db()
    # Prepare pending order
    order = repo.get_by_id("supplierOrders", "sord_init_002")
    assert order["status"] == "PENDING"
    prod_id = order["product_id"]
    initial_stock = repo.get_by_id("products", prod_id)["available_quantity"]

    accepted = supplier_service.transition_order_status(
        order_id="sord_init_002",
        supplier_id="sup_01",
        new_status="ACCEPTED"
    )
    assert accepted["status"] == "ACCEPTED"
    assert accepted["moq_at_acceptance"] == order["supplier_moq"]
    assert accepted["price_at_acceptance"] == order["final_unit_price"]
    assert accepted["accepted_at"] is not None

    # Stock decrement check
    new_stock = repo.get_by_id("products", prod_id)["available_quantity"]
    assert new_stock == initial_stock - order["pooled_quantity"], f"Stock not decremented properly: {initial_stock} -> {new_stock}"

    # Now if supplier changes product MOQ, the accepted order snapshot remains unchanged!
    prod = repo.get_by_id("products", prod_id)
    prod["min_wholesale_quantity"] = 150.0
    repo.set_document("products", prod_id, prod)

    order_rechecked = repo.get_by_id("supplierOrders", "sord_init_002")
    assert order_rechecked["moq_at_acceptance"] == 30.0, "Accepted MOQ snapshot was altered!"
    print("PASS: Scenario 11 - Order acceptance, inventory decrement, and snapshot freezing successfully verified.")


# 12. Supplier Rejection with Reason
def test_12_order_rejection():
    setup_fresh_db()
    rejected = supplier_service.transition_order_status(
        order_id="sord_init_002",
        supplier_id="sup_01",
        new_status="REJECTED",
        rejection_reason="Temporary warehouse maintenance; unable to fulfill."
    )
    assert rejected["status"] == "REJECTED"
    assert "Temporary warehouse maintenance" in rejected["rejection_reason"]
    assert any(t["status"] == "REJECTED" for t in rejected["timeline"])
    print("PASS: Scenario 12 - Supplier rejection with documented reason successfully verified.")


# 13. Order Lifecycle Status Transitions
def test_13_lifecycle_status_transitions():
    setup_fresh_db()
    # PENDING -> ACCEPTED -> PROCESSING -> READY_FOR_DISPATCH -> DISPATCHED -> DELIVERED
    oid = "sord_init_002"
    sup = "sup_01"

    o1 = supplier_service.transition_order_status(oid, sup, "ACCEPTED")
    assert o1["status"] == "ACCEPTED"

    o2 = supplier_service.transition_order_status(oid, sup, "PROCESSING")
    assert o2["status"] == "PROCESSING"

    o3 = supplier_service.transition_order_status(oid, sup, "READY_FOR_DISPATCH")
    assert o3["status"] == "READY_FOR_DISPATCH"

    o4 = supplier_service.transition_order_status(oid, sup, "DISPATCHED")
    assert o4["status"] == "DISPATCHED"

    o5 = supplier_service.transition_order_status(oid, sup, "DELIVERED")
    assert o5["status"] == "DELIVERED"
    assert len(o5["timeline"]) >= 5

    # Invalid jump (DELIVERED -> ACCEPTED) must fail
    try:
        supplier_service.transition_order_status(oid, sup, "ACCEPTED")
        assert False, "Should fail on invalid transition from DELIVERED"
    except ValueError:
        pass
    print("PASS: Scenario 13 - Complete order status lifecycle transitions successfully verified.")


# 14. Supplier Data Isolation
def test_14_supplier_data_isolation():
    setup_fresh_db()
    # sup_01 owns sord_init_001; sup_02 owns sord_init_003
    order_sup1 = repo.get_by_id("supplierOrders", "sord_init_001")
    assert order_sup1["supplier_id"] == "sup_01"

    # sup_02 attempts to mutate sup_01's order -> must raise PermissionError
    try:
        supplier_service.transition_order_status(
            order_id="sord_init_001",
            supplier_id="sup_02",  # Unauthorized!
            new_status="ACCEPTED"
        )
        assert False, "Should have raised PermissionError for cross-supplier mutation!"
    except PermissionError as e:
        assert "Access denied" in str(e)

    # Dashboard metrics isolation
    m1 = supplier_service.get_supplier_dashboard_metrics("sup_01")
    m2 = supplier_service.get_supplier_dashboard_metrics("sup_02")
    assert m1["supplier_id"] == "sup_01"
    assert m2["supplier_id"] == "sup_02"
    assert all(o["supplier_id"] == "sup_01" for o in m1["recent_orders"])
    assert all(o["supplier_id"] == "sup_02" for o in m2["recent_orders"])
    print("PASS: Scenario 14 - Strict supplier data isolation successfully verified.")


# 15. End-to-End Integration
def test_15_end_to_end_integration():
    setup_fresh_db()
    rec_engine = RecommendationEngine()
    recommendations = rec_engine.generate_recommendations()
    assert len(recommendations) > 0, "No recommendations generated"

    # Verify each recommendation has supplier_evaluation, pooled_inventory, and transport
    sample_rec = recommendations[0]
    assert "supplier_evaluation" in sample_rec, "Missing supplier_evaluation in recommendation"
    assert "pooled_inventory" in sample_rec, "Missing pooled_inventory"
    assert "transport" in sample_rec, "Missing transport recommendation"

    eval_data = sample_rec["supplier_evaluation"]
    assert eval_data is not None
    assert "selected_supplier_name" in eval_data
    assert len(eval_data["selection_reasons"]) > 0
    assert len(eval_data["evaluated_suppliers"]) > 0

    # Verify that corresponding supplier orders exist in database
    sorders = repo.get_all("supplierOrders")
    assert len(sorders) >= len(recommendations)
    print("PASS: Scenario 15 - End-to-end integration with demand forecasting, pooling, and transport engine successfully verified.")


def run_all_tests():
    print("==================================================================")
    print("Running Samooh Supplier Portal Comprehensive Verification Suite")
    print("==================================================================")
    test_1_supplier_registration()
    test_2_product_creation()
    test_3_product_editing()
    test_4_moq_update()
    test_5_inventory_update()
    test_6_quantity_tier_pricing()
    test_7_moq_validation()
    test_8_inventory_shortage()
    test_9_supplier_feasibility_filtering()
    test_10_supplier_order_creation()
    test_11_order_acceptance_and_snapshot()
    test_12_order_rejection()
    test_13_lifecycle_status_transitions()
    test_14_supplier_data_isolation()
    test_15_end_to_end_integration()
    print("==================================================================")
    print("ALL 15 SUPPLIER PORTAL TEST SCENARIOS PASSED WITH ZERO ERRORS!")
    print("==================================================================")


if __name__ == "__main__":
    run_all_tests()
