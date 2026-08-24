import { apiClient } from "./client";

const PAGE_SIZE = 500;

export async function fetchTransactions() {
  let skip = 0;
  const expenses = [];
  const incomes = [];

  while (true) {
    const { data } = await apiClient.get(`transactions?limit=${PAGE_SIZE}&skip=${skip}`);
    expenses.push(...data.expenses);
    incomes.push(...data.incomes);

    const expenseTotal = data.meta?.expenseTotal ?? expenses.length;
    const incomeTotal = data.meta?.incomeTotal ?? incomes.length;

    const loadedAllExpenses =
      data.expenses.length < PAGE_SIZE || expenses.length >= expenseTotal;
    const loadedAllIncomes =
      data.incomes.length < PAGE_SIZE || incomes.length >= incomeTotal;

    if (loadedAllExpenses && loadedAllIncomes) {
      break;
    }

    skip += PAGE_SIZE;
  }

  return { expenses, incomes };
}

export async function createTransaction(transaction) {
  const endpoint = transaction.type === "income" ? "add-income" : "add-expense";
  const { title, amount, category, subcategory, icon } = transaction;
  const { data } = await apiClient.post(endpoint, {
    title,
    amount,
    category,
    subcategory,
    icon,
  });
  return data;
}

export async function updateTransaction(type, id, transaction) {
  const endpoint = type === "income" ? `update-income/${id}` : `update-expense/${id}`;
  const { title, amount, category, subcategory, icon } = transaction;
  const { data } = await apiClient.put(endpoint, {
    title,
    amount,
    category,
    subcategory,
    icon,
  });
  return data;
}

export async function deleteTransaction(type, id) {
  const endpoint = type === "income" ? `delete-income/${id}` : `delete-expense/${id}`;
  await apiClient.delete(endpoint);
}
