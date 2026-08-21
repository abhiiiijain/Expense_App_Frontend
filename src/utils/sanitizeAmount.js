/** Strip non-numeric characters for currency amount inputs. */
export function sanitizeAmountInput(value) {
  return String(value).replace(/[^0-9.]/g, "");
}
