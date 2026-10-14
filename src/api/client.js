import axios from "axios";
import { getApiBaseUrl } from "../config/api";
import { getAppSession } from "../auth/appSession";

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
});

let onUnauthorized = null;
let onAppLocked = null;

export function setOnUnauthorized(callback) {
  onUnauthorized = callback;
}

export function setOnAppLocked(callback) {
  onAppLocked = callback;
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const appSession = getAppSession();
  if (appSession) {
    config.headers["X-App-Session"] = appSession;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const code = error?.response?.data?.code;
    if (status === 401 && onUnauthorized) {
      onUnauthorized();
    } else if (code === "APP_LOCKED" && onAppLocked) {
      onAppLocked();
    }
    return Promise.reject(error);
  }
);

export { apiClient };
