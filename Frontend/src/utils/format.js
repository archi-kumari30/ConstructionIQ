/**
 * Formats a number as Indian Rupee (INR) currency.
 */
export const formatINR = (value) => {
  if (value === undefined || value === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

/**
 * Formats a number into compact Indian Rupee representation (Crores and Lakhs).
 * e.g., 24500000 -> ₹2.45 Cr, 850000 -> ₹8.50 L
 */
export const formatINRCompact = (value) => {
  if (value === undefined || value === null) return '₹0';
  const num = Number(value);
  if (isNaN(num)) return '₹0';

  if (num >= 10000000) {
    const val = num / 10000000;
    return `₹${val.toFixed(2).replace(/\.00$/, '')} Cr`;
  } else if (num >= 100000) {
    const val = num / 100000;
    return `₹${val.toFixed(2).replace(/\.00$/, '')} L`;
  }

  return formatINR(value);
};
