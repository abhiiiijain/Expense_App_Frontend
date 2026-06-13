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

export function isToday(date) {
  return date.toDateString() === new Date().toDateString();
}

export function isYesterday(date) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function formatChartLabel(date) {
  if (isToday(date)) return "Today";
  if (isYesterday(date)) return "Yesterday";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export function groupTransactionsByDate(transactions) {
  return transactions.reduce((groups, transaction) => {
    const date = new Date(transaction.createdAt);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    let dateKey;
    if (date.toDateString() === today.toDateString()) {
      dateKey = "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateKey = "Yesterday";
    } else {
      dateKey = date.toLocaleDateString();
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {});
}
