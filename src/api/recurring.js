import { apiClient } from "./client";

export async function fetchRecurring({ active = true } = {}) {
  const { data } = await apiClient.get(`recurring?active=${active ? "true" : "false"}`);
  return data.recurring || [];
}

export async function createRecurring(payload) {
  const { data } = await apiClient.post("recurring", payload);
  return data;
}

export async function updateRecurring(id, payload) {
  const { data } = await apiClient.patch(`recurring/${id}`, payload);
  return data;
}

export async function fulfillRecurring(id, monthKey) {
  const { data } = await apiClient.post(`recurring/${id}/fulfill`, { monthKey });
  return data;
}
