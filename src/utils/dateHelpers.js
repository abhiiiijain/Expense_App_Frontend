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

export function creditCycleForAccount(account) {
  if (account?.type !== "credit") return null;
  return resolveCreditCycle(account);
}

export function formatMonthDayOrdinal(day) {
  const n = Number(day);
  if (!Number.isInteger(n) || n < 1) return "";
  const remainder = n % 100;
  if (remainder >= 11 && remainder <= 13) return `${n}th`;
  switch (n % 10) {
    case 1:
      return `${n}st`;
    case 2:
      return `${n}nd`;
    case 3:
      return `${n}rd`;
    default:
      return `${n}th`;
  }
}

function resolveCreditCycle(cycle) {
  if (!cycle || cycle === "calendar") return null;
  const statementDay = Number(cycle.statementDay);
  const dueDay = Number(cycle.dueDay);
  if (statementDay >= 1 && statementDay <= 28 && dueDay >= 1 && dueDay <= 28) {
    return { statementDay, dueDay };
  }
  return null;
}

export function isCreditCycle(cycle) {
  return Boolean(resolveCreditCycle(cycle));
}

/** Statement month a card transaction belongs to (cycle ends on statement day). */
function getCreditCycleMonthKey(dateInput = new Date(), spec) {
  const date = new Date(dateInput);
  if (!Number.isFinite(date.getTime())) return getMonthKey();
  if (date.getDate() <= spec.statementDay) return getMonthKey(date);
  return getMonthKey(new Date(date.getFullYear(), date.getMonth() + 1, 1));
}

export function getPeriodMonthKey(dateInput = new Date(), cycle = "calendar") {
  const spec = resolveCreditCycle(cycle);
  return spec ? getCreditCycleMonthKey(dateInput, spec) : getMonthKey(dateInput);
}

export function isInPeriod(dateInput, monthKey, cycle = "calendar") {
  return getPeriodMonthKey(dateInput, cycle) === monthKey;
}

/** Inclusive cycle for the statement generated on statement day of `monthKey`. */
export function getCreditCycleBounds(monthKey, cycle) {
  const spec = resolveCreditCycle(cycle);
  if (!spec) return { start: null, statement: null, due: null };
  const [year, month] = monthKey.split("-").map(Number);
  const start = new Date(year, month - 2, spec.statementDay + 1);
  const statement = new Date(year, month - 1, spec.statementDay);
  const due = new Date(year, month, spec.dueDay);
  return { start, statement, due };
}

export function formatCreditCycleRange(monthKey, cycle) {
  const { start, statement } = getCreditCycleBounds(monthKey, cycle);
  if (!start || !statement) return "";
  return `${formatChartDateLabel(start)} – ${formatChartDateLabel(statement)}`;
}

export function formatCreditDueLabel(monthKey, cycle) {
  const { due } = getCreditCycleBounds(monthKey, cycle);
  return due ? `Due ${formatChartDateLabel(due)}` : "";
}

export function formatCreditStatementHint(monthKey, cycle) {
  const { statement, due } = getCreditCycleBounds(monthKey, cycle);
  if (!statement || !due) return "Unused limit is not included";
  return `Statement ${formatChartDateLabel(statement)} · due ${formatChartDateLabel(due)} · unused limit is not included`;
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

export function formatChartDateLabel(date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function formatRelativeDateLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return formatChartDateLabel(date);
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

export function getDayBoundsForMonth(monthKey, cycle = "calendar") {
  const todayKey = formatDateKey(new Date());
  if (isCreditCycle(cycle)) {
    const { start, statement } = getCreditCycleBounds(monthKey, cycle);
    const minDayKey = formatDateKey(start);
    const statementKey = formatDateKey(statement);
    const maxDayKey = todayKey < statementKey ? todayKey : statementKey;
    return { minDayKey, maxDayKey };
  }
  const [year, month] = monthKey.split("-").map(Number);
  const minDayKey = formatDateKey(new Date(year, month - 1, 1));
  const lastOfMonth = formatDateKey(new Date(year, month, 0));
  const maxDayKey = getMonthKey(new Date()) === monthKey ? todayKey : lastOfMonth;
  return { minDayKey, maxDayKey };
}

function sameDayOrder(a, b) {
  const aId = String(a?._id || "");
  const bId = String(b?._id || "");
  if (aId && bId && aId !== bId) return bId.localeCompare(aId);
  return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
}

export function sortTransactionsNewestFirst(transactions, { oldestFirst = false } = {}) {
  return [...(transactions || [])].sort((a, b) => {
    const byDate = transactionDate(b).getTime() - transactionDate(a).getTime();
    if (byDate) return oldestFirst ? -byDate : byDate;
    return oldestFirst ? sameDayOrder(b, a) : sameDayOrder(a, b);
  });
}

export function groupTransactionsByDate(transactions, { oldestFirst = false } = {}) {
  const groups = {};
  for (const transaction of sortTransactionsNewestFirst(transactions, { oldestFirst })) {
    const dateKey = formatDateKey(transactionDate(transaction));
    if (!groups[dateKey]) groups[dateKey] = [];
    groups[dateKey].push(transaction);
  }
  return groups;
}
