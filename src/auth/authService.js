import axios from "axios";
import { getApiBaseUrl } from "../config/api";

const apiClient = axios.create({ baseURL: getApiBaseUrl() });

export { apiClient };

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
    if (error?.response?.status === 401) {
      if (onUnauthorized) {
        onUnauthorized();
      }
    }
    return Promise.reject(error);
  }
);

export function getStoredAuth() {
  try {
    const token = localStorage.getItem("token");
    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;
    return { token, user };
  } catch (_e) {
    return { token: null, user: null };
  }
}

function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export async function login(email, password) {
  const { data } = await apiClient.post("auth/login", { email, password });
  saveAuth(data.token, data.user);
  return data.user;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const { data } = await apiClient.post("auth/register", {
    firstName,
    lastName,
    email,
    password,
  });
  saveAuth(data.token, data.user);
  return data.user;
}

export async function fetchMe() {
  const { token } = getStoredAuth();
  if (!token) return null;
  const { data } = await apiClient.get("auth/me");
  return data;
}

export function logout() {
  clearAuth();
}

export async function fetchTransactions() {
  const { data } = await apiClient.get("transactions");
  return data;
}
