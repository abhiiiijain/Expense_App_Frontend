/** Sum transaction amounts grouped by account (non-zero only, highest first). */
export function sumByAccount(transactions, accounts) {
  const totals = {};
  for (const tx of transactions) {
    const id = String(tx.accountId);
    totals[id] = (totals[id] || 0) + tx.amount;
  }
  return accounts
    .map((account) => ({
      id: account.id,
      name: account.name,
      total: totals[String(account.id)] || 0,
    }))
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);
}
