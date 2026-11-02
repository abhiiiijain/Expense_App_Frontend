export const RESALE_INCOME_CATEGORY = "Business & Freelance";
export const RESALE_INCOME_SUBCATEGORY = "Resale";

export function isResaleIncome(tx) {
  return tx?.subcategory === RESALE_INCOME_SUBCATEGORY;
}

export function linkedResaleExpenseId(tx) {
  return tx?.resaleOfExpenseId ? String(tx.resaleOfExpenseId) : "";
}
