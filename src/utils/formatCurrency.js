function rupees(amount) {
  return Math.abs(Number(amount) || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatCurrency(amount, { signed = false } = {}) {
  const n = Number(amount) || 0;
  const formatted = `₹${rupees(n)}`;
  if (!signed || n === 0) return formatted;
  return n < 0 ? `-${formatted}` : `+${formatted}`;
}

/** Passbook-style amount: ₹1,22,678.51 CR / ₹486.00 DR */
export function formatLedgerAmount(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n === 0) return "₹0.00";
  const formatted = `₹${rupees(n)}`;
  return n > 0 ? `${formatted} CR` : `${formatted} DR`;
}

/** Percentage with exactly 2 decimal places. */
export function formatPercent(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return "0.00%";
  return `${num.toFixed(2)}%`;
}

/** Compact labels for chart axes. */
export function formatChartAxis(amount) {
  const abs = Math.abs(amount);
  if (abs >= 10000000) return `₹${(abs / 10000000).toFixed(1)}Cr`;
  if (abs >= 100000) return `₹${(abs / 100000).toFixed(1)}L`;
  if (abs >= 1000) return `₹${(abs / 1000).toFixed(0)}k`;
  return `₹${abs.toFixed(2)}`;
}
