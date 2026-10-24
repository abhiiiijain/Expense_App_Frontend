import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { getAppSession, getAppSessionGeneration, setAppSession, subscribeAppSession } from "./appSession";
import { refreshAppSession } from "./authService";
import { setOnAppLocked } from "../api/client";
import { useAuth } from "./AuthContext";

const AppLockContext = createContext(null);
const REFRESH_MS = 30_000;
const LOCK_ON_HIDE = !import.meta.env.DEV;

export function AppLockProvider({ children }) {
  const { user } = useAuth();
  const [session, setSession] = useState(getAppSession);

  const lock = useCallback(() => {
    setAppSession(null);
  }, []);

  useEffect(() => subscribeAppSession(setSession), []);

  useEffect(() => {
    setOnAppLocked(lock);
  }, [lock]);

  useEffect(() => {
    if (!user) {
      lock();
    }
  }, [user, lock]);

  useEffect(() => {
    if (!LOCK_ON_HIDE) return undefined;

    const hide = () => {
      if (document.visibilityState === "hidden") {
        lock();
      }
    };
    const onPageHide = () => lock();

    document.addEventListener("visibilitychange", hide);
    window.addEventListener("pagehide", onPageHide);
    return () => {
      document.removeEventListener("visibilitychange", hide);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [lock]);

  const unlocked = Boolean(user && session);

  useEffect(() => {
    if (!unlocked) return undefined;

    const generation = getAppSessionGeneration();
    const timer = window.setInterval(async () => {
      if (LOCK_ON_HIDE && document.visibilityState !== "visible") return;
      try {
        const next = await refreshAppSession();
        if (getAppSessionGeneration() !== generation) return;
        setAppSession(next);
      } catch (error) {
        if (error?.response?.data?.code === "APP_LOCKED") {
          lock();
        }
      }
    }, REFRESH_MS);

    return () => window.clearInterval(timer);
  }, [unlocked, lock]);

  const value = useMemo(() => ({ unlocked }), [unlocked]);

  return <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>;
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error("useAppLock must be used within AppLockProvider");
  }
  return context;
}
