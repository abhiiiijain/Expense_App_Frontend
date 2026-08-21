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
