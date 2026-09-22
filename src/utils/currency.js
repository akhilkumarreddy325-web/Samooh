/**
 * Samooh Platform - Centralized Indian Rupee (INR) Currency Utility
 * 
 * Formats numbers into standard Indian numbering system (Lakhs, Crores) with ₹ symbol.
 * Example:
 * formatINR(1250) -> "₹1,250"
 * formatINR(250000) -> "₹2,50,000"
 * formatINR(1500000) -> "₹15,00,000"
 */

/**
 * Formats any numeric value into Indian Rupee currency format (₹).
 * @param {number|string} amount - The numeric value to format.
 * @param {Object} [options]
 * @param {number} [options.decimals=0] - Decimal places (defaults to 0 for standard B2B rupee amounts).
 * @param {boolean} [options.compact=false] - If true, formats in compact notation (e.g., ₹2.5L).
 * @returns {string} Formatted INR currency string.
 */
export function formatINR(amount, options = {}) {
  const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]+/g, '')) : Number(amount);
  
  if (isNaN(num) || num === null || num === undefined) {
    return '₹0';
  }

  const decimals = options.decimals ?? 0;

  if (options.compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹${(num / 10000000).toFixed(decimals > 0 ? decimals : 1)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹${(num / 100000).toFixed(decimals > 0 ? decimals : 1)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹${(num / 1000).toFixed(decimals > 0 ? decimals : 1)} k`;
    }
  }

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: decimals,
      minimumFractionDigits: decimals
    }).format(num);
  } catch {
    // Robust fallback if Intl is not available
    const parts = num.toFixed(decimals).split('.');
    let integerPart = parts[0];
    const isNegative = integerPart.startsWith('-');
    if (isNegative) integerPart = integerPart.substring(1);

    const lastThree = integerPart.substring(integerPart.length - 3);
    const otherNumbers = integerPart.substring(0, integerPart.length - 3);
    const formatted = otherNumbers !== '' 
      ? otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree 
      : lastThree;

    const result = (isNegative ? '-' : '') + '₹' + formatted + (parts[1] ? '.' + parts[1] : '');
    return result;
  }
}

/**
 * Parses any formatted string or input value into a clean number.
 * @param {string|number} val 
 * @returns {number}
 */
export function parseINR(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

export default formatINR;
