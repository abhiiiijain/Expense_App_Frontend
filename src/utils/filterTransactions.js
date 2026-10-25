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
