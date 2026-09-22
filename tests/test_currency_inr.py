"""
Unit tests for Samooh INR Currency Formatter
Tests standard Indian numbering system (Lakhs, Crores, thousands) with ₹ symbol.
"""

import unittest

def format_inr(amount, decimals=0):
    if amount is None or amount == "":
        return "₹0"
    try:
        val = float(amount)
    except (ValueError, TypeError):
        return "₹0"

    is_negative = val < 0
    val = abs(val)
    
    # Format with decimals
    formatted_float = f"{val:.{decimals}f}"
    parts = formatted_float.split(".")
    integer_part = parts[0]
    decimal_part = parts[1] if len(parts) > 1 and decimals > 0 else ""

    if len(integer_part) <= 3:
        res = integer_part
    else:
        last_three = integer_part[-3:]
        remaining = integer_part[:-3]
        # In Indian numbering, commas separate every 2 digits after the last 3
        groups = []
        while len(remaining) > 2:
            groups.insert(0, remaining[-2:])
            remaining = remaining[:-2]
        if remaining:
            groups.insert(0, remaining)
        res = ",".join(groups) + "," + last_three

    out = ("-" if is_negative else "") + "₹" + res
    if decimal_part:
        out += "." + decimal_part
    return out


class TestINRCurrency(unittest.TestCase):
    def test_standard_values(self):
        self.assertEqual(format_inr(0), "₹0")
        self.assertEqual(format_inr(50), "₹50")
        self.assertEqual(format_inr(500), "₹500")
        self.assertEqual(format_inr(1250), "₹1,250")

    def test_indian_number_grouping(self):
        # 1 Lakh = 1,00,000
        self.assertEqual(format_inr(100000), "₹1,00,000")
        # 2.5 Lakh = 2,50,000
        self.assertEqual(format_inr(250000), "₹2,50,000")
        # 1 Crore = 1,00,00,000
        self.assertEqual(format_inr(10000000), "₹1,00,00,000")
        # 15.5 Lakhs
        self.assertEqual(format_inr(1550000), "₹15,50,000")

    def test_decimals(self):
        self.assertEqual(format_inr(1250.50, decimals=2), "₹1,250.50")
        self.assertEqual(format_inr(48.75, decimals=2), "₹48.75")

    def test_edge_cases(self):
        self.assertEqual(format_inr(None), "₹0")
        self.assertEqual(format_inr(""), "₹0")
        self.assertEqual(format_inr("invalid"), "₹0")
        self.assertEqual(format_inr(-500), "-₹500")

if __name__ == "__main__":
    unittest.main()
