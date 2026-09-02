import { DEFAULT_EDIT_WINDOW_MS } from "./formatEditWindow.js";

/** Prefer business date; fall back to createdAt for older rows. */
export function transactionDate(transaction) {
  return new Date(transaction?.date || transaction?.createdAt);
}

export function getMonthKey(dateInput = new Date()) {
  const date = new Date(dateInput);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return getMonthKey(date);
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

export function isInMonthKey(dateInput, monthKey) {
  return getMonthKey(dateInput) === monthKey;
}

/** HTML date input value (YYYY-MM-DD) in local time. */
export function toDateInputValue(dateInput = new Date()) {
  const date = new Date(dateInput);
  if (!Number.isFinite(date.getTime())) return toDateInputValue(new Date());
  return formatDateKey(date);
}

export function formatDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function subDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

export function isTransactionEditable(
  createdAt,
  editWindowMs = DEFAULT_EDIT_WINDOW_MS,
  now = Date.now()
) {
  const created = new Date(createdAt).getTime();
  if (!Number.isFinite(created)) return false;
  return now - created <= editWindowMs;
}

function isToday(date) {
  return date.toDateString() === new Date().toDateString();
}

function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

function formatRelativeDateLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatChartDateLabel(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatChartDayTooltip(date) {
  if (isToday(date)) return `Today · ${formatChartDateLabel(date)}`;
  if (isYesterday(date)) return `Yesterday · ${formatChartDateLabel(date)}`;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function shiftDateKey(dateKey, deltaDays) {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + deltaDays);
  return formatDateKey(date);
}

export function getDayBoundsForMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const minDayKey = formatDateKey(new Date(year, month - 1, 1));
  const todayKey = formatDateKey(new Date());
  const lastOfMonth = formatDateKey(new Date(year, month, 0));
  const maxDayKey = getMonthKey(new Date()) === monthKey ? todayKey : lastOfMonth;
  return { minDayKey, maxDayKey };
}

export function groupTransactionsByDate(transactions) {
  return transactions.reduce((groups, transaction) => {
    const dateKey = formatRelativeDateLabel(transactionDate(transaction));

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});
}
