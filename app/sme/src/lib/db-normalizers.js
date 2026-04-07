function toFiniteNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function normalizeMoney(value, fallback = 0) {
  const n = toFiniteNumber(value, fallback);
  return Math.round(n * 100) / 100;
}

export function normalizeString(value, fallback = "") {
  return typeof value === "string" ? value.trim() : fallback;
}

export function normalizeItems(items = []) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const quantity = Math.max(1, normalizeMoney(item?.quantity, 1));
    const price = Math.max(0, normalizeMoney(item?.price, 0));
    return {
      description: normalizeString(item?.description),
      quantity,
      price,
      amount: normalizeMoney(quantity * price, 0),
    };
  });
}

export function buildDocumentTotals(items = [], taxRate = 0) {
  const normalizedItems = normalizeItems(items);
  const subtotal = normalizeMoney(
    normalizedItems.reduce((sum, item) => sum + item.amount, 0),
    0
  );
  const normalizedTaxRate = Math.max(0, normalizeMoney(taxRate, 0));
  const taxAmount = normalizeMoney((subtotal * normalizedTaxRate) / 100, 0);
  const total = normalizeMoney(subtotal + taxAmount, 0);
  return { items: normalizedItems, subtotal, taxRate: normalizedTaxRate, taxAmount, total };
}
