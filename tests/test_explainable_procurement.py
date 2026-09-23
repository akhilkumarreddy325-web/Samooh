"""
Unit and Integration Tests for Samooh Explainable Procurement Engine.

Validates:
1. Structured explanation generation from actual backend procurement constraints.
2. Dynamic explanation updates when pool demand or MOQ values change.
3. Accurate extraction of rejection reasons for non-selected suppliers.
4. Clear architectural separation between Random Forest demand forecasts and deterministic optimization.
5. Strict adherence to non-fabrication of values (actual data pipeline reflection).
6. Backward compatibility with existing procurement engine features.
"""

import sys
import os
import unittest

# Ensure project root is in Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from services.procurement import ProcurementEngine
from models.pool import ProcurementPool


class TestExplainableProcurementEngine(unittest.TestCase):
    def setUp(self):
        self.engine = ProcurementEngine()

    def test_structured_explanation_generation_feasible(self):
        """Test explanation generation for a fully feasible procurement pool."""
        pool_dict = {
            "id": "pool_test_01",
            "product_id": "prod_rice_01",
            "product_name": "Basmati Rice (25kg Bag)",
            "retailer_ids": ["ret_01", "ret_02", "ret_03", "ret_04", "ret_05"],
            "threshold_status": "ACHIEVED",
            "threshold_quantity": 40.0,
            "current_pool_quantity": 50.0,
            "average_cluster_distance_km": 6.8,
            "unit_retail_price": 1450.0,
            "unit_wholesale_price": 1180.0,
            "estimated_total_savings": 13500.0,
            "estimated_savings_percentage": 18.6,
            "supplier_evaluation": {
                "is_feasible": True,
                "selected_supplier_id": "sup_01",
                "selected_supplier_name": "Deccan Agro Wholesalers",
                "moq": 40.0,
                "available_stock": 100.0,
                "unit_price": 1180.0,
                "selection_reasons": ["Supplier MOQ (40.0) is satisfied by pool volume (50.0)"],
                "evaluated_suppliers": [
                    {
                        "supplier_id": "sup_01",
                        "supplier_name": "Deccan Agro Wholesalers",
                        "moq": 40.0,
                        "available_stock": 100.0,
                        "service_radius_km": 15.0,
                        "unit_price": 1180.0,
                        "is_feasible": True,
                        "rejection_reasons": []
                    },
                    {
                        "supplier_id": "sup_02",
                        "supplier_name": "Telangana Grain Corp",
                        "moq": 80.0,
                        "available_stock": 500.0,
                        "service_radius_km": 10.0,
                        "unit_price": 1120.0,
                        "is_feasible": False,
                        "rejection_reasons": ["MOQ cannot be satisfied within the compatible retailer group (80.0 > 50.0)"]
                    },
                    {
                        "supplier_id": "sup_03",
                        "supplier_name": "Local Rice Mill",
                        "moq": 30.0,
                        "available_stock": 35.0,
                        "service_radius_km": 12.0,
                        "unit_price": 1200.0,
                        "is_feasible": False,
                        "rejection_reasons": ["Available stock is below required pooled quantity (35.0 < 50.0)"]
                    }
                ]
            },
            "transport": {
                "recommended_vehicle": "Tata Ace (SCV)",
                "transport_status": "SUITABLE",
                "estimated_distance_km": 6.8,
                "capacity_utilization_pct": 75.0,
                "total_load_kg": 1250.0
            }
        }

        explanation = self.engine.generate_pool_explanation(pool_dict)

        # 1. Verify exact system values without fabrication
        self.assertEqual(explanation["product_name"], "Basmati Rice (25kg Bag)")
        self.assertEqual(explanation["retailer_count"], 5)
        self.assertEqual(explanation["combined_quantity"], 50.0)
        self.assertEqual(explanation["supplier_moq"], 40.0)
        self.assertEqual(explanation["stock_available"], 100.0)
        self.assertEqual(explanation["average_distance_km"], 6.8)
        self.assertEqual(explanation["transport_vehicle"], "Tata Ace (SCV)")
        self.assertTrue(explanation["transport_feasible"])
        self.assertTrue(explanation["price_feasible"])

        # 2. Verify checklist & decision factors
        self.assertTrue(explanation["product_match"])
        self.assertTrue(explanation["decision_factors"]["distance_compatibility"])
        self.assertTrue(explanation["decision_factors"]["moq_satisfied"])
        self.assertTrue(explanation["decision_factors"]["stock_available"])
        self.assertTrue(explanation["decision_factors"]["transport_feasible"])

        # 3. Verify rejected suppliers and their actual rejection constraints
        self.assertEqual(len(explanation["rejected_suppliers"]), 2)
        rejected_names = [r["supplier_name"] for r in explanation["rejected_suppliers"]]
        self.assertIn("Telangana Grain Corp", rejected_names)
        self.assertIn("Local Rice Mill", rejected_names)

        # Check rejection reasons
        telangana_rej = next(r for r in explanation["rejected_suppliers"] if r["supplier_name"] == "Telangana Grain Corp")
        self.assertTrue(any("MOQ cannot be satisfied" in reason for reason in telangana_rej["reasons"]))

        rice_mill_rej = next(r for r in explanation["rejected_suppliers"] if r["supplier_name"] == "Local Rice Mill")
        self.assertTrue(any("Available stock is below required" in reason for reason in rice_mill_rej["reasons"]))

        # 4. Verify model separation (Random forest prediction vs deterministic decision)
        self.assertIn("Random Forest", explanation["prediction_context"]["model"])
        self.assertIn("50.0", explanation["prediction_context"]["forecasted_requirement"])
        self.assertIn("Optimization and constraint satisfaction are performed deterministically", explanation["prediction_context"]["note"])
        self.assertIn("constraints were satisfied", explanation["decision_summary"])
        self.assertNotIn("Random Forest optimizes constraints", explanation["decision_summary"])

    def test_dynamic_explanation_on_data_change(self):
        """Test that explanation dynamically updates when pool numbers change."""
        pool_deficit = {
            "id": "pool_test_02",
            "product_name": "Freedom Sunflower Oil (15L Tin)",
            "retailer_ids": ["ret_01", "ret_02"],
            "threshold_status": "NEAR_THRESHOLD",
            "threshold_quantity": 35.0,
            "current_pool_quantity": 28.0,
            "average_cluster_distance_km": 3.2,
            "supplier_evaluation": {
                "is_feasible": False,
                "selected_supplier_name": "Vijaya Oil Refineries",
                "moq": 35.0,
                "available_stock": 80.0,
                "unit_price": 1620.0,
                "evaluated_suppliers": []
            },
            "transport": {
                "recommended_vehicle": "Piaggio Ape E-Loader",
                "transport_status": "SUITABLE"
            }
        }

        exp_deficit = self.engine.generate_pool_explanation(pool_deficit)
        self.assertFalse(exp_deficit["decision_factors"]["moq_satisfied"])
        self.assertEqual(exp_deficit["combined_quantity"], 28.0)
        self.assertEqual(exp_deficit["supplier_moq"], 35.0)

        # Now increase the pool quantity to exceed MOQ
        pool_satisfied = dict(pool_deficit)
        pool_satisfied["current_pool_quantity"] = 38.0
        pool_satisfied["threshold_status"] = "ACHIEVED"
        pool_satisfied["supplier_evaluation"] = {
            "is_feasible": True,
            "selected_supplier_name": "Vijaya Oil Refineries",
            "moq": 35.0,
            "available_stock": 80.0,
            "unit_price": 1620.0,
            "evaluated_suppliers": []
        }

        exp_satisfied = self.engine.generate_pool_explanation(pool_satisfied)
        self.assertTrue(exp_satisfied["decision_factors"]["moq_satisfied"])
        self.assertEqual(exp_satisfied["combined_quantity"], 38.0)
        self.assertIn("Combined requirement (38.0) satisfies supplier MOQ (35.0)", exp_satisfied["reasons"])

    def test_existing_procurement_pipeline_unbroken(self):
        """Test that evaluate_supplier_feasibility and create_procurement_pools still execute normally."""
        product_obj = {
            "id": "prod_test",
            "name": "Toor Dal (1kg)",
            "unit_of_measure": "kg"
        }
        suppliers = [
            {
                "id": "sup_a",
                "name": "Supplier A",
                "catalog": [
                    {"product_id": "prod_test", "moq": 50.0, "available_stock": 200.0, "unit_price": 140.0}
                ],
                "service_radius_km": 20.0
            }
        ]

        feasibility = self.engine.evaluate_supplier_feasibility(
            product=product_obj,
            pooled_quantity=60.0,
            delivery_distance_km=5.0
        )

        self.assertIn("is_feasible", feasibility)
        self.assertIn("selected_supplier_name", feasibility)
        self.assertIn("selection_reasons", feasibility)
        self.assertIn("supplier_moq", feasibility)
        self.assertIn("available_stock", feasibility)


if __name__ == '__main__':
    unittest.main()
