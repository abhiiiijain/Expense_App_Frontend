import { apiClient } from "./client";

export async function createTransfer(payload) {
  const { data } = await apiClient.post("transfers", payload);
  return data;
}

export async function deleteTransfer(id) {
  await apiClient.delete(`transfers/${id}`);
}
