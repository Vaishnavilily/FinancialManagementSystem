// lib/db-normalizers.js

/**
 * Normalize a string for consistent storage/search
 * - trims whitespace
 * - lowercases
 * - collapses multiple spaces
 */
export function normalizeString(str) {
  if (!str || typeof str !== "string") return "";
  return str.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Build totals for an invoice document
 * - sums line item amounts
 * - calculates tax if present
 * - returns a totals object
 */
export function buildDocumentTotals(invoice) {
  if (!invoice || !Array.isArray(invoice.items)) {
    return { subtotal: 0, tax: 0, total: 0 };
  }

  const subtotal = invoice.items.reduce((sum, item) => {
    const amount = Number(item.amount) || 0;
    return sum + amount;
  }, 0);

  const tax = invoice.taxRate
    ? subtotal * (Number(invoice.taxRate) / 100)
    : 0;

  const total = subtotal + tax;

  return { subtotal, tax, total };
}
