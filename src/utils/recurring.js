import { getMonthKey } from "./dateHelpers";

const RECURRING_SUBCATEGORIES = {
  "Mutual Funds": "Savings & Investments",
  Subscriptions: "Entertainment",
  "Cloud & Hosting": "Education & Work",
};

export function isRecurringEligibleExpense(tx) {
  if (!tx || tx.type === "income" || tx.type === "transfer") return false;
  const sub = String(tx.subcategory || "");
  const cat = String(tx.category || "");
  return Boolean(RECURRING_SUBCATEGORIES[sub] && RECURRING_SUBCATEGORIES[sub] === cat);
}

function normalizeRecurringTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase();
}

export function findMatchingRecurring(recurringList, { title, subcategory, accountId }) {
  const wantTitle = normalizeRecurringTitle(title);
  const wantSub = String(subcategory || "");
  const wantAccount = String(accountId || "");
  return (recurringList || []).find(
    (row) =>
      row.active !== false &&
      normalizeRecurringTitle(row.title) === wantTitle &&
      String(row.subcategory || "") === wantSub &&
      String(row.accountId || "") === wantAccount
  );
}

/** Due on/after dueDay this calendar month and not yet fulfilled. */
function isRecurringDue(row, today = new Date()) {
  if (!row || row.active === false) return false;
  const dueDay = Number(row.dueDay);
  if (!Number.isInteger(dueDay) || dueDay < 1 || dueDay > 28) return false;
  if (today.getDate() < dueDay) return false;
  const monthKey = getMonthKey(today);
  return String(row.lastFulfilledMonthKey || "") !== monthKey;
}

export function dueRecurringItems(recurringList, today = new Date()) {
  return (recurringList || []).filter((row) => isRecurringDue(row, today));
}

export function recurringKindLabel(subcategory, { short = false } = {}) {
  const isSub =
    subcategory === "Subscriptions" || subcategory === "Cloud & Hosting";
  if (short) return isSub ? "subscription" : "investment / SIP";
  return isSub ? "Subscription" : "SIP";
}
