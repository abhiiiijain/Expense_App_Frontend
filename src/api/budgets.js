import { apiClient } from "./client";

export async function fetchBudgets(monthKey) {
  const { data } = await apiClient.get(`budgets?month=${encodeURIComponent(monthKey)}`);
  return data.budgets;
}

export async function upsertBudget({ monthKey, category, amount }) {
  const { data } = await apiClient.put("budgets", { monthKey, category, amount });
  return data;
}
