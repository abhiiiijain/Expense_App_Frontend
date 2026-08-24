import { apiClient } from "../api/client";

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

export async function registerUser({ firstName, lastName, email, password, openingBalance }) {
  const { data } = await apiClient.post("auth/register", {
    firstName,
    lastName,
    email,
    password,
    openingBalance,
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

export async function updateOpeningBalance(openingBalance) {
  const { data } = await apiClient.put("auth/opening-balance", { openingBalance });
  const { token } = getStoredAuth();
  if (token) {
    saveAuth(token, data);
  }
  return data;
}
