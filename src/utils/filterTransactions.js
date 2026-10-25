export function filterByAccount(items, accountFilter) {
  if (accountFilter === "all") return items;
  const id = String(accountFilter);
  return items.filter(
    (tx) =>
      String(tx.accountId) === id ||
      String(tx.fromAccountId) === id ||
      String(tx.toAccountId) === id
  );
}

export function filterByCategory(transactions, mainCategory, subcategory) {
  if (!mainCategory || mainCategory === "All") {
    return transactions;
  }

  const byCategory = transactions.filter(
    (transaction) => transaction.category === mainCategory
  );

  if (!subcategory || subcategory === "All") {
    return byCategory;
  }

  return byCategory.filter((transaction) => transaction.subcategory === subcategory);
}

function normalizeAmountQuery(query) {
  return String(query || "")
    .trim()
    .replace(/[₹,\s]/g, "")
    .replace(/^rs/i, "")
    .replace(/^[-+]/, "");
}

function amountMatchesQuery(amount, query) {
  const q = normalizeAmountQuery(query);
  if (!/^\d+(\.\d+)?$/.test(q)) return false;
  const n = Number(amount);
  if (!Number.isFinite(n)) return false;
  const printed = Math.abs(n).toFixed(2);
  if (q.includes(".")) return printed.startsWith(q);
  const rupees = printed.slice(0, printed.indexOf("."));
  return rupees === q;
}

function matchesSearch(query, { text = "", amount } = {}) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return true;
  if (String(text).toLowerCase().includes(q)) return true;
  return amountMatchesQuery(amount, query);
}

export function filterBySearch(transactions, query, extraText) {
  const q = String(query || "").trim();
  if (!q) return transactions;
  return transactions.filter((tx) =>
    matchesSearch(q, {
      text: `${tx.title || ""} ${tx.category || ""} ${tx.subcategory || ""} ${tx.note || ""} ${
        extraText ? extraText(tx) : ""
      }`,
      amount: tx.amount,
    })
  );
}
