import {
  DEFAULT_EDIT_WINDOW_MS,
  formatEditWindowLabel,
  editWindowToastMessage,
} from "./formatEditWindow.js";

export { DEFAULT_EDIT_WINDOW_MS, formatEditWindowLabel, editWindowToastMessage };

export function isInCurrentMonth(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();
  return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
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

/** Shared relative date label for charts and transaction groups. */
export function formatRelativeDateLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Date labels for the weekly chart axis (always calendar dates). */
export function formatChartDateLabel(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Full day label for chart tooltips. */
export function formatChartDayTooltip(date) {
  if (isToday(date)) return `Today · ${formatChartDateLabel(date)}`;
  if (isYesterday(date)) return `Yesterday · ${formatChartDateLabel(date)}`;
  return date.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function groupTransactionsByDate(transactions) {
  return transactions.reduce((groups, transaction) => {
    const dateKey = formatRelativeDateLabel(new Date(transaction.createdAt));

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});
}
