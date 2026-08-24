import { apiClient } from "./client";

const DEFAULT_CONFIG = {
  editWindowMs: 24 * 60 * 60 * 1000,
};

export async function fetchAppConfig() {
  const { data } = await apiClient.get("config");
  return {
    editWindowMs: data.editWindowMs ?? DEFAULT_CONFIG.editWindowMs,
  };
}

export { DEFAULT_CONFIG };
