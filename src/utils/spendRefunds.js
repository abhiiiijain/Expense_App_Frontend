export const REFUND_SUBCATEGORY = "Refund";
export const REFUND_WINDOW_DAYS = 15;

export function isSpendRefund(tx) {
  return tx?.subcategory === REFUND_SUBCATEGORY;
}

function roundMoney(value) {
  return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
}

/** Prefers server `remaining`; adds back the in-edit row so the cap stays the original spend. */
export function remainingWithEdit(record, editingTx, linkField) {
  const raw = record?.remaining;
  let left =
    raw != null && Number.isFinite(Number(raw)) ? Number(raw) : Number(record?.amount) || 0;
  if (
    editingTx?._id &&
    String(editingTx[linkField] || "") === String(record?._id || record?.id || "")
  ) {
    left += Number(editingTx.amount) || 0;
  }
  const cap = Number(record?.amount);
  if (Number.isFinite(cap)) left = Math.min(left, cap);
  return roundMoney(Math.max(0, left));
}

export function refundCapMessage(remaining, formatAmount) {
  if (remaining <= 0.005) return "This purchase is already fully refunded";
  const shown =
    typeof formatAmount === "function"
      ? formatAmount(remaining)
      : `₹${roundMoney(remaining).toFixed(2)}`;
  return `Refund can't be more than ${shown} left on this purchase`;
}

/** Spent after linked refunds. Server `remaining` follows the original purchase month. */
export function expensesNetOfRefunds(expenses) {
  return (expenses || [])
    .map((expense) => {
      const raw = expense?.remaining;
      const amount =
        raw != null && Number.isFinite(Number(raw))
          ? Number(raw)
          : Number(expense?.amount) || 0;
      return { ...expense, amount: roundMoney(Math.max(0, amount)) };
    })
    .filter((expense) => expense.amount > 0.005);
}
