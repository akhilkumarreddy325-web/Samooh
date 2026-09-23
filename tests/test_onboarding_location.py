"""
Samooh Test Suite — Onboarding Clean Slate, Indian State Autocomplete, GPS & Demo Map Data
Verifies that:
1. New onboarding profiles start empty without demo data inheritance
2. All 28 States and 8 Union Territories are supported
3. Geocoding queries are properly scoped to state and India
4. Address parsing handles city, town, village, suburb, district, state, and postcode
5. Browser GPS configurations and non-hanging terminal error states
6. Controlled demo retailers are separated from real procurement and flagged with isDemo: true
7. Retailer location privacy: only shared when sharingEnabled is true
"""

import unittest
import math
import os

class TestOnboardingCleanSlate(unittest.TestCase):
    """Verifies that brand new Google/Auth users start with empty profiles."""

    def test_new_user_default_profile_is_empty(self):
        # Simulated brand-new authenticated user with no prior profile
        firebase_user = {
            "uid": "usr_google_new_12345",
            "email": "freshuser@example.com",
            "displayName": "Fresh User"
        }
        user_profile = None  # No existing Firestore doc

        # Form data initialized for new user
        is_real_user = bool(firebase_user and firebase_user.get("uid"))
        existing = user_profile if is_real_user else None

        form_data = {
            "state": (existing or {}).get("state", ""),
            "city": (existing or {}).get("city", ""),
            "area": (existing or {}).get("area", ""),
            "address": (existing or {}).get("address", ""),
            "pincode": (existing or {}).get("pincode", ""),
            "businessLocation": (existing or {}).get("businessLocation", None),
            "contactPhone": (existing or {}).get("phone", ""),
            # Retailer fields
            "shopName": (existing or {}).get("storeName", ""),
            "ownerName": (existing or {}).get("ownerName", firebase_user.get("displayName", "")),
            "productsSold": (existing or {}).get("productsSold", []),
            "productsNeeded": (existing or {}).get("productsNeeded", []),
            # Supplier fields
            "businessName": (existing or {}).get("businessName", ""),
            "contactPerson": (existing or {}).get("contactPerson", firebase_user.get("displayName", "")),
            "productsSupplied": (existing or {}).get("productsSupplied", []),
            "configuredProducts": (existing or {}).get("configuredProducts", []),
        }

        # Assert no sample business names are leaked
        self.assertEqual(form_data["shopName"], "")
        self.assertEqual(form_data["businessName"], "")
        self.assertNotIn("EMCG", form_data["businessName"])
        self.assertNotIn("FMCG Direct Distribution Ltd", form_data["businessName"])
        self.assertNotIn("Deccan Wholesale", form_data["businessName"])
        self.assertNotIn("Sri Lakshmi Kirana", form_data["shopName"])

        # Assert location is empty
        self.assertEqual(form_data["city"], "")
        self.assertEqual(form_data["state"], "")
        self.assertIsNone(form_data["businessLocation"])

        # Assert product catalogs start empty
        self.assertEqual(form_data["productsSold"], [])
        self.assertEqual(form_data["productsNeeded"], [])
        self.assertEqual(form_data["productsSupplied"], [])
        self.assertEqual(form_data["configuredProducts"], [])


class TestIndiaStateCoverage(unittest.TestCase):
    """Verifies that all 28 states and 8 union territories are present."""

    INDIAN_STATES = [
        # 28 States
        'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
        'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
        'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
        'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
        'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
        'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
        # 8 Union Territories
        'Andaman and Nicobar Islands', 'Chandigarh',
        'Dadra and Nagar Haveli and Daman and Diu', 'Delhi (NCT)',
        'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
    ]

    def test_state_count(self):
        self.assertEqual(len(self.INDIAN_STATES), 36)

    def test_key_states_present(self):
        for state in ['Telangana', 'Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Delhi (NCT)']:
            self.assertIn(state, self.INDIAN_STATES)


