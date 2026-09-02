import { useMemo } from "react";
import { sumByAccount } from "../utils/sumByAccount";

/** Per-account totals when viewing all accounts combined. */
export function useAccountExpenseTotals(expenses, accounts, accountFilter, enabled = true) {
  return useMemo(() => {
    if (!enabled || accountFilter !== "all" || accounts.length <= 1) return [];
    return sumByAccount(expenses, accounts);
  }, [expenses, accounts, accountFilter, enabled]);
}
