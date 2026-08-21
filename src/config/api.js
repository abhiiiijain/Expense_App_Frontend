/** Must match backend API_PREFIX */
const API_PREFIX = "/api/v1";

function required(name) {
  const value = import.meta.env[name];
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Backend origin only in env, e.g. https://expense-app-backend-srz0.onrender.com
 * `/api/v1/` is appended here so Vercel only needs the host.
 */
export function getApiBaseUrl() {
  const origin = required("VITE_API_BASE_URL")
    .trim()
    .replace(/\/+$/, "")
    .replace(/\/api\/v1$/i, "");

  return `${origin}${API_PREFIX}/`;
}
