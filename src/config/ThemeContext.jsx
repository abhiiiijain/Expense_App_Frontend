import { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext({
  theme: "light",
  toggleTheme: () => {},
});

function getStoredTheme() {
  try {
    const stored = localStorage.getItem("sw-theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch (_e) {
    // ignore
  }
  return "light";
}

function applyTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem("sw-theme", theme);
  } catch (_e) {
    // ignore
  }
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const initial = getStoredTheme();
    if (typeof document !== "undefined") applyTheme(initial);
    return initial;
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      toggleTheme: () => setTheme((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