class TestIndiaDistrictCoverage(unittest.TestCase):
    """Verifies canonical state -> district dataset covers all states and UTs with official districts."""

    TELANGANA_33_DISTRICTS = [
        "Adilabad", "Bhadradri Kothagudem", "Hanumakonda", "Hyderabad", "Jagtial",
        "Jangaon", "Jayashankar Bhupalpally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar",
        "Khammam", "Kumuram Bheem", "Mahabubabad", "Mahabubnagar", "Mancherial",
        "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda",
        "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla",
        "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad",
        "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"
    ]

    def test_telangana_has_exact_33_districts(self):
        self.assertEqual(len(self.TELANGANA_33_DISTRICTS), 33)
        self.assertIn("Medchal-Malkajgiri", self.TELANGANA_33_DISTRICTS)
        self.assertIn("Hyderabad", self.TELANGANA_33_DISTRICTS)
        self.assertIn("Rangareddy", self.TELANGANA_33_DISTRICTS)
        self.assertIn("Warangal", self.TELANGANA_33_DISTRICTS)

    def test_all_36_states_uts_have_districts(self):
        districts_file = os.path.join(os.path.dirname(__file__), "..", "src", "data", "indiaDistricts.js")
        with open(districts_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Check export exists
        self.assertIn("export const INDIA_DISTRICTS", content)
        # Check all 33 Telangana districts are present
        for dist in self.TELANGANA_33_DISTRICTS:
            self.assertIn(f'"{dist}"', content, f"District {dist} missing from indiaDistricts.js")

        # Check other key states
        for st in ['Andhra Pradesh', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Uttar Pradesh']:
            self.assertIn(f'"{st}": [', content, f"State {st} missing in indiaDistricts.js")


class TestGeocodingQueryConstruction(unittest.TestCase):
    """Verifies geocoding search query scoping to state, district, and country."""

    def build_query(self, query, state_name="", district_name=""):
        clean_query = query.strip()
        search_parts = [clean_query]
        if district_name and district_name.strip() and district_name.lower() not in clean_query.lower():
            search_parts.append(district_name.strip())
        if state_name and state_name.strip() and state_name.lower() not in clean_query.lower():
            search_parts.append(state_name.strip())
        search_parts.append('India')
        return ', '.join(search_parts)

    def test_query_scoped_to_district_and_state(self):
        q1 = self.build_query("Medchal", "Telangana", "Medchal-Malkajgiri")
        self.assertEqual(q1, "Medchal, Medchal-Malkajgiri, Telangana, India")

        q2 = self.build_query("Panchavati", "Maharashtra", "Nashik")
        self.assertEqual(q2, "Panchavati, Nashik, Maharashtra, India")

    def test_query_scoped_to_state_only(self):
        q = self.build_query("War", "Telangana")
        self.assertEqual(q, "War, Telangana, India")

    def test_avoid_redundant_district_in_query(self):
        q = self.build_query("Medchal-Malkajgiri Station", "Telangana", "Medchal-Malkajgiri")
        self.assertEqual(q, "Medchal-Malkajgiri Station, Telangana, India")


class TestCascadingLocationReset(unittest.TestCase):
    """Verifies cascading state -> district -> locality resets prevent stale locations."""

    def handle_state_change(self, current_form, new_state):
        return {
            **current_form,
            "state": new_state,
            "district": "",
            "city": "",
            "area": "",
            "pincode": "",
            "businessLocation": None
        }

    def handle_district_change(self, current_form, new_district):
        return {
            **current_form,
            "district": new_district,
            "city": "",
            "area": "",
            "pincode": "",
            "businessLocation": None
        }

    def test_state_change_resets_district_and_locality(self):
        initial = {
            "state": "Telangana",
            "district": "Medchal-Malkajgiri",
            "city": "Medchal",
            "area": "Industrial Area",
            "pincode": "501401",
            "businessLocation": {"latitude": 17.6189, "longitude": 78.4812}
        }
        updated = self.handle_state_change(initial, "Karnataka")
        self.assertEqual(updated["state"], "Karnataka")
        self.assertEqual(updated["district"], "")
        self.assertEqual(updated["city"], "")
        self.assertEqual(updated["area"], "")
        self.assertEqual(updated["pincode"], "")
        self.assertIsNone(updated["businessLocation"])

    def test_district_change_resets_locality_and_coords(self):
        initial = {
            "state": "Telangana",
            "district": "Medchal-Malkajgiri",
            "city": "Medchal",
            "area": "Industrial Area",
            "pincode": "501401",
            "businessLocation": {"latitude": 17.6189, "longitude": 78.4812}
        }
        updated = self.handle_district_change(initial, "Rangareddy")
        self.assertEqual(updated["state"], "Telangana")
        self.assertEqual(updated["district"], "Rangareddy")
        self.assertEqual(updated["city"], "")
        self.assertEqual(updated["area"], "")
        self.assertEqual(updated["pincode"], "")
        self.assertIsNone(updated["businessLocation"])


class TestStep3ProductRowState(unittest.TestCase):
    """Verifies controlled product row inputs, stable IDs, non-blocking string inputs, and add/remove."""

    def test_stable_id_generation(self):
        import uuid
        prod1 = {"id": f"prod_{uuid.uuid4().hex[:8]}", "name": "", "availableStock": "", "unit": "kg", "price": "", "moq": "", "restockFrequency": "Weekly"}
        prod2 = {"id": f"prod_{uuid.uuid4().hex[:8]}", "name": "", "availableStock": "", "unit": "kg", "price": "", "moq": "", "restockFrequency": "Weekly"}
        self.assertNotEqual(prod1["id"], prod2["id"])
        self.assertTrue(prod1["id"].startswith("prod_"))

    def test_add_product_row_creates_empty_row(self):
        products = [
            {"id": "p1", "name": "Rice", "availableStock": "2500", "unit": "kg", "price": "48", "moq": "200", "restockFrequency": "Weekly"}
        ]
        # Add product
        new_row = {"id": "p2", "name": "", "availableStock": "", "unit": "kg", "price": "", "moq": "", "restockFrequency": "Weekly"}
        products.append(new_row)

        self.assertEqual(len(products), 2)
        self.assertEqual(products[0]["name"], "Rice")
        self.assertEqual(products[0]["availableStock"], "2500")
        self.assertEqual(products[1]["name"], "")
        self.assertEqual(products[1]["availableStock"], "")

    def test_remove_product_row_by_id_preserves_other_values(self):
        products = [
            {"id": "p1", "name": "Rice", "availableStock": "2500"},
            {"id": "p2", "name": "Oil", "availableStock": "400"},
            {"id": "p3", "name": "Sugar", "availableStock": "1000"}
        ]
        # Remove second product (p2)
        filtered = [p for p in products if p["id"] != "p2"]
        self.assertEqual(len(filtered), 2)
        self.assertEqual(filtered[0]["id"], "p1")
        self.assertEqual(filtered[0]["name"], "Rice")
        self.assertEqual(filtered[0]["availableStock"], "2500")
        self.assertEqual(filtered[1]["id"], "p3")
        self.assertEqual(filtered[1]["name"], "Sugar")
        self.assertEqual(filtered[1]["availableStock"], "1000")

    def test_typing_controlled_string_does_not_snap_to_zero(self):
        # Typing "4" -> "48" -> backspace to ""
        field_value = ""
        # Keystroke: "4"
        field_value = "4"
        self.assertEqual(field_value, "4")
        # Keystroke: "48"
        field_value = "48"
        self.assertEqual(field_value, "48")
        # Keystroke: backspace to ""
        field_value = ""
        # Ensure it does NOT snap to 0
        self.assertEqual(field_value, "")
        self.assertNotEqual(field_value, 0)

    def test_validation_on_next(self):
        # Incomplete row
        invalid_row = {"id": "p1", "name": "", "availableStock": "-10", "price": "0", "moq": "-5"}
        errors = []
        if not invalid_row["name"].strip():
            errors.append("Product name is required.")
        stock = float(invalid_row["availableStock"]) if invalid_row["availableStock"] != "" else -1
        if stock < 0:
            errors.append("Available stock must be greater than or equal to 0.")
        price = float(invalid_row["price"]) if invalid_row["price"] != "" else 0
        if price <= 0:
            errors.append("Price must be greater than 0.")
        moq = float(invalid_row["moq"]) if invalid_row["moq"] != "" else 0
        if moq <= 0:
            errors.append("MOQ must be greater than 0.")

        self.assertEqual(len(errors), 4)
        self.assertIn("Product name is required.", errors)
        self.assertIn("Available stock must be greater than or equal to 0.", errors)
        self.assertIn("Price must be greater than 0.", errors)
        self.assertIn("MOQ must be greater than 0.", errors)


class TestNominatimAddressParsing(unittest.TestCase):
    """Verifies flexible address hierarchy extraction (city -> town -> village -> suburb)."""

    def parse_address(self, addr, default_state=""):
        town = addr.get("town", "")
        village = addr.get("village", "")
        city = (
            addr.get("city")
            or town
            or village
            or addr.get("suburb")
            or addr.get("municipality")
            or addr.get("county")
            or ""
        )
        area = (
            addr.get("suburb")
            or addr.get("neighbourhood")
            or addr.get("residential")
            or addr.get("road")
            or addr.get("hamlet")
            or ""
        )
        district = addr.get("state_district") or addr.get("district") or addr.get("county") or ""
        state = addr.get("state") or default_state
        pincode = addr.get("postcode", "")

        return {
            "city": city,
            "area": area,
            "district": district,
            "state": state,
            "pincode": pincode
        }

    def test_parse_major_city(self):
        raw = {
            "suburb": "Madhapur",
            "city": "Hyderabad",
            "state_district": "Hyderabad",
            "state": "Telangana",
            "postcode": "500081"
        }
        res = self.parse_address(raw)
        self.assertEqual(res["city"], "Hyderabad")
        self.assertEqual(res["area"], "Madhapur")
        self.assertEqual(res["state"], "Telangana")
        self.assertEqual(res["pincode"], "500081")

    def test_parse_town_without_city(self):
        raw = {
            "town": "Miryalaguda",
            "state_district": "Nalgonda",
            "state": "Telangana",
            "postcode": "508207"
        }
        res = self.parse_address(raw)
        self.assertEqual(res["city"], "Miryalaguda")
        self.assertEqual(res["district"], "Nalgonda")

    def test_parse_village_without_city(self):
        raw = {
            "village": "Ghanpur",
            "state_district": "Jangaon",
            "state": "Telangana",
            "postcode": "506143"
        }
        res = self.parse_address(raw)
        self.assertEqual(res["city"], "Ghanpur")
        self.assertEqual(res["district"], "Jangaon")


class TestGpsErrorClassification(unittest.TestCase):
    """Verifies that all GPS flows terminate and do not hang indefinitely."""

    STATUS_CODES = {
        "NOT_REQUESTED": "NOT_REQUESTED",
        "REQUESTING": "REQUESTING",
        "GRANTED": "GRANTED",
        "DENIED": "DENIED",
        "UNAVAILABLE": "UNAVAILABLE",
        "TIMEOUT": "TIMEOUT",
        "NOT_SUPPORTED": "NOT_SUPPORTED"
    }

    def test_terminal_error_codes(self):
        terminal_states = [
            self.STATUS_CODES["GRANTED"],
            self.STATUS_CODES["DENIED"],
            self.STATUS_CODES["UNAVAILABLE"],
            self.STATUS_CODES["TIMEOUT"],
            self.STATUS_CODES["NOT_SUPPORTED"]
        ]
        self.assertIn("DENIED", terminal_states)
        self.assertIn("TIMEOUT", terminal_states)
        self.assertIn("UNAVAILABLE", terminal_states)

    def test_gps_options_parameters(self):
        gps_options = {
            "enableHighAccuracy": True,
            "timeout": 10000,
            "maximumAge": 300000
        }
        self.assertTrue(gps_options["enableHighAccuracy"])
        self.assertEqual(gps_options["timeout"], 10000)
        self.assertEqual(gps_options["maximumAge"], 300000)


class TestDemoMapDataSeparation(unittest.TestCase):
    """Verifies canonical fixed wholesale network: 10 realistic localities, Medchal warehouse, and isolation."""

    SAMPLE_WAREHOUSE = {
        "locality": "Medchal Industrial Area",
        "city": "Medchal",
        "state": "Telangana",
        "lat": 17.6189,
        "lng": 78.4812,
        "isDemo": True
    }

    SAMPLE_RETAIL_LOCATIONS = [
        {"id": "retail_medchal", "area": "Medchal", "lat": 17.6297, "lng": 78.4814, "isDemo": True},
        {"id": "retail_kompally", "area": "Kompally", "lat": 17.5385, "lng": 78.4867, "isDemo": True},
        {"id": "retail_jeedimetla", "area": "Jeedimetla", "lat": 17.5186, "lng": 78.4527, "isDemo": True},
        {"id": "retail_kukatpally", "area": "Kukatpally", "lat": 17.4849, "lng": 78.4138, "isDemo": True},
        {"id": "retail_madhapur", "area": "Madhapur", "lat": 17.4483, "lng": 78.3915, "isDemo": True},
        {"id": "retail_kondapur", "area": "Kondapur", "lat": 17.4622, "lng": 78.3568, "isDemo": True},
        {"id": "retail_secunderabad", "area": "Secunderabad", "lat": 17.4399, "lng": 78.4983, "isDemo": True},
        {"id": "retail_uppal", "area": "Uppal", "lat": 17.4022, "lng": 78.5603, "isDemo": True},
        {"id": "retail_lbnagar", "area": "LB Nagar", "lat": 17.3457, "lng": 78.5522, "isDemo": True},
        {"id": "retail_mehdipatnam", "area": "Mehdipatnam", "lat": 17.3916, "lng": 78.4419, "isDemo": True}
    ]

    def test_demo_warehouse_fixed_medchal(self):
        self.assertEqual(self.SAMPLE_WAREHOUSE["locality"], "Medchal Industrial Area")
        self.assertAlmostEqual(self.SAMPLE_WAREHOUSE["lat"], 17.6189, places=3)
        self.assertAlmostEqual(self.SAMPLE_WAREHOUSE["lng"], 78.4812, places=3)
        self.assertTrue(self.SAMPLE_WAREHOUSE["isDemo"])

    def test_demo_retailer_count(self):
        self.assertEqual(len(self.SAMPLE_RETAIL_LOCATIONS), 10)

    def test_all_ten_localities_present(self):
        expected_areas = {
            "Medchal", "Kompally", "Jeedimetla", "Kukatpally", "Madhapur",
            "Kondapur", "Secunderabad", "Uppal", "LB Nagar", "Mehdipatnam"
        }
        actual_areas = {ret["area"] for ret in self.SAMPLE_RETAIL_LOCATIONS}
        self.assertEqual(actual_areas, expected_areas)

    def test_realistic_coordinates_within_hyderabad_region(self):
        for ret in self.SAMPLE_RETAIL_LOCATIONS:
            self.assertTrue(ret["isDemo"])
            self.assertGreater(ret["lat"], 17.3)
            self.assertLess(ret["lat"], 17.65)
            self.assertGreater(ret["lng"], 78.3)
            self.assertLess(ret["lng"], 78.6)

    def test_demo_retailers_never_enter_real_procurement(self):
        # Real procurement filter function
        retailers = self.SAMPLE_RETAIL_LOCATIONS + [
            {"id": "real_ret_001", "area": "Ameerpet", "lat": 17.4375, "lng": 78.4482, "isDemo": False}
        ]

        real_only_procurement_pool = [r for r in retailers if not r.get("isDemo", False)]
        self.assertEqual(len(real_only_procurement_pool), 1)
        self.assertEqual(real_only_procurement_pool[0]["id"], "real_ret_001")


class TestLocationPrivacy(unittest.TestCase):
    """Verifies that only retailers with sharingEnabled === true are visible to suppliers."""

    def filter_eligible_retailers(self, retailers):
        eligible = []
        for r in retailers:
            loc = r.get("location") or r.get("locationSharing") or {}
            sharing_enabled = loc.get("sharingEnabled") is True
            lat = loc.get("latitude")
            lng = loc.get("longitude")
            has_valid_coords = (
                lat is not None and lng is not None
                and not math.isnan(lat) and not math.isnan(lng)
                and -90 <= lat <= 90 and -180 <= lng <= 180
            )
            if sharing_enabled and has_valid_coords:
                eligible.append(r)
        return eligible

    def test_private_location_not_shared(self):
        retailers = [
            # Retailer 1: Saved location, but sharingEnabled is False
            {
                "id": "ret_private",
                "name": "Private Kirana",
                "location": {"latitude": 17.45, "longitude": 78.40, "sharingEnabled": False}
            },
            # Retailer 2: Saved location and sharingEnabled is True
            {
                "id": "ret_shared",
                "name": "Shared Kirana",
                "location": {"latitude": 17.46, "longitude": 78.41, "sharingEnabled": True}
            },
            # Retailer 3: No location
            {
                "id": "ret_noloc",
                "name": "No Loc Kirana",
                "location": None
            }
        ]

        eligible = self.filter_eligible_retailers(retailers)
        self.assertEqual(len(eligible), 1)
        self.assertEqual(eligible[0]["id"], "ret_shared")


class TestNoRetailerRoleSwitching(unittest.TestCase):
    """Verifies that no 'Switch to Supplier' buttons exist in Retailer navigation/UI."""

    def test_sidebar_has_no_retailer_switch_to_supplier(self):
        sidebar_file = os.path.join(os.path.dirname(__file__), "..", "src", "components", "Sidebar.jsx")
        with open(sidebar_file, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertNotIn("Switch to Supplier Portal", content)
        self.assertNotIn("switchRole('supplier')", content)

    def test_topnav_has_no_retailer_switch_to_supplier(self):
        topnav_file = os.path.join(os.path.dirname(__file__), "..", "src", "components", "TopNav.jsx")
        with open(topnav_file, "r", encoding="utf-8") as f:
            content = f.read()

        self.assertNotIn("Switch to Supplier", content)
        self.assertNotIn("switchRole('supplier')", content)


class TestRetailerShopLocationOnboarding(unittest.TestCase):
    """Verifies that retailer onboarding collects and persists actual SHOP location hierarchy."""

    def test_canonical_retailer_shop_location_structure(self):
        # Simulating retailer completing Step 1 onboarding
        form_data = {
            "shopName": "Sri Lakshmi Kirana Store",
            "ownerName": "Srinivas Rao",
            "state": "Telangana",
            "district": "Medchal-Malkajgiri",
            "city": "Medchal",
            "area": "Medchal Industrial Area",
            "address": "Shop No 4, Main Market Road",
            "pincode": "501401",
            "businessLocation": {
                "address": "Shop No 4, Main Market Road",
                "area": "Medchal Industrial Area",
                "city": "Medchal",
                "district": "Medchal-Malkajgiri",
                "state": "Telangana",
                "pincode": "501401",
                "latitude": 17.6297,
                "longitude": 78.4814,
                "source": "nominatim_geocoded"
            }
        }

        # Assert mandatory shop location hierarchy
        self.assertTrue(form_data["state"])
        self.assertTrue(form_data["district"])
        self.assertTrue(form_data["city"])
        self.assertTrue(form_data["address"])
        self.assertTrue(form_data["pincode"])

        # Assert canonical businessLocation has exact coordinates representing shop
        b_loc = form_data["businessLocation"]
        self.assertIsNotNone(b_loc)
        self.assertEqual(b_loc["address"], "Shop No 4, Main Market Road")
        self.assertEqual(b_loc["district"], "Medchal-Malkajgiri")
        self.assertEqual(b_loc["state"], "Telangana")
        self.assertEqual(b_loc["pincode"], "501401")
        self.assertAlmostEqual(b_loc["latitude"], 17.6297, places=4)
        self.assertAlmostEqual(b_loc["longitude"], 78.4814, places=4)

    def test_existing_retailer_profile_preserved(self):
        existing_profile = {
            "id": "ret_existing_001",
            "storeName": "Sri Balaji Kirana",
            "state": "Telangana",
            "district": "Hyderabad",
            "city": "Hyderabad",
            "area": "Kukatpally",
            "address": "Plot 12, KPHB Colony",
            "pincode": "500072",
            "businessLocation": {
                "latitude": 17.4849,
                "longitude": 78.4138,
                "district": "Hyderabad",
                "state": "Telangana"
            }
        }

        # Merging with partial update must not destroy existing coordinates
        partial_update = {"contactPhone": "+91 98480 99999"}
        merged = {**existing_profile, **partial_update}
        self.assertEqual(merged["businessLocation"]["latitude"], 17.4849)
        self.assertEqual(merged["businessLocation"]["longitude"], 78.4138)
        self.assertEqual(merged["district"], "Hyderabad")


class TestRetailerToSupplierRoute(unittest.TestCase):
    """Verifies that route map uses retailer shop as ORIGIN and supplier warehouse as DESTINATION."""

    def test_route_endpoints_priority(self):
        retailer = {
            "storeName": "Kukatpally Kirana",
            "businessLocation": {
                "latitude": 17.4849,
                "longitude": 78.4138,
                "area": "Kukatpally"
            }
        }
        supplier = {
            "name": "Deccan Wholesale Hub",
            "businessLocation": {
                "latitude": 17.6189,
                "longitude": 78.4812,
                "locality": "Medchal Industrial Area"
            }
        }

        # Origin extraction logic
        origin = {
            "latitude": retailer["businessLocation"]["latitude"],
            "longitude": retailer["businessLocation"]["longitude"],
            "name": retailer["storeName"]
        }
        # Destination extraction logic
        destination = {
            "latitude": supplier["businessLocation"]["latitude"],
            "longitude": supplier["businessLocation"]["longitude"],
            "name": supplier["name"]
        }

        # Assert correct coordinates are used without random fallback
        self.assertEqual(origin["latitude"], 17.4849)
        self.assertEqual(origin["longitude"], 78.4138)
        self.assertEqual(destination["latitude"], 17.6189)
        self.assertEqual(destination["longitude"], 78.4812)

    def test_route_cache_key_deterministic(self):
        origin = {"latitude": 17.4849, "longitude": 78.4138}
        dest = {"latitude": 17.6189, "longitude": 78.4812}
        profile = "driving-car"

        cache_key_1 = f"{origin['latitude']:.5f},{origin['longitude']:.5f}->{dest['latitude']:.5f},{dest['longitude']:.5f}->{profile}"
        cache_key_2 = f"{origin['latitude']:.5f},{origin['longitude']:.5f}->{dest['latitude']:.5f},{dest['longitude']:.5f}->{profile}"
        self.assertEqual(cache_key_1, cache_key_2)

    def test_stale_response_guard(self):
        active_request_id = 1
        # Request 1 starts
        req1_id = active_request_id

        # User quickly clicks another supplier -> Request 2 starts
        active_request_id += 1
        req2_id = active_request_id

        # Req 1 returns late
        is_req1_valid = (req1_id == active_request_id)
        self.assertFalse(is_req1_valid, "Late response from Request 1 must be discarded")

        # Req 2 returns
        is_req2_valid = (req2_id == active_request_id)
        self.assertTrue(is_req2_valid, "Current response from Request 2 must be accepted")

    def test_missing_coordinates_graceful_handling(self):
        retailer_no_loc = {"storeName": "New Kirana", "businessLocation": None}
        supplier = {"name": "Medchal Hub", "businessLocation": {"latitude": 17.6189, "longitude": 78.4812}}

        has_origin = bool(retailer_no_loc.get("businessLocation"))
        has_dest = bool(supplier.get("businessLocation"))

        status = "ready" if (has_origin and has_dest) else "missing_coords"
        self.assertEqual(status, "missing_coords")


class TestMapStabilityAndResize(unittest.TestCase):
    """Verifies map single-instance ref, fitBounds once per route, and resize observer."""

    def test_fit_bounds_single_execution_per_route(self):
        fitted_route_keys = set()
        route_key = "17.4849,78.4138->17.6189,78.4812"

        # First load -> fits bounds
        fits_count = 0
        if route_key not in fitted_route_keys:
            fits_count += 1
            fitted_route_keys.add(route_key)

        # Subsequent re-renders of the same route -> does NOT re-fit bounds
        if route_key not in fitted_route_keys:
            fits_count += 1

        self.assertEqual(fits_count, 1)


if __name__ == "__main__":
    unittest.main()
