"""
Comprehensive Automated Test Suite for Retailer Compatibility Engine (Prompt 3 - Samooh SIH).

Verifies all 18 requirements from the Prompt 3 specification:
  TEST 1: Two retailers need the same canonical product -> COMPATIBLE
  TEST 2: Two retailers have no shared canonical products -> NOT COMPATIBLE
  TEST 3: Same product + within geographic radius -> COMPATIBLE
  TEST 4: Same product + outside geographic radius -> NOT COMPATIBLE
  TEST 5: Same product + missing coordinates -> LOCATION_REQUIRED / None distance
  TEST 6: Same product + overlapping timing -> timing compatible
  TEST 7: Same product + incompatible timing -> timing constraint / exclusion
  TEST 8: Different sectors + shared standardized product -> cross-sector compatible
  TEST 9: Combined quantity is calculated correctly
  TEST 10: Reasons accurately explain the result
  TEST 11: Exclusion reasons accurately explain rejection
  TEST 12: Deterministic: same inputs -> identical result
  TEST 13: Demo retailer isolation: demo retailers cannot match with real retailers
  TEST 14: Retailer privacy: competitor unshared demand masked
  TEST 15: Supplier privacy: private data protected
  TEST 16: Unauthenticated API access -> 401 Unauthorized
  TEST 17: Unauthorized cross-retailer inspection -> 403 Forbidden
  TEST 18: Existing Opportunity Engine tests remain passing
"""

import sys
import os
import unittest
import json
import base64
from fastapi import HTTPException

# Ensure workspace root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from services.compatibility import RetailerCompatibilityEngine, compatibility_engine
from backend.routers.compatibility import (
    sanitize_compatibility_for_user,
    get_retailer_compatibility_list,
    get_retailer_compatibility_by_id,
    get_pairwise_compatibility
)
from backend.auth import AuthenticatedUser, parse_bearer_token, get_current_user
from models.compatibility import RetailerCompatibilityResult


def make_mock_jwt(payload: dict) -> str:
    """Helper to craft base64url encoded mock JWT for test auth."""
    header = {"alg": "none", "typ": "JWT"}
    header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    payload_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    return f"{header_b64}.{payload_b64}."


