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

export function filterBySearch(transactions, query) {
  const q = query.trim().toLowerCase();
  if (!q) return transactions;
  return transactions.filter((tx) => {
    const haystack = `${tx.title} ${tx.category} ${tx.subcategory}`.toLowerCase();
    return haystack.includes(q);
  });
}
