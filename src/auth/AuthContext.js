import { createContext, useContext, useEffect, useState } from "react";
import {
  getStoredAuth,
  fetchMe,
  clearAuth,
  logout as logoutService,
} from "./authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const { user: storedUser, token } = getStoredAuth();
      if (!token || !storedUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const me = await fetchMe();
        setUser({ ...storedUser, ...me });
      } catch {
        clearAuth();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const logout = () => {
    logoutService();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
