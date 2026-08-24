import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CONFIG, fetchAppConfig } from "../api/config";

const AppConfigContext = createContext(DEFAULT_CONFIG);

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    fetchAppConfig()
      .then(setConfig)
      .catch(() => {
        // Keep bundled fallback taxonomy when the API is unavailable
      });
  }, []);

  const value = useMemo(() => config, [config]);

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
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
    loaded,
  } = useAppConfig();

  return {
    expenseCategories,
    expenseCategoryNames,
    expenseSubcategories,
    expenseFilterCategories,
    incomeCategoryNames,
    incomeSubcategories,
    incomeFilterCategories,
    loaded,
  };
}
