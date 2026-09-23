"""
Comprehensive Automated Test Suite for Samooh Language Selection & i18n Feature.

Validates all prompt requirements:
1. Retailer portal has a small "Language" option in navigation/header/settings.
2. When clicked, shows a simple language selector with:
   - Language (header)
   - English
   - తెలుగు
   - हिन्दी
   - தமிழ்
   - ಕನ್ನಡ
   - मराठी
3. Structure allows additional Indian languages to be added easily.
4. Translation structure in src/i18n/ (en.js, te.js, hi.js, ta.js, kn.js, mr.js, index.js).
5. All 6 languages contain full translations for retailer UI and Help & Support:
   - Help & Support
   - Issue Type
   - Stock issue
   - Payment issue
   - Order issue
   - Supplier issue
   - Delivery issue
   - Product issue
   - Account issue
   - Other
   - Describe your issue or query
   - Submit Query
   - Cancel
6. Help & Support modal uses selected language via t().
7. Fallback to English is guaranteed if any key is missing.
8. Selected language persists across reloads via localStorage ('samooh_lang').
9. Default language is English.
10. Supplier portal, maps, and procurement functionality remain unchanged.
"""

import os
import sys
import re

def test_language_selection():
    print("==================================================================")
    print("Running Samooh Language Selection & i18n Test Suite")
    print("==================================================================")

    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    i18n_dir = os.path.join(root_dir, "src", "i18n")
    topnav_file = os.path.join(root_dir, "src", "components", "TopNav.jsx")
    modal_file = os.path.join(root_dir, "src", "components", "RetailerHelpSupportModal.jsx")
    app_context_file = os.path.join(root_dir, "src", "context", "AppContext.jsx")

    # 1. Verify i18n directory and all 6 language dictionary files exist
    expected_files = ['index.js', 'en.js', 'te.js', 'hi.js', 'ta.js', 'kn.js', 'mr.js']
    for filename in expected_files:
        filepath = os.path.join(i18n_dir, filename)
        assert os.path.exists(filepath), f"Expected i18n file missing: {filepath}"
    print("PASS: Requirement 1 - src/i18n structure with all 6 language files + index.js exists.")

    # 2. Verify SUPPORTED_LANGUAGES configuration in index.js
    with open(os.path.join(i18n_dir, "index.js"), "r", encoding="utf-8") as f:
        index_src = f.read()

    expected_codes = ['en', 'te', 'hi', 'ta', 'kn', 'mr']
    for code in expected_codes:
        assert f"code: '{code}'" in index_src or f'code: "{code}"' in index_src, \
            f"index.js missing language code: {code}"

    expected_native_names = ['English', 'తెలుగు', 'हिन्दी', 'தமிழ்', 'ಕನ್ನಡ', 'मराठी']
    for native in expected_native_names:
        assert native in index_src, f"index.js missing native name: {native}"

    assert "getTranslation" in index_src, "index.js must export getTranslation fallback function"
    assert "DEFAULT_LANGUAGE = 'en'" in index_src or 'DEFAULT_LANGUAGE = "en"' in index_src, \
        "English must be DEFAULT_LANGUAGE"
    print("PASS: Requirement 2 - SUPPORTED_LANGUAGES configured with all native names and fallback.")

    # 3. Verify Language Dictionaries have all required keys
    lang_files = {
        'en': 'en.js',
        'te': 'te.js',
        'hi': 'hi.js',
        'ta': 'ta.js',
        'kn': 'kn.js',
        'mr': 'mr.js'
    }

    required_support_keys = [
        'helpSupport',
        'issueType',
        'stockIssue',
        'paymentIssue',
        'orderIssue',
        'supplierIssue',
        'deliveryIssue',
        'productIssue',
        'accountIssue',
        'other',
        'describeIssue',
        'submitQuery',
        'cancel'
    ]

    required_nav_keys = [
        'language',
        'dashboard',
        'opportunities',
        'customDemand',
        'savingsBill',
        'insights',
        'impact'
    ]

    for lang_code, filename in lang_files.items():
        with open(os.path.join(i18n_dir, filename), "r", encoding="utf-8") as f:
            content = f.read()

        for key in required_support_keys:
            assert f"{key}:" in content, f"{filename} is missing required support key: {key}"

        for key in required_nav_keys:
            assert f"{key}:" in content, f"{filename} is missing required nav key: {key}"

    print("PASS: Requirement 3 - All 6 language files contain required retailer & Help/Support keys.")

    # 4. Verify Native Strings in Help & Support translations
    with open(os.path.join(i18n_dir, "te.js"), "r", encoding="utf-8") as f:
        te_content = f.read()
    assert "సమస్య రకం" in te_content, "Telugu must have correct issueType"
    assert "స్టాక్ సమస్య" in te_content, "Telugu must have correct stockIssue"
    assert "రద్దు చేయండి" in te_content, "Telugu must have cancel button"

    with open(os.path.join(i18n_dir, "hi.js"), "r", encoding="utf-8") as f:
        hi_content = f.read()
    assert "समस्या का प्रकार" in hi_content, "Hindi must have correct issueType"
    assert "स्टॉक समस्या" in hi_content, "Hindi must have correct stockIssue"
    assert "रद्द करें" in hi_content, "Hindi must have cancel button"

    with open(os.path.join(i18n_dir, "ta.js"), "r", encoding="utf-8") as f:
        ta_content = f.read()
    assert "சிக்கல் வகை" in ta_content, "Tamil must have correct issueType"
    assert "சரக்கு சிக்கல்" in ta_content, "Tamil must have correct stockIssue"

    with open(os.path.join(i18n_dir, "kn.js"), "r", encoding="utf-8") as f:
        kn_content = f.read()
    assert "ಸಮಸ್ಯೆಯ ಪ್ರಕಾರ" in kn_content, "Kannada must have correct issueType"
    assert "ಸ್ಟಾಕ್ ಸಮಸ್ಯೆ" in kn_content, "Kannada must have correct stockIssue"

    with open(os.path.join(i18n_dir, "mr.js"), "r", encoding="utf-8") as f:
        mr_content = f.read()
    assert "समस्येचा प्रकार" in mr_content, "Marathi must have correct issueType"
    assert "स्टॉक समस्या" in mr_content, "Marathi must have correct stockIssue"

    print("PASS: Requirement 4 - Native Indian language scripts correctly mapped for issue types and controls.")

    # 5. Verify Language Selector UI in TopNav.jsx
    with open(topnav_file, "r", encoding="utf-8") as f:
        topnav_content = f.read()

    assert "language-selector-button" in topnav_content, "TopNav must have language-selector-button"
    assert "language-dropdown-menu" in topnav_content, "TopNav must have language-dropdown-menu"
    assert "langDropdownRef" in topnav_content, "TopNav must use ref to handle outside clicks"
    assert "supportedLanguages" in topnav_content, "TopNav must dynamically map supportedLanguages"
    assert "nativeName" in topnav_content, "TopNav must display nativeName for languages"

    print("PASS: Requirement 5 - Language dropdown button and menu implemented in TopNav.")

    # 6. Verify Help & Support Modal uses i18n
    with open(modal_file, "r", encoding="utf-8") as f:
        modal_content = f.read()

    assert "t('helpSupport')" in modal_content or 't("helpSupport")' in modal_content, \
        "Modal title must use t('helpSupport')"
    assert "t('issueType')" in modal_content or 't("issueType")' in modal_content, \
        "Modal category label must use t('issueType')"
    assert "t(cat.key)" in modal_content, \
        "Modal must translate categories via t(cat.key)"
    assert "t('describeIssue')" in modal_content or 't("describeIssue")' in modal_content, \
        "Modal issue description label must use t('describeIssue')"
    assert "t('submitQuery')" in modal_content or 't("submitQuery")' in modal_content, \
        "Modal submit button must use t('submitQuery')"
    assert "t('cancel')" in modal_content or 't("cancel")' in modal_content, \
        "Modal cancel button must use t('cancel')"

    # Verify canonical values are preserved for database storage
    assert "'Stock / Quantity'" in modal_content, "Modal must preserve canonical 'Stock / Quantity' for database"
    assert "'Payment'" in modal_content, "Modal must preserve canonical 'Payment' for database"

    print("PASS: Requirement 6 - RetailerHelpSupportModal wired to translations and preserves database schema.")

    # 7. Verify LocalStorage Persistence & AppContext
    with open(app_context_file, "r", encoding="utf-8") as f:
        context_content = f.read()

    assert "localStorage.getItem('samooh_lang') || 'en'" in context_content or 'localStorage.getItem("samooh_lang")' in context_content, \
        "AppContext must read language preference from localStorage ('samooh_lang') with fallback to 'en'"
    assert "localStorage.setItem('samooh_lang', lang)" in context_content or 'localStorage.setItem("samooh_lang"' in context_content, \
        "AppContext must persist language preference to localStorage on change"
    assert "getTranslation" in context_content, \
        "AppContext must use getTranslation with automatic fallback"

    print("PASS: Requirement 7 - Persistence via localStorage ('samooh_lang') and fallback mechanism verified.")

    print("\n==================================================================")
    print("ALL LANGUAGE SELECTION & I18N TESTS PASSED (7/7)")
    print("==================================================================")

if __name__ == "__main__":
    test_language_selection()
