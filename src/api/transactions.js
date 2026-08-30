import { apiClient } from "./client";

const PAGE_SIZE = 500;

function txPayload(transaction) {
  const { title, amount, category, subcategory, icon, date, accountId } = transaction;
  return { title, amount, category, subcategory, icon, date, accountId };
}

export async function fetchTransactions({ month, days, q, accountId } = {}) {
  let skip = 0;
  const expenses = [];
  const incomes = [];
  const transfers = [];
  const params = new URLSearchParams({ limit: String(PAGE_SIZE) });
  if (month) params.set("month", month);
  if (days) params.set("days", String(days));
  if (q) params.set("q", q);
  if (accountId) params.set("accountId", accountId);

  while (true) {
    params.set("skip", String(skip));
    const { data } = await apiClient.get(`transactions?${params.toString()}`);
    expenses.push(...data.expenses);
    incomes.push(...data.incomes);
    transfers.push(...(data.transfers || []));

    const expenseTotal = data.meta?.expenseTotal ?? expenses.length;
    const incomeTotal = data.meta?.incomeTotal ?? incomes.length;
    const transferTotal = data.meta?.transferTotal ?? transfers.length;

    const loadedAllExpenses =
      data.expenses.length < PAGE_SIZE || expenses.length >= expenseTotal;
    const loadedAllIncomes =
      data.incomes.length < PAGE_SIZE || incomes.length >= incomeTotal;
    const loadedAllTransfers =
      (data.transfers?.length ?? 0) < PAGE_SIZE || transfers.length >= transferTotal;

    if (loadedAllExpenses && loadedAllIncomes && loadedAllTransfers) {
      break;
    }

    skip += PAGE_SIZE;
  }

  return { expenses, incomes, transfers };
}

export async function createTransaction(transaction) {
  const endpoint = transaction.type === "income" ? "add-income" : "add-expense";
  const { data } = await apiClient.post(endpoint, txPayload(transaction));
  return data;
}

export async function updateTransaction(type, id, transaction) {
  const endpoint = type === "income" ? `update-income/${id}` : `update-expense/${id}`;
  const { data } = await apiClient.put(endpoint, txPayload(transaction));
  return data;
}

export async function deleteTransaction(type, id) {
  const endpoint = type === "income" ? `delete-income/${id}` : `delete-expense/${id}`;
  await apiClient.delete(endpoint);
}
