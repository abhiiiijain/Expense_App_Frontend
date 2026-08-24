import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_CONFIG, fetchAppConfig } from "../api/config";

const AppConfigContext = createContext(DEFAULT_CONFIG);

export function AppConfigProvider({ children }) {
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    fetchAppConfig()
      .then(setConfig)
      .catch(() => {
        // Keep defaults when config endpoint is unavailable
      });
  }, []);

  const value = useMemo(() => config, [config]);

  return <AppConfigContext.Provider value={value}>{children}</AppConfigContext.Provider>;
}

export function useAppConfig() {
  return useContext(AppConfigContext);
}
