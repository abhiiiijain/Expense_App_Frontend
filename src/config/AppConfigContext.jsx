import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONFIG, fetchAppConfig } from "../api/config";

const AppConfigContext = createContext(DEFAULT_CONFIG);
const CONFIG_POLL_MS = import.meta.env.DEV ? 2000 : 0;

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;
    let serialized = "";

    const load = async () => {
      try {
        const next = await fetchAppConfig();
        const asText = JSON.stringify(next);
        if (cancelled || asText === serialized) return;
        serialized = asText;
        setConfig(next);
      } catch {
        // Keep bundled fallback taxonomy when the API is unavailable
      }
    };

    load();
    if (!CONFIG_POLL_MS) return undefined;
    const id = setInterval(load, CONFIG_POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return <AppConfigContext.Provider value={config}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}

/** Categories + subcategories from GET /config (backend is source of truth in production). */
export function useCategories() {
  const {
    expenseCategories,
    expenseCategoryNames,
    expenseSubcategories,
    expenseFilterCategories,
    incomeCategoryNames,
    incomeSubcategories,
    incomeFilterCategories,
  } = useAppConfig();

  return {
    expenseCategories,
    expenseCategoryNames,
    expenseSubcategories,
    expenseFilterCategories,
    incomeCategoryNames,
    incomeSubcategories,
    incomeFilterCategories,
  };
}
