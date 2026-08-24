/** Strip non-numeric characters and keep at most 2 decimal places. */
export function sanitizeAmountInput(value) {
  let cleaned = String(value).replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");

  if (firstDot === -1) {
    return cleaned;
  }

  // Keep only the first decimal point
  cleaned =
    cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");

  const [whole, fraction = ""] = cleaned.split(".");
  return `${whole}.${fraction.slice(0, 2)}`;
}

/** Round a numeric amount to 2 decimal places (paise). */
export function roundMoney(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return NaN;
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/** Format a stored amount for editable inputs (always 2 decimals). */
export function formatAmountInput(value) {
  const rounded = roundMoney(value);
  if (!Number.isFinite(rounded)) return "";
  return rounded.toFixed(2);
}
