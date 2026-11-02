import { isCardPaymentExpense } from "./creditCardPayments";

export const RESALE_INVENTORY_SUBCATEGORY = "Resale inventory";

export function isResaleInventoryExpense(tx) {
  return tx?.subcategory === RESALE_INVENTORY_SUBCATEGORY;
}

/** Personal spending. Card bill payments and stock bought for resale are not Spent. */
export function isConsumptionExpense(tx) {
  return !isCardPaymentExpense(tx) && !isResaleInventoryExpense(tx);
}
