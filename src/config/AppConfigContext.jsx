import { createContext, useContext, useEffect, useState } from "react";
import { DEFAULT_CONFIG, fetchAppConfig } from "../api/config";

const AppConfigContext = createContext(DEFAULT_CONFIG);

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const next = await fetchAppConfig();
        if (!cancelled) setConfig(next);
      } catch {
        // Keep bundled fallback taxonomy when the API is unavailable
      }
    };

    load();
    return () => {
      cancelled = true;
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
