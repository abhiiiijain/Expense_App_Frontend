export function formatCurrency(amount, { signed = false } = {}) {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  if (!signed || amount === 0) {
    return `₹${formatted}`;
  }

  return amount < 0 ? `-₹${formatted}` : `+₹${formatted}`;
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
