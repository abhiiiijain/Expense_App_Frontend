export function filterByAccount(items, accountFilter) {
  if (!accountFilter || accountFilter === "all") return items;
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
