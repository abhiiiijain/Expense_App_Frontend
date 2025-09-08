import axios from "axios";

// export const API_BASE_URL =
//   process.env.REACT_APP_API_BASE_URL ||
//   "http://localhost:5000/api/v1/";

export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "https://expense-app-backend-avc9.onrender.com/api/v1/";

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

export function saveAuth(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

export function authHeader() {
  const { token } = getStoredAuth();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function login(email, password) {
  const { data } = await axios.post(`${API_BASE_URL}auth/login`, { email, password });
  saveAuth(data.token, data.user);
  return data.user;
}

export async function registerUser({ firstName, lastName, email, password }) {
  const { data } = await axios.post(`${API_BASE_URL}auth/register`, {
    firstName,
    lastName,
    email,
    password,
  });
  // Optionally log user in immediately after registration:
  saveAuth(data.token, data.user);
  return data.user;
}

export async function fetchMe() {
  const headers = authHeader();
  if (!headers.Authorization) return null;
  const { data } = await axios.get(`${API_BASE_URL}auth/me`, { headers });
  return data;
}

export function logout() {
  clearAuth();
}

