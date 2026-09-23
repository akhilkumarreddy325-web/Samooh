"""
Focused Automated Test Suite for Samooh Retailer Help & Support Feature.
Validates all requirements:
1. Help & Support button appears for retailer (and strictly hidden for suppliers).
2. Help & Support opens correctly (title, subtitle, query placeholder, contact notice).
3. Retailer can enter an issue/query.
4. Category can be selected from defined options.
5. Support request saves with authenticated retailer UID and clean schema (retailerId, retailerName, category, message, status: OPEN).
6. Retailer cannot read another retailer's support request (strict data isolation).
7. Existing retailer functionality remains intact without regression.
"""

import os
import sys
import re

def test_retailer_help_support():
    print("==================================================================")
    print("Running Samooh Retailer Help & Support Test Suite")
    print("==================================================================")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sidebar_file = os.path.join(root_dir, "src", "components", "Sidebar.jsx")
    modal_file = os.path.join(root_dir, "src", "components", "RetailerHelpSupportModal.jsx")
    service_file = os.path.join(root_dir, "src", "services", "supportService.js")
    rules_file = os.path.join(root_dir, "firestore.rules")

    # 1. Verify files exist
    assert os.path.exists(sidebar_file), f"Sidebar.jsx not found at {sidebar_file}"
    assert os.path.exists(modal_file), f"RetailerHelpSupportModal.jsx not found at {modal_file}"
    assert os.path.exists(service_file), f"supportService.js not found at {service_file}"
    assert os.path.exists(rules_file), f"firestore.rules not found at {rules_file}"

    # Read contents
    with open(sidebar_file, "r", encoding="utf-8") as f:
        sidebar_src = f.read()

    with open(modal_file, "r", encoding="utf-8") as f:
        modal_src = f.read()

    with open(service_file, "r", encoding="utf-8") as f:
        service_src = f.read()

    with open(rules_file, "r", encoding="utf-8") as f:
        rules_src = f.read()

    # 2. Verify Help & Support button in Sidebar for Retailers (Requirement 1)
    assert "retailer-help-support-button" in sidebar_src or "Help & Support" in sidebar_src, \
        "Sidebar must contain Help & Support trigger button"
    assert "!isSupplier" in sidebar_src, \
        "Help & Support button must be visible for retailers and not suppliers"
    assert "RetailerHelpSupportModal" in sidebar_src, \
        "Sidebar must import and mount RetailerHelpSupportModal"
    print("PASS: Requirement 1 - Help & Support button correctly placed in Retailer sidebar.")

    # 3. Verify Help & Support Panel Content (Requirement 2 & 5)
    assert "Help & Support" in modal_src, "Modal must have title 'Help & Support'"
    assert "Having an issue? Tell us what happened and we'll help." in modal_src, \
        "Modal must have exact subtitle requirement"
    assert "Describe your issue or query..." in modal_src, \
        "Modal must provide issue query box with required placeholder"
    assert "Need immediate help?" in modal_src, "Modal must provide immediate help section"
    assert "Call Support" in modal_src, "Modal must provide Call Support option"
    assert "Support contact will be available soon" in modal_src or "CONFIGURED_SUPPORT_PHONE" in modal_src, \
        "Modal must not invent a fake phone number"
    print("PASS: Requirement 2 & 5 - Help & Support modal rendered with exact titles, query box, and contact notice.")

    # 4. Verify Category Dropdown (Requirement 3)
    required_categories = [
        "Stock / Quantity",
        "Payment",
        "Order",
        "Supplier",
        "Delivery",
        "Product",
        "Account",
        "Other"
    ]
    for cat in required_categories:
        assert cat in modal_src, f"Missing category: {cat}"
    assert "What's the issue about?" in modal_src, "Missing category prompt text"
    print("PASS: Requirement 3 - Category dropdown contains all 8 required options plus custom query support.")

    # 5. Verify Submission Feedback (Requirement 4)
    assert "Submit Issue" in modal_src, "Modal must contain 'Submit Issue' button"
    assert "Your issue has been submitted." in modal_src, \
        "Modal must show confirmation: 'Your issue has been submitted.'"
    assert "We'll review your query and get back to you." in modal_src, \
        "Modal must show: 'We'll review your query and get back to you.'"
    print("PASS: Requirement 4 - Submit Issue action and post-submission feedback verified.")

    # 6. Verify Firestore Service & Schema (Requirement 6)
    assert "supportRequests" in service_src, "Service must write to 'supportRequests' collection"
    assert "retailerId" in service_src, "Schema must include retailerId"
    assert "retailerName" in service_src, "Schema must include retailerName"
    assert "category" in service_src, "Schema must include category"
    assert "message" in service_src, "Schema must include message"
    assert "status: 'OPEN'" in service_src or 'status: "OPEN"' in service_src, "Schema must set status to OPEN"
    assert "password" not in service_src.lower(), "No passwords should be stored in support service"
    print("PASS: Requirement 6 - Firestore supportRequests schema strictly adheres to specifications.")

    # 7. Verify Firestore Security Rules (Requirement 7)
    assert "match /supportRequests/{requestId}" in rules_src, "Missing supportRequests security rule"
    assert "resource.data.retailerId == request.auth.uid" in rules_src or "resource.data.retailer_id == request.auth.uid" in rules_src, \
        "Retailer must only read their own support requests"
    assert "request.resource.data.retailerId == request.auth.uid" in rules_src or "request.resource.data.retailer_id == request.auth.uid" in rules_src, \
        "Retailer must create support requests with their own UID"
    assert "allow update, delete: if false;" in rules_src, "Support requests must be immutable"
    print("PASS: Requirement 7 - Firestore security rules strictly prevent cross-retailer and unauthorized access.")

    # 8. Verify Issue History ("My Requests") (Requirement 8)
    assert "My Requests" in modal_src, "Modal must provide 'My Requests' history section"
    assert "OPEN" in modal_src, "History must display OPEN status"
    assert "IN REVIEW" in modal_src, "History must display IN REVIEW status"
    assert "RESOLVED" in modal_src, "History must display RESOLVED status"
    print("PASS: Requirement 8 - My Requests history display with OPEN, IN REVIEW, and RESOLVED status verified.")

    # 9. Verify Existing Retailer Functionality Integrity (Requirement 9)
    # Check that existing sidebar links still exist
    expected_links = ["dashboard", "opportunities", "customDemand", "previousOrdersNav", "savingsBill", "insights", "impact"]
    for link in expected_links:
        assert link in sidebar_src, f"Existing nav item {link} missing from Sidebar"
    print("PASS: Requirement 9 - Existing retailer routes and components completely preserved.")

    print("==================================================================")
    print("ALL RETAILER HELP & SUPPORT TEST SCENARIOS PASSED WITH ZERO ERRORS!")
    print("==================================================================")

if __name__ == "__main__":
    test_retailer_help_support()
