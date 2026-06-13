function ensureTrailingSlash(url) {
  return `${url.replace(/\/+$/, "")}/`;
}

function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getApiBaseUrl() {
  const host = required("REACT_APP_API_HOST");
  const port = required("REACT_APP_API_PORT");
  const path = required("REACT_APP_API_PATH");
  const protocol = required("REACT_APP_API_PROTOCOL");

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return ensureTrailingSlash(`${protocol}://${host}:${port}${normalizedPath}`);
}
