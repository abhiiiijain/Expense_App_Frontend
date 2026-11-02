import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth/AuthContext";

const ChartHiddenCategoriesContext = createContext(null);

function storageKey(userId) {
  return `spendwise.chartHiddenCategories.${userId || "anon"}`;
}

function readHidden(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function writeHidden(userId, names) {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(names));
  } catch {
    /* ignore quota */
  }
}

export function omitHiddenCategorySums(categorySums, hiddenSet) {
  if (!hiddenSet?.size) return categorySums || {};
  const next = {};
  for (const [name, total] of Object.entries(categorySums || {})) {
    if (!hiddenSet.has(name)) next[name] = total;
  }
  return next;
}

export function omitHiddenSubcategorySums(subcategorySums, hiddenSet) {
  if (!hiddenSet?.size) return subcategorySums || {};
  const next = {};
  for (const [name, subs] of Object.entries(subcategorySums || {})) {
    if (!hiddenSet.has(name)) next[name] = subs;
  }
  return next;
}

export function filterExpensesForCharts(expenses, hiddenSet) {
  if (!hiddenSet?.size) return expenses || [];
  return (expenses || []).filter((row) => !hiddenSet.has(String(row.category || "")));
}

export function sumCategoryAmounts(categorySums) {
  return Object.values(categorySums || {}).reduce((sum, value) => sum + (Number(value) || 0), 0);
}

/** Rebuild by-month totals after chart categories are hidden (no extra API call). */
export function monthlyTotalsWithoutHidden(monthlyCategoryTotals, hiddenSet, fallbackMonthlyTotals) {
  if (!Array.isArray(monthlyCategoryTotals) || !monthlyCategoryTotals.length) {
    return fallbackMonthlyTotals || [];
  }
  const sums = {};
  for (const row of monthlyCategoryTotals) {
    if (hiddenSet?.has(String(row.category || ""))) continue;
    const key = row.monthKey;
    if (!key) continue;
    sums[key] = (sums[key] || 0) + (Number(row.total) || 0);
  }
  return Object.keys(sums)
    .sort((a, b) => b.localeCompare(a))
    .map((monthKey) => ({ monthKey, total: Math.max(0, sums[monthKey]) }));
}

export function ChartHiddenCategoriesProvider({ children }) {
  const { user } = useAuth();
  const userId = String(user?.id || user?._id || "");
  const [hidden, setHidden] = useState(() => readHidden(userId));

  useEffect(() => {
    setHidden(readHidden(userId));
  }, [userId]);

  const hiddenSet = useMemo(() => new Set(hidden), [hidden]);

  const hideCategory = useCallback(
    (name) => {
      const key = String(name || "");
      if (!key) return;
      setHidden((prev) => {
        if (prev.includes(key)) return prev;
        const next = [...prev, key];
        writeHidden(userId, next);
        return next;
      });
    },
    [userId]
  );

  const showCategory = useCallback(
    (name) => {
      const key = String(name || "");
      setHidden((prev) => {
        const next = prev.filter((row) => row !== key);
        writeHidden(userId, next);
        return next;
      });
    },
    [userId]
  );

  const value = useMemo(
    () => ({
      hiddenCategories: hidden,
      hiddenSet,
      hideCategory,
      showCategory,
    }),
    [hidden, hiddenSet, hideCategory, showCategory]
  );

  return (
    <ChartHiddenCategoriesContext.Provider value={value}>
      {children}
    </ChartHiddenCategoriesContext.Provider>
  );
}

export function useChartHiddenCategories() {
  const context = useContext(ChartHiddenCategoriesContext);
  if (!context) {
    throw new Error("useChartHiddenCategories must be used within ChartHiddenCategoriesProvider");
  }
  return context;
}