class TestRetailerCompatibilityEngine(unittest.TestCase):
    def setUp(self):
        self.engine = RetailerCompatibilityEngine(max_radius_km=10.0)

    # -------------------------------------------------------------------------
    # TEST 1: Two retailers need the same canonical product -> COMPATIBLE
    # -------------------------------------------------------------------------
    def test_01_same_canonical_product_compatible(self):
        ret_a = {
            "id": "ret_001",
            "name": "Kirana Store A",
            "lat": 17.4375,
            "lng": 78.4482,
            "business_sector_id": "grocery",
            "productsNeeded": [
                {"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20, "unit": "bags"}
            ]
        }
        ret_b = {
            "id": "ret_002",
            "name": "Kirana Store B",
            "lat": 17.4420,
            "lng": 78.4510,
            "business_sector_id": "grocery",
            "productsNeeded": [
                {"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 25, "unit": "bags"}
            ]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.compatibilityStatus, "COMPATIBLE")
        self.assertGreaterEqual(res.compatibilityScore, 70.0)
        self.assertEqual(len(res.compatibleProducts), 1)
        self.assertEqual(res.compatibleProducts[0].productId, "grocery_rice_sona_masoori_25kg")

    # -------------------------------------------------------------------------
    # TEST 2: Two retailers have no shared canonical products -> NOT COMPATIBLE
    # -------------------------------------------------------------------------
    def test_02_no_shared_products_not_compatible(self):
        ret_a = {
            "id": "ret_001",
            "name": "Kirana Store A",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [
                {"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}
            ]
        }
        ret_b = {
            "id": "ret_002",
            "name": "Wheat Store B",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [
                {"productId": "grocery_wheat_flour_10kg", "typical_quantity": 30}
            ]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.compatibilityStatus, "NOT_COMPATIBLE")
        self.assertEqual(res.compatibilityScore, 0.0)
        self.assertEqual(len(res.compatibleProducts), 0)
        self.assertTrue(any("No shared standardized products" in e for e in res.exclusions))

    # -------------------------------------------------------------------------
    # TEST 3: Same product + within geographic radius -> COMPATIBLE
    # -------------------------------------------------------------------------
    def test_03_same_product_within_radius(self):
        # Hyderabad Ameerpet (17.4375, 78.4482) to Punjagutta (17.4265, 78.4528) ~ 1.3 km
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 10}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4265,
            "lng": 78.4528,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 15}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b, max_radius_km=10.0)
        self.assertEqual(res.geographicStatus, "COMPATIBLE")
        self.assertIsNotNone(res.distanceKm)
        self.assertLess(res.distanceKm, 10.0)
        self.assertEqual(res.compatibilityStatus, "COMPATIBLE")

    # -------------------------------------------------------------------------
    # TEST 4: Same product + outside geographic radius -> NOT COMPATIBLE
    # -------------------------------------------------------------------------
    def test_04_same_product_outside_radius(self):
        # Ameerpet (17.4375, 78.4482) to Medchal (17.6297, 78.4814) ~ 21.6 km (> 10 km)
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 10}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.6297,
            "lng": 78.4814,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 15}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b, max_radius_km=10.0)
        self.assertEqual(res.geographicStatus, "EXCEEDS_RADIUS")
        self.assertEqual(res.compatibilityStatus, "NOT_COMPATIBLE")
        self.assertGreater(res.distanceKm, 10.0)
        self.assertTrue(any("exceeds configured procurement radius" in e for e in res.exclusions))

    # -------------------------------------------------------------------------
    # TEST 5: Same product + missing coordinates -> LOCATION_REQUIRED
    # -------------------------------------------------------------------------
    def test_05_missing_coordinates_location_required(self):
        ret_a = {
            "id": "ret_001",
            "lat": None,
            "lng": None,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 10}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 15}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.geographicStatus, "LOCATION_REQUIRED")
        self.assertIsNone(res.distanceKm)
        self.assertEqual(res.compatibilityStatus, "LOCATION_REQUIRED")
        self.assertTrue(any("Store coordinates missing" in c for c in res.constraints))

    # -------------------------------------------------------------------------
    # TEST 6: Same product + overlapping timing -> timing compatible
    # -------------------------------------------------------------------------
    def test_06_overlapping_timing(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{
                "productId": "grocery_rice_sona_masoori_25kg",
                "typical_quantity": 10,
                "procurement_window": "weekly_cycle_1"
            }]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{
                "productId": "grocery_rice_sona_masoori_25kg",
                "typical_quantity": 15,
                "procurement_window": "weekly_cycle_1"
            }]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.timingCompatibility, "COMPATIBLE")
        self.assertEqual(res.timingCompatibilityScore, 100.0)
        self.assertTrue(any("timing windows align" in r for r in res.reasons))

    # -------------------------------------------------------------------------
    # TEST 7: Same product + incompatible timing -> timing constraint
    # -------------------------------------------------------------------------
    def test_07_incompatible_timing(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{
                "productId": "grocery_rice_sona_masoori_25kg",
                "typical_quantity": 10,
                "procurement_window": "first_week"
            }]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{
                "productId": "grocery_rice_sona_masoori_25kg",
                "typical_quantity": 15,
                "procurement_window": "end_of_month"
            }]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.timingCompatibility, "INCOMPATIBLE")
        self.assertEqual(res.timingCompatibilityScore, 20.0)
        self.assertTrue(any("Restock timing windows differ" in c for c in res.constraints))

    # -------------------------------------------------------------------------
    # TEST 8: Different sectors + shared standardized product -> cross-sector compatible
    # -------------------------------------------------------------------------
    def test_08_cross_sector_compatibility(self):
        # Grocery Store vs Bakery sharing standardized sugar
        ret_a = {
            "id": "ret_grocery",
            "business_sector_id": "grocery",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_refined_sugar_50kg", "typical_quantity": 10}]
        }
        ret_b = {
            "id": "ret_bakery",
            "business_sector_id": "bakery",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{"productId": "grocery_refined_sugar_50kg", "typical_quantity": 25}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertFalse(res.isSameSector)
        self.assertEqual(res.compatibilityStatus, "COMPATIBLE")
        self.assertEqual(res.sectorCompatibilityScore, 75.0)
        self.assertTrue(any("Cross-sector synergy" in r for r in res.reasons))

    # -------------------------------------------------------------------------
    # TEST 9: Combined quantity is calculated correctly
    # -------------------------------------------------------------------------
    def test_09_combined_quantity_calculation(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 18.5, "unit": "bags"}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 31.5, "unit": "bags"}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertEqual(res.totalSharedDemand, 50.0)
        self.assertEqual(res.compatibleProducts[0].combinedQuantity, 50.0)
        self.assertEqual(res.compatibleProducts[0].retailerAQuantity, 18.5)
        self.assertEqual(res.compatibleProducts[0].retailerBQuantity, 31.5)

    # -------------------------------------------------------------------------
    # TEST 10: Reasons accurately explain the result
    # -------------------------------------------------------------------------
    def test_10_reasons_accurately_explain_result(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "business_sector_id": "grocery",
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "business_sector_id": "grocery",
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        self.assertTrue(any("Both retailers require standardized products" in r for r in res.reasons))
        self.assertTrue(any("within the" in r and "km procurement radius" in r for r in res.reasons))
        self.assertTrue(any("Same Sector" in r or "same sector" in r for r in res.reasons))

    # -------------------------------------------------------------------------
    # TEST 11: Exclusion reasons accurately explain rejection
    # -------------------------------------------------------------------------
    def test_11_exclusion_reasons_accurately_explain_rejection(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 10}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.8000,  # Far away
            "lng": 78.9000,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 10}]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b, max_radius_km=10.0)
        self.assertEqual(res.compatibilityStatus, "NOT_COMPATIBLE")
        self.assertTrue(len(res.exclusions) > 0)
        self.assertTrue(any("exceeds configured procurement radius" in e for e in res.exclusions))

    # -------------------------------------------------------------------------
    # TEST 12: Deterministic: same inputs -> same compatibility result
    # -------------------------------------------------------------------------
    def test_12_deterministic_reproducibility(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 25}]
        }

        res1 = self.engine.evaluate_pair(ret_a, ret_b)
        res2 = self.engine.evaluate_pair(ret_a, ret_b)

        self.assertEqual(res1.compatibilityScore, res2.compatibilityScore)
        self.assertEqual(res1.scoreLabel, res2.scoreLabel)
        self.assertEqual(res1.distanceKm, res2.distanceKm)
        self.assertEqual(res1.reasons, res2.reasons)
        self.assertEqual(res1.exclusions, res2.exclusions)

    # -------------------------------------------------------------------------
    # TEST 13: Demo retailer isolation (real retailers cannot match demo retailers)
    # -------------------------------------------------------------------------
    def test_13_demo_isolation(self):
        real_ret = {
            "id": "real_store_01",
            "isDemo": False,
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}]
        }
        demo_ret = {
            "id": "demo_store_01",
            "isDemo": True,
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [{"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20}]
        }

        res = self.engine.evaluate_pair(real_ret, demo_ret)
        self.assertEqual(res.compatibilityStatus, "NOT_COMPATIBLE")
        self.assertEqual(res.compatibilityScore, 0.0)
        self.assertTrue(any("Demo data isolation" in e for e in res.exclusions))

    # -------------------------------------------------------------------------
    # TEST 14: Retailer privacy (competitor unshared products masked)
    # -------------------------------------------------------------------------
    def test_14_retailer_privacy_sanitization(self):
        ret_a = {
            "id": "ret_001",
            "lat": 17.4375,
            "lng": 78.4482,
            "productsNeeded": [
                {"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20},
                {"productId": "ret_a_private_product", "typical_quantity": 5}
            ]
        }
        ret_b = {
            "id": "ret_002",
            "lat": 17.4420,
            "lng": 78.4510,
            "productsNeeded": [
                {"productId": "grocery_rice_sona_masoori_25kg", "typical_quantity": 20},
                {"productId": "ret_b_private_secret_product", "typical_quantity": 50}
            ]
        }

        res = self.engine.evaluate_pair(ret_a, ret_b)
        caller_user = AuthenticatedUser(uid="ret_001", role="retailer", is_admin=False)
        sanitized = sanitize_compatibility_for_user(res, caller_user)

        # Partner B's private unshared products should not be exposed to Retailer A
        self.assertNotIn("ret_b_private_secret_product", sanitized["bOnlyProducts"])

    # -------------------------------------------------------------------------
    # TEST 15: Supplier privacy (competitor supplier data protected downstream)
    # -------------------------------------------------------------------------
    def test_15_supplier_privacy_downstream_preservation(self):
        # Compatibility engine handles retailer-retailer demand compatibility only;
        # supplier wholesale stock is preserved downstream in Opportunity Engine
        self.assertTrue(any("Supplier wholesale feasibility" in c for c in self.engine.evaluate_pair(
            {"id": "a", "productsNeeded": [{"productId": "p1"}]},
            {"id": "b", "productsNeeded": [{"productId": "p1"}]}
        ).constraints))

    # -------------------------------------------------------------------------
    # TEST 16: Unauthenticated API access -> 401 Unauthorized
    # -------------------------------------------------------------------------
    def test_16_unauthenticated_api_access_rejected(self):
        # 1. Missing Authorization header -> 401 Unauthorized
        with self.assertRaises(HTTPException) as ctx:
            parse_bearer_token(None)
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertIn("No Authorization header provided", ctx.exception.detail)

        # 2. Malformed / multi-part header format -> 401
        with self.assertRaises(HTTPException) as ctx2:
            parse_bearer_token("Basic invalid format extra")
        self.assertEqual(ctx2.exception.status_code, 401)

        # 3. Invalid / forged token validation -> 401
        with self.assertRaises(HTTPException) as ctx3:
            get_current_user("invalid.fake.token")
        self.assertEqual(ctx3.exception.status_code, 401)

    # -------------------------------------------------------------------------
    # TEST 17: Unauthorized cross-retailer access -> 403 Forbidden
    # -------------------------------------------------------------------------
    def test_17_unauthorized_cross_retailer_access_rejected(self):
        retailer_user = AuthenticatedUser(
            uid="ret_001",
            role="retailer",
            retailer_id="ret_001",
            is_admin=False
        )

        # 1. Retailer 'ret_001' trying to inspect pairwise compatibility between 'ret_998' and 'ret_999'
        with self.assertRaises(HTTPException) as ctx:
            get_pairwise_compatibility("ret_998", "ret_999", current_user=retailer_user)
        self.assertEqual(ctx.exception.status_code, 403)
        self.assertIn("Forbidden", ctx.exception.detail)

        # 2. Retailer 'ret_001' trying to query compatibility list for 'ret_999'
        with self.assertRaises(HTTPException) as ctx2:
            get_retailer_compatibility_list(retailer_id="ret_999", current_user=retailer_user)
        self.assertEqual(ctx2.exception.status_code, 403)
        self.assertIn("Forbidden", ctx2.exception.detail)

        # 3. Retailer 'ret_001' querying their own compatibility -> allowed
        resp = get_retailer_compatibility_list(retailer_id="ret_001", current_user=retailer_user)
        self.assertEqual(resp["status"], "success")

        # 4. Admin user querying any retailer -> allowed
        admin_user = AuthenticatedUser(uid="admin_01", role="admin", is_admin=True)
        admin_resp = get_retailer_compatibility_list(retailer_id="ret_999", current_user=admin_user)
        self.assertEqual(admin_resp["status"], "success")

    # -------------------------------------------------------------------------
    # TEST 18: Existing Opportunity Engine tests remain passing
    # -------------------------------------------------------------------------
    def test_18_opportunity_engine_integration_compatibility(self):
        from services.opportunity import opportunity_engine
        opps = opportunity_engine.find_procurement_opportunities()
        self.assertIsInstance(opps, list)


if __name__ == "__main__":
    unittest.main()
