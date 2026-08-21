import { apiClient } from "./client";

export async function fetchTransactions() {
  const { data } = await apiClient.get("transactions");
  return data;
}

export async function createTransaction(transaction) {
  const endpoint = transaction.type === "income" ? "add-income" : "add-expense";
  const { data } = await apiClient.post(endpoint, transaction);
  return data;
}

export async function deleteTransaction(type, id) {
  const endpoint = type === "income" ? `delete-income/${id}` : `delete-expense/${id}`;
  await apiClient.delete(endpoint);
}
