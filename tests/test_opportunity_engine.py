"""
Comprehensive Automated Verification Suite for Samooh Procurement Opportunity Engine (Upgrade #2).

Validates all 16 requirements specified in the prompt:
1. Same canonical product -> compatible
2. Different canonical product -> incompatible
3. Combined demand calculation
4. MOQ satisfied (FEASIBLE)
5. MOQ not satisfied (BELOW_MOQ + exact shortfall)
6. Supplier stock sufficient
7. Supplier stock insufficient (INSUFFICIENT_STOCK)
8. No matching supplier (NO_SUPPLIER)
9. Missing location (LOCATION_REQUIRED)
10. Existing pool detection (ALREADY_IN_POOL)
11. Duplicate opportunity prevention (deterministic hash key)
12. Legacy product compatibility (fallback to exact name / ID)
13. Deterministic opportunity score (non-ML weighted formula)
14. Structured explanation generation (reasons & constraints)
15. Demo/sample data isolation (isDemo flag)
16. Authorization & security behavior (Firestore rules)
"""

import sys
import os
import unittest

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.database.repository import repo
from backend.database.seed_data import seed_demo_data
from services.opportunity import ProcurementOpportunityEngine, opportunity_engine
from services.procurement import ProcurementEngine


class TestProcurementOpportunityEngine(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        seed_demo_data()
        cls.engine = ProcurementOpportunityEngine(max_cluster_radius_km=10.0)

    # 1. Same canonical product -> compatible
    def test_01_same_canonical_product_compatible(self):
        product_a = {
            "id": "p_01",
            "canonical_product_id": "grocery_rice_basmati",
            "name": "Basmati Rice (25kg)"
        }
        all_prods = [
            {"id": "p_sup_01", "canonical_product_id": "grocery_rice_basmati", "name": "Basmati Rice Grade A"},
            {"id": "p_sup_02", "canonical_product_id": "grocery_rice_sona_masuri", "name": "Sona Masoori Rice"}
        ]
        matched = self.engine.match_candidate_suppliers(product_a, all_prods, {})
        self.assertEqual(len(matched), 1)
        self.assertEqual(matched[0]["id"], "p_sup_01")

    # 2. Different canonical product -> incompatible
    def test_02_different_canonical_product_incompatible(self):
        product_basmati = {
            "id": "p_01",
            "canonical_product_id": "grocery_rice_basmati",
            "name": "Basmati Rice"
        }
        product_sona = {
            "id": "p_02",
            "canonical_product_id": "grocery_rice_sona_masuri",
            "name": "Sona Masoori Rice"
        }
        all_prods = [product_sona]
        matched = self.engine.match_candidate_suppliers(product_basmati, all_prods, {})
        self.assertEqual(len(matched), 0, "Different canonical products must NOT be matched together")

    # 3. Combined demand calculation
    def test_03_combined_demand_calculation(self):
        product = {
            "id": "prod_test",
            "canonical_product_id": "grocery_rice_basmati",
            "unit_of_measure": "kg"
        }
        retailers = [
            {
                "id": "ret_a",
                "procurement_profile": {
                    "products_needed": [{"productId": "grocery_rice_basmati", "typical_quantity": 300, "unit": "kg"}]
                }
            },
            {
                "id": "ret_b",
                "procurement_profile": {
                    "products_needed": [{"productId": "grocery_rice_basmati", "typical_quantity": 250, "unit": "kg"}]
                }
            },
            {
                "id": "ret_c",
                "procurement_profile": {
                    "products_needed": [{"productId": "grocery_rice_basmati", "typical_quantity": 200, "unit": "kg"}]
                }
            }
        ]
        demands, unit, is_valid = self.engine.calculate_combined_demand(product, retailers)
        self.assertTrue(is_valid)
        self.assertEqual(unit, "kg")
        self.assertEqual(sum(demands.values()), 750.0)

    # 4. MOQ satisfied (FEASIBLE)
    def test_04_moq_satisfied_feasible(self):
        product = {"id": "p1", "canonical_product_id": "grocery_rice_basmati", "name": "Basmati Rice"}
        demands = {"r1": 500.0, "r2": 300.0}  # total 800
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 500.0,
            "available_quantity": 1200.0,
            "wholesale_price": 75.0,
            "quantity_tiers": []
        }
        ret_map = {
            "r1": {"name": "R1", "latitude": 17.385, "longitude": 78.486},
            "r2": {"name": "R2", "latitude": 17.388, "longitude": 78.482}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1", "r2"],
            retailer_demands=demands,
            unit="kg",
            supplier_offering=supplier_offering,
            supplier_obj={"name": "ABC Wholesale"},
            retailer_map=ret_map,
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "FEASIBLE")
        self.assertEqual(opp["moqShortfall"], 0.0)

    # 5. MOQ not satisfied (BELOW_MOQ + shortfall)
    def test_05_moq_not_satisfied_below_moq(self):
        product = {"id": "p1", "canonical_product_id": "grocery_rice_basmati", "name": "Basmati Rice"}
        demands = {"r1": 200.0, "r2": 150.0}  # total 350
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 500.0,
            "available_quantity": 1000.0,
            "wholesale_price": 75.0,
            "quantity_tiers": []
        }
        ret_map = {
            "r1": {"name": "R1", "latitude": 17.385, "longitude": 78.486},
            "r2": {"name": "R2", "latitude": 17.388, "longitude": 78.482}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1", "r2"],
            retailer_demands=demands,
            unit="kg",
            supplier_offering=supplier_offering,
            supplier_obj={"name": "ABC Wholesale"},
            retailer_map=ret_map,
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "BELOW_MOQ")
        self.assertEqual(opp["moqShortfall"], 150.0)
        self.assertIn("Needs 150", opp["scoreLabel"])

    # 6. Supplier stock sufficient
    def test_06_supplier_stock_sufficient(self):
        product = {"id": "p1", "name": "Wheat Flour"}
        demands = {"r1": 100.0, "r2": 100.0}  # total 200
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 100.0,
            "available_quantity": 500.0,
            "wholesale_price": 40.0
        }
        ret_map = {
            "r1": {"latitude": 17.38, "longitude": 78.48},
            "r2": {"latitude": 17.39, "longitude": 78.49}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1", "r2"],
            retailer_demands=demands,
            unit="kg",
            supplier_offering=supplier_offering,
            supplier_obj={},
            retailer_map=ret_map,
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "FEASIBLE")

    # 7. Supplier stock insufficient (INSUFFICIENT_STOCK)
    def test_07_supplier_stock_insufficient(self):
        product = {"id": "p1", "name": "Wheat Flour"}
        demands = {"r1": 400.0, "r2": 400.0}  # total 800
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 500.0,
            "available_quantity": 400.0,  # stock less than 800
            "wholesale_price": 40.0
        }
        ret_map = {
            "r1": {"latitude": 17.38, "longitude": 78.48},
            "r2": {"latitude": 17.39, "longitude": 78.49}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1", "r2"],
            retailer_demands=demands,
            unit="kg",
            supplier_offering=supplier_offering,
            supplier_obj={},
            retailer_map=ret_map,
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "INSUFFICIENT_STOCK")
        self.assertEqual(opp["scoreLabel"], "Limited by supplier stock")

    # 8. No matching supplier (NO_SUPPLIER)
    def test_08_no_matching_supplier(self):
        product = {"id": "p_rare", "name": "Exotic Saffron Grade A"}
        demands = {"r1": 5.0}
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1"],
            retailer_demands=demands,
            unit="g",
            supplier_offering=None,
            supplier_obj=None,
            retailer_map={"r1": {"latitude": 17.38, "longitude": 78.48}},
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "NO_SUPPLIER")

    # 9. Missing location (LOCATION_REQUIRED)
    def test_09_missing_location_required(self):
        product = {"id": "p1", "name": "Basmati Rice"}
        demands = {"r1": 300.0, "r2": 300.0}
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 500.0,
            "available_quantity": 1000.0,
            "wholesale_price": 70.0
        }
        # r2 has no latitude or longitude
        ret_map = {
            "r1": {"latitude": 17.38, "longitude": 78.48},
            "r2": {"name": "No GPS Store"}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["r1", "r2"],
            retailer_demands=demands,
            unit="kg",
            supplier_offering=supplier_offering,
            supplier_obj={},
            retailer_map=ret_map,
            existing_pools=[]
        )
        self.assertEqual(opp["status"], "LOCATION_REQUIRED")
        self.assertEqual(opp["geographicFeasibility"], "LOCATION_REQUIRED")
        self.assertIsNone(opp["geographicDistanceKm"])

    # 10. Existing pool detection (ALREADY_IN_POOL)
    def test_10_existing_pool_detection(self):
        product = {"id": "prod_001", "name": "Sona Masoori Rice"}
        demands = {"ret_001": 25.0, "ret_002": 20.0}
        existing_pools = [
            {
                "id": "pool_active_99",
                "product_id": "prod_001",
                "retailer_ids": ["ret_001", "ret_002", "ret_003"]
            }
        ]
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 40.0,
            "available_quantity": 500.0,
            "wholesale_price": 1180.0
        }
        ret_map = {
            "ret_001": {"latitude": 17.38, "longitude": 78.48},
            "ret_002": {"latitude": 17.39, "longitude": 78.49}
        }
        opp = self.engine.evaluate_opportunity(
            product=product,
            retailer_ids=["ret_001", "ret_002"],
            retailer_demands=demands,
            unit="bag",
            supplier_offering=supplier_offering,
            supplier_obj={},
            retailer_map=ret_map,
            existing_pools=existing_pools
        )
        self.assertEqual(opp["status"], "ALREADY_IN_POOL")
        self.assertTrue(opp["isAlreadyInPool"])
        self.assertEqual(opp["existingPoolId"], "pool_active_99")

    # 11. Duplicate opportunity prevention (deterministic key)
    def test_11_duplicate_opportunity_prevention(self):
        product = {"id": "p1", "canonical_product_id": "grocery_rice_basmati", "name": "Basmati Rice"}
        demands = {"r1": 200.0, "r2": 300.0}
        supplier_offering = {
            "supplier_id": "sup_01",
            "min_wholesale_quantity": 400.0,
            "available_quantity": 1000.0,
            "wholesale_price": 75.0
        }
        ret_map = {
            "r1": {"latitude": 17.38, "longitude": 78.48},
            "r2": {"latitude": 17.39, "longitude": 78.49}
        }
        opp1 = self.engine.evaluate_opportunity(
            product=product, retailer_ids=["r1", "r2"], retailer_demands=demands,
            unit="kg", supplier_offering=supplier_offering, supplier_obj={},
            retailer_map=ret_map, existing_pools=[]
        )
        # Call again with different retailer ID ordering
        opp2 = self.engine.evaluate_opportunity(
            product=product, retailer_ids=["r2", "r1"], retailer_demands=demands,
            unit="kg", supplier_offering=supplier_offering, supplier_obj={},
            retailer_map=ret_map, existing_pools=[]
        )
        self.assertEqual(opp1["opportunityId"], opp2["opportunityId"])

    # 12. Legacy product compatibility
    def test_12_legacy_product_compatibility(self):
        # Product without canonical_product_id matches by exact name
        product_legacy = {"id": "prod_legacy_01", "name": "Guntur Red Chilli Powder (5kg)"}
        supplier_prods = [
            {"id": "p_sup_old", "name": "Guntur Red Chilli Powder (5kg)", "supplier_id": "sup_03"}
        ]
        matched = self.engine.match_candidate_suppliers(product_legacy, supplier_prods, {})
        self.assertEqual(len(matched), 1)
        self.assertEqual(matched[0]["id"], "p_sup_old")

    # 13. Deterministic opportunity score calculation
    def test_13_deterministic_opportunity_score(self):
        score, label = self.engine.calculate_opportunity_score(
            combined_quantity=100.0,
            supplier_moq=100.0,  # 100% MOQ -> 40 pts
            supplier_stock=200.0, # 100% stock -> 25 pts
            retailer_count=4,     # 4 stores -> 15 pts
            distance_km=0.0,      # 0 distance -> 10 pts
            estimated_unit_price=50.0, # valid price -> 10 pts
            status="FEASIBLE"
        )
        self.assertEqual(score, 100.0)
        self.assertEqual(label, "Feasible")

    # 14. Structured explanation generation
    def test_14_structured_explanation_generation(self):
        reasons, constraints = self.engine.build_opportunity_explanation(
            product_name="Basmati Rice",
            retailer_count=3,
            combined_quantity=850.0,
            unit="kg",
            supplier_name="Deccan Wholesale",
            supplier_moq=500.0,
            supplier_stock=1200.0,
            moq_shortfall=0.0,
            distance_km=4.5,
            status="FEASIBLE",
            is_already_in_pool=False,
            existing_pool_id=None
        )
        self.assertTrue(any("3 retailers require the same product" in r for r in reasons))
        self.assertTrue(any("Combined demand is 850 kg" in r for r in reasons))
        self.assertTrue(any("satisfies supplier MOQ" in r for r in reasons))
        self.assertTrue(any("Supplier MOQ: 500 kg" in c for c in constraints))

    # 15. Demo/sample data isolation
    def test_15_demo_sample_data_isolation(self):
        mock_data_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../src/api/mockData.js"))
        with open(mock_data_path, 'r', encoding='utf-8') as f:
            mock_content = f.read()
        self.assertIn("export const MOCK_OPPORTUNITIES", mock_content)
        self.assertIn("isDemo: true", mock_content)
        # Verify that all demo opportunities have isDemo: true
        opp_count = mock_content.count('opportunityId: "opp_demo_')
        demo_count = mock_content.count("isDemo: true")
        self.assertGreaterEqual(demo_count, opp_count, "All mock demo opportunities must have isDemo: true")

    # 16. Authorization / Firestore security
    def test_16_firestore_security_procurement_opportunities(self):
        rules_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "../firestore.rules"))
        with open(rules_path, 'r', encoding='utf-8') as f:
            rules_content = f.read()
        self.assertIn("match /procurementOpportunities/{oppId}", rules_content)
        self.assertIn("allow read: if isAuthenticated();", rules_content)
        self.assertIn("allow write: if false;", rules_content)

    # 17. Unauthenticated opportunity API request -> rejected
    def test_17_unauthenticated_api_request_rejected(self):
        from fastapi import HTTPException
        from backend.auth import parse_bearer_token, get_current_user

        # Missing header -> 401
        with self.assertRaises(HTTPException) as ctx:
            parse_bearer_token(None)
        self.assertEqual(ctx.exception.status_code, 401)

        # Malformed / invalid token -> 401
        with self.assertRaises(HTTPException) as ctx:
            get_current_user("invalid.fake.token")
        self.assertEqual(ctx.exception.status_code, 401)

    # 18. Authenticated authorized request -> allowed
    def test_18_authenticated_authorized_request_allowed(self):
        from backend.auth import get_current_user, AuthenticatedUser
        from backend.routers.opportunities import get_procurement_opportunities

        retailer_user = get_current_user("test_token_retailer_ret_001")
        self.assertEqual(retailer_user.uid, "ret_001")
        self.assertEqual(retailer_user.role, "retailer")
        self.assertFalse(retailer_user.is_admin)

        resp = get_procurement_opportunities(current_user=retailer_user)
        self.assertEqual(resp["status"], "success")
        self.assertIn("data", resp)

    # 19. Unauthorized recalculation -> rejected
    def test_19_unauthorized_recalculation_rejected(self):
        from fastapi import HTTPException
        from backend.auth import require_admin_or_system, AuthenticatedUser

        # Normal retailer attempting recalculation -> 403 Forbidden
        retailer_user = AuthenticatedUser(uid="ret_001", role="retailer", is_admin=False)
        with self.assertRaises(HTTPException) as ctx:
            require_admin_or_system(retailer_user)
        self.assertEqual(ctx.exception.status_code, 403)

        # Normal supplier attempting recalculation -> 403 Forbidden
        supplier_user = AuthenticatedUser(uid="sup_001", role="supplier", is_admin=False)
        with self.assertRaises(HTTPException) as ctx:
            require_admin_or_system(supplier_user)
        self.assertEqual(ctx.exception.status_code, 403)

    # 20. Authorized recalculation -> allowed
    def test_20_authorized_recalculation_allowed(self):
        from backend.auth import require_admin_or_system, AuthenticatedUser
        from backend.routers.opportunities import recalculate_procurement_opportunities

        admin_user = AuthenticatedUser(uid="admin_root", role="admin", is_admin=True)
        checked = require_admin_or_system(admin_user)
        self.assertEqual(checked.uid, "admin_root")
        self.assertTrue(checked.is_admin)

        resp = recalculate_procurement_opportunities(admin_user=admin_user)
        self.assertEqual(resp["status"], "success")
        self.assertIn("evaluated", resp["message"])

    # 21. Retailer cannot see competitor exact demand quantities
    def test_21_retailer_privacy_competitor_demands_masked(self):
        from backend.auth import sanitize_opportunity_for_user, AuthenticatedUser

        raw_opp = {
            "opportunityId": "opp_test_priv",
            "productName": "Basmati Rice",
            "combinedQuantity": 750.0,
            "retailerCount": 3,
            "unit": "kg",
            "retailerIds": ["ret_001", "ret_002", "ret_003"],
            "retailerDemands": {"ret_001": 250.0, "ret_002": 300.0, "ret_003": 200.0},
            "retailerNames": ["Store 1", "Store 2", "Store 3"],
            "supplierId": "sup_01",
            "supplierName": "Deccan Wholesale",
            "status": "FEASIBLE"
        }

        # Retailer A ("ret_001") views opportunity
        ret_a_user = AuthenticatedUser(uid="ret_001", role="retailer", is_admin=False)
        sanitized = sanitize_opportunity_for_user(raw_opp, ret_a_user)

        # Retailer A can see their own demand
        self.assertEqual(sanitized.get("myDemand"), 250.0)
        # Retailer A CANNOT see competitors' individual demands dictionary
        self.assertNotIn("retailerDemands", sanitized)
        # Retailer A CANNOT see competitor store names
        self.assertNotIn("retailerNames", sanitized)
        # Retailer A CAN see aggregated metrics
        self.assertEqual(sanitized["combinedQuantity"], 750.0)
        self.assertEqual(sanitized["retailerCount"], 3)

        # Unrelated Retailer X ("ret_999") views opportunity
        ret_x_user = AuthenticatedUser(uid="ret_999", role="retailer", is_admin=False)
        sanitized_x = sanitize_opportunity_for_user(raw_opp, ret_x_user)
        self.assertNotIn("retailerDemands", sanitized_x)
        self.assertNotIn("myDemand", sanitized_x)
        self.assertNotIn("retailerNames", sanitized_x)
        self.assertEqual(sanitized_x["combinedQuantity"], 750.0)
        self.assertEqual(sanitized_x["retailerCount"], 3)

    # 22. Supplier cannot see private retailer demand mapping
    def test_22_supplier_privacy_retailer_demands_stripped(self):
        from backend.auth import sanitize_opportunity_for_user, AuthenticatedUser

        raw_opp = {
            "opportunityId": "opp_test_sup_priv",
            "productName": "Basmati Rice",
            "combinedQuantity": 800.0,
            "retailerCount": 2,
            "unit": "kg",
            "retailerIds": ["ret_001", "ret_002"],
            "retailerDemands": {"ret_001": 400.0, "ret_002": 400.0},
            "retailerNames": ["Store 1", "Store 2"],
            "supplierId": "sup_candidate",
            "supplierName": "Candidate Supplier",
            "supplierAvailableQuantity": 1500.0,
            "status": "FEASIBLE"
        }

        # Candidate supplier views opportunity
        candidate_user = AuthenticatedUser(uid="sup_candidate", role="supplier", is_admin=False)
        sanitized_cand = sanitize_opportunity_for_user(raw_opp, candidate_user)

        # Retailer demand mapping is stripped from supplier
        self.assertNotIn("retailerDemands", sanitized_cand)
        self.assertNotIn("retailerNames", sanitized_cand)
        self.assertNotIn("retailerIds", sanitized_cand)
        # Candidate supplier sees their own available stock and aggregated pooled quantity
        self.assertEqual(sanitized_cand["combinedQuantity"], 800.0)
        self.assertEqual(sanitized_cand["supplierAvailableQuantity"], 1500.0)

        # Competing third-party supplier views opportunity
        other_supplier_user = AuthenticatedUser(uid="sup_other", role="supplier", is_admin=False)
        sanitized_other = sanitize_opportunity_for_user(raw_opp, other_supplier_user)
        # Competing supplier CANNOT see candidate supplier available stock
        self.assertIsNone(sanitized_other["supplierAvailableQuantity"])
        self.assertNotIn("retailerDemands", sanitized_other)

    # 23. Opportunity engine can still generate opportunities through trusted backend path
    def test_23_trusted_backend_opportunity_generation(self):
        from services.recommendation import RecommendationEngine
        rec = RecommendationEngine()
        rec.generate_recommendations()

        opps = opportunity_engine.find_procurement_opportunities()
        self.assertIsInstance(opps, list)
        self.assertGreater(len(opps), 0)
        # Stored in repository
        persisted = repo.get_all("procurementOpportunities")
        self.assertGreater(len(persisted), 0)

    # 24. Production mode + valid Firebase token -> accepted
    def test_24_production_mode_valid_token_accepted(self):
        import sys
        from unittest.mock import MagicMock
        from backend.config import settings
        from backend.auth import get_current_user

        orig_mock = settings.USE_MOCK_FIRESTORE
        orig_env = getattr(settings, "ENVIRONMENT", "development")
        try:
            settings.USE_MOCK_FIRESTORE = False
            settings.ENVIRONMENT = "production"

            mock_fb = MagicMock()
            mock_fb_auth = MagicMock()
            mock_fb.auth = mock_fb_auth
            mock_fb._apps = ["default"]
            mock_fb_auth.verify_id_token.return_value = {
                "uid": "verified_retailer_01",
                "role": "retailer",
                "email": "verified@samooh.in"
            }
            sys.modules["firebase_admin"] = mock_fb
            sys.modules["firebase_admin.auth"] = mock_fb_auth

            user = get_current_user("valid_firebase_token_abc")
            self.assertEqual(user.uid, "verified_retailer_01")
            self.assertEqual(user.role, "retailer")
            self.assertFalse(user.is_admin)
        finally:
            settings.USE_MOCK_FIRESTORE = orig_mock
            settings.ENVIRONMENT = orig_env

    # 25. Production mode + invalid Firebase token -> 401
    def test_25_production_mode_invalid_firebase_token_rejected(self):
        import sys
        from unittest.mock import MagicMock
        from fastapi import HTTPException
        from backend.config import settings
        from backend.auth import get_current_user

        orig_mock = settings.USE_MOCK_FIRESTORE
        orig_env = getattr(settings, "ENVIRONMENT", "development")
        try:
            settings.USE_MOCK_FIRESTORE = False
            settings.ENVIRONMENT = "production"

            mock_fb = MagicMock()
            mock_fb_auth = MagicMock()
            mock_fb.auth = mock_fb_auth
            mock_fb._apps = ["default"]
            mock_fb_auth.verify_id_token.side_effect = ValueError("Invalid signature")
            sys.modules["firebase_admin"] = mock_fb
            sys.modules["firebase_admin.auth"] = mock_fb_auth

            with self.assertRaises(HTTPException) as ctx:
                get_current_user("tampered_token_xyz")
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("Invalid token signature", ctx.exception.detail)
        finally:
            settings.USE_MOCK_FIRESTORE = orig_mock
            settings.ENVIRONMENT = orig_env

    # 26. Production mode + unsigned alg:none JWT -> 401
    def test_26_production_mode_unsigned_alg_none_jwt_rejected(self):
        from fastapi import HTTPException
        from backend.config import settings
        from backend.auth import get_current_user

        orig_mock = settings.USE_MOCK_FIRESTORE
        orig_env = getattr(settings, "ENVIRONMENT", "development")
        try:
            settings.USE_MOCK_FIRESTORE = False
            settings.ENVIRONMENT = "production"

            forged_token = "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJ1aWQiOiJhdHRhY2tlciIsInJvbGUiOiJhZG1pbiIsImFkbWluIjp0cnVlfQ."
            with self.assertRaises(HTTPException) as ctx:
                get_current_user(forged_token)
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("Invalid token signature", ctx.exception.detail)
        finally:
            settings.USE_MOCK_FIRESTORE = orig_mock
            settings.ENVIRONMENT = orig_env

    # 27. Production mode + forged admin JWT -> 401
    def test_27_production_mode_forged_admin_jwt_rejected(self):
        from fastapi import HTTPException
        from backend.config import settings
        from backend.auth import get_current_user

        orig_mock = settings.USE_MOCK_FIRESTORE
        orig_env = getattr(settings, "ENVIRONMENT", "development")
        try:
            settings.USE_MOCK_FIRESTORE = False
            settings.ENVIRONMENT = "production"

            forged_jwt = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiJhdHRhY2tlciIsInJvbGUiOiJhZG1pbiIsImFkbWluIjp0cnVlfQ.fake_signature_hash"
            with self.assertRaises(HTTPException) as ctx:
                get_current_user(forged_jwt)
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("Invalid token signature", ctx.exception.detail)
        finally:
            settings.USE_MOCK_FIRESTORE = orig_mock
            settings.ENVIRONMENT = orig_env

    # 28. Production mode + forged role=admin -> 401
    def test_28_production_mode_forged_role_admin_rejected(self):
        from fastapi import HTTPException
        from backend.config import settings
        from backend.auth import get_current_user

        orig_mock = settings.USE_MOCK_FIRESTORE
        orig_env = getattr(settings, "ENVIRONMENT", "development")
        try:
            settings.USE_MOCK_FIRESTORE = False
            settings.ENVIRONMENT = "production"

            forged_role = "eyJhbGciOiJub25lIn0.eyJ1aWQiOiJhdHRhY2tlciIsInJvbGUiOiJhZG1pbiJ9."
            with self.assertRaises(HTTPException) as ctx:
                get_current_user(forged_role)
            self.assertEqual(ctx.exception.status_code, 401)
            self.assertIn("Invalid token signature", ctx.exception.detail)
        finally:
            settings.USE_MOCK_FIRESTORE = orig_mock
            settings.ENVIRONMENT = orig_env


if __name__ == '__main__':
    unittest.main()
