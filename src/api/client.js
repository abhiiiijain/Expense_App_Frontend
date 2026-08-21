import axios from "axios";
import { getApiBaseUrl } from "../config/api";

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

let onUnauthorized = null;

export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && onUnauthorized) {
      onUnauthorized();
    }
    return Promise.reject(error);
  }
);

export { apiClient };
