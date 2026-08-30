import { apiClient } from "./client";

export async function fetchAccounts() {
  const { data } = await apiClient.get("accounts");
  return {
    accounts: data.accounts || [],
    hasTransactions: Boolean(data.hasTransactions),
  };
}

export async function createAccount(payload) {
  const { data } = await apiClient.post("accounts", payload);
  return data;
}

export async function updateAccount(id, payload) {
  const { data } = await apiClient.put(`accounts/${id}`, payload);
  return data;
}

export async function deleteAccount(id) {
  await apiClient.delete(`accounts/${id}`);
}
