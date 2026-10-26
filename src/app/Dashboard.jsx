import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../config/chartSetup";
import Transactions from "../components/Transactions";
import SummaryCards from "../components/SummaryCards";
import AddExpenseModal from "../components/AddExpenseModal";
import OpeningBalanceModal from "../components/OpeningBalanceModal";
import CategoryBreakdown from "../components/charts/CategoryBreakdown";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import DailyBreakdown from "../components/charts/DailyBreakdown";
import MonthSwitcher from "../components/MonthSwitcher";
import BudgetModal from "../components/BudgetModal";
import AccountsModal from "../components/AccountsModal";
import ProfileSecurityModal from "../components/ProfileSecurityModal";
import OnboardingChecklist from "../components/OnboardingChecklist";
import { updateOpeningBalance } from "../auth/authService";
import {
  fetchMonthTransactions,
  fetchTransactionsRange,
  fetchSpendingStats,
  fetchDashboardStamp,
  createTransaction,
  updateTransaction as updateTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
} from "../api/transactions";
import { createTransfer, deleteTransfer as deleteTransferRequest } from "../api/transfers";
import { useAuth } from "../auth/AuthContext";
import { useAppConfig } from "../config/AppConfigContext";
import { useTheme } from "../config/ThemeContext";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useCategorySums, useMonthTotal } from "../hooks/useExpenseAnalytics";
import MonthlySpendList from "../components/charts/MonthlySpendList";
import BrandLogo from "../components/BrandLogo";
import {
  getMonthKey,
  isTransactionEditable,
  formatMonthLabel,
  formatCreditDueLabel,
  formatCreditStatementHint,
  creditCycleForAccount,
  formatDateKey,
  subDays,
} from "../utils/dateHelpers";
import { editWindowToastMessage } from "../utils/formatEditWindow";
import { buildTransactionsCsv } from "../utils/exportCsv";
import { filterByAccount, filterByCategory } from "../utils/filterTransactions";
import {
  cardPaymentSpendAdjustments,
  filterCardPaymentsForAccount,
  isCardPaymentExpense,
} from "../utils/creditCardPayments";
import { expensesNetOfRefunds, isSpendRefund } from "../utils/spendRefunds";
import { toast } from "react-toastify";

function isCreditAccount(account) {
  return account?.type === "credit";
}

function summaryFromMonthData(monthData, accountFilter) {
  const rows = monthData.accounts || [];
  if (accountFilter && accountFilter !== "all") {
    const account = rows.find((row) => String(row.id) === String(accountFilter));
    if (account) {
      return {
        monthStartOpening: account.monthStartOpening ?? monthData.monthStartOpening ?? 0,
        statementOpening:
          account.statementOpening ??
          account.monthStartOpening ??
          monthData.statementOpening ??
          monthData.monthStartOpening ??
          0,
        monthEndBalance: account.monthEndBalance ?? account.balance ?? monthData.monthEndBalance ?? 0,
        creditBill: account.creditBill || monthData.creditBill || null,
      };
    }
  }
  return {
    monthStartOpening: monthData.monthStartOpening ?? 0,
    statementOpening: monthData.statementOpening ?? monthData.monthStartOpening ?? 0,
    monthEndBalance: monthData.monthEndBalance ?? 0,
    creditBill: monthData.creditBill || null,
  };
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const { editWindowMs, expenseCategoryNames } = useAppConfig();
  const { theme, toggleTheme } = useTheme();
  const { canInstall, install } = usePwaInstall();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [monthKey, setMonthKey] = useState(() => getMonthKey());
  const [accountFilter, setAccountFilter] = useState("all");
  const [expenseCategory, setExpenseCategory] = useState("All");
  const [expenseSubcategory, setExpenseSubcategory] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openingModalRequired, setOpeningModalRequired] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [budgetsOpen, setBudgetsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [monthStartOpening, setMonthStartOpening] = useState(0);
  const [statementOpening, setStatementOpening] = useState(0);
  const [monthEndBalance, setMonthEndBalance] = useState(0);
  const [creditBill, setCreditBill] = useState(null);
  const [weekExpenses, setWeekExpenses] = useState([]);
  const [weekIncomes, setWeekIncomes] = useState([]);
  const [ledgerScope, setLedgerScope] = useState("");
  const [lifetimeStats, setLifetimeStats] = useState({
    categorySums: {},
    subcategorySums: {},
    monthlyTotals: [],
    total: 0,
  });

  const defaultAccount = accounts.find((a) => a.isDefault) || accounts[0];
  const defaultAccountId = defaultAccount?.id || "";
  const defaultAccountOpening = defaultAccount?.openingBalance ?? 0;

  const selectedAccount = useMemo(
    () =>
      accountFilter === "all"
        ? null
        : accounts.find((account) => String(account.id) === String(accountFilter)),
    [accountFilter, accounts]
  );
  const viewingCredit = isCreditAccount(selectedAccount);
  const creditCycle = creditCycleForAccount(selectedAccount);
  const periodCycle = creditCycle || "calendar";
  const expectedLedgerScope = viewingCredit
    ? `credit::${accountFilter}::${monthKey}`
    : `all::${monthKey}`;
  const ledgerMatchesView = ledgerScope === expectedLedgerScope;
  const sourceExpenses = ledgerMatchesView ? expenses : [];
  const sourceIncomes = ledgerMatchesView ? incomes : [];
  const sourceTransfers = ledgerMatchesView ? transfers : [];

  const { consumptionExpenses, cardPaymentExpenses } = useMemo(() => {
    const consumption = [];
    const payments = [];
    for (const expense of sourceExpenses) {
      if (isCardPaymentExpense(expense)) payments.push(expense);
      else if (accountFilter === "all" || String(expense.accountId) === String(accountFilter)) {
        consumption.push(expense);
      }
    }
    return { consumptionExpenses: consumption, cardPaymentExpenses: payments };
  }, [accountFilter, sourceExpenses]);

  const monthCardPayments = useMemo(
    () => filterCardPaymentsForAccount(cardPaymentExpenses, accountFilter, accounts),
    [accountFilter, accounts, cardPaymentExpenses]
  );
  const monthIncomes = useMemo(
    () => filterByAccount(sourceIncomes, accountFilter),
    [accountFilter, sourceIncomes]
  );
  const { spendRefunds, countedIncomes } = useMemo(() => {
    const refunds = [];
    const counted = [];
    for (const tx of monthIncomes) {
      if (isSpendRefund(tx)) refunds.push(tx);
      else counted.push(tx);
    }
    return { spendRefunds: refunds, countedIncomes: counted };
  }, [monthIncomes]);
  const netConsumptionExpenses = useMemo(
    () => expensesNetOfRefunds(consumptionExpenses, spendRefunds),
    [consumptionExpenses, spendRefunds]
  );
  const monthTransfers = useMemo(
    () => filterByAccount(sourceTransfers, accountFilter),
    [accountFilter, sourceTransfers]
  );
  const overviewMonthExpenses = useMemo(
    () => filterByCategory(netConsumptionExpenses, expenseCategory, expenseSubcategory),
    [netConsumptionExpenses, expenseCategory, expenseSubcategory]
  );
  const weekOverviewExpenses = useMemo(() => {
    const weekConsumption = filterByAccount(
      weekExpenses.filter((expense) => !isCardPaymentExpense(expense)),
      accountFilter
    );
    const weekRefunds = filterByAccount(weekIncomes, accountFilter).filter(isSpendRefund);
    return filterByCategory(
      expensesNetOfRefunds(weekConsumption, weekRefunds, consumptionExpenses),
      expenseCategory,
      expenseSubcategory
    );
  }, [
    accountFilter,
    consumptionExpenses,
    weekExpenses,
    weekIncomes,
    expenseCategory,
    expenseSubcategory,
  ]);

  const categorySums = useCategorySums(overviewMonthExpenses, expenseCategoryNames);
  const monthBudgetSums = useCategorySums(netConsumptionExpenses, expenseCategoryNames);
  const rawMonthExpenseTotal = useMonthTotal(netConsumptionExpenses);
  const monthExpenseTotal = Math.max(0, rawMonthExpenseTotal);
  const overviewMonthExpenseTotal = Math.max(0, useMonthTotal(overviewMonthExpenses));
  const monthIncomeTotal = useMonthTotal(countedIncomes);
  const cardSpendAdjustments = useMemo(
    () =>
      accountFilter === "all"
        ? cardPaymentSpendAdjustments(monthCardPayments, accounts)
        : { outside: 0, unmatched: 0 },
    [accountFilter, accounts, monthCardPayments]
  );
  const lifetimeCategorySums = lifetimeStats.categorySums || {};
  const lifetimeExpenseTotal = lifetimeStats.total || 0;
  const headerSummary = viewingCredit
    ? { monthStartOpening, statementOpening, monthEndBalance, creditBill }
    : summaryFromMonthData(
        { accounts, monthStartOpening, statementOpening, monthEndBalance, creditBill },
        accountFilter
      );

  const handleExpenseCategoryChange = useCallback((category) => {
    setExpenseCategory(category);
    setExpenseSubcategory("All");
  }, []);

  const accountsRef = useRef(accounts);
  accountsRef.current = accounts;
  const ledgerCacheRef = useRef(new Map());
  const weekCacheRef = useRef(new Map());
  const statsCacheRef = useRef(new Map());
  const loadGenRef = useRef(0);

  const loadLedger = useCallback(async ({ force = false } = {}) => {
    const gen = ++loadGenRef.current;
    const today = formatDateKey(new Date());
    const weekFrom = formatDateKey(subDays(new Date(), 6));
    const selected =
      accountFilter === "all"
        ? null
        : accountsRef.current.find((account) => String(account.id) === String(accountFilter));
    const credit = isCreditAccount(selected);
    const monthCacheKey = credit ? `credit::${accountFilter}::${monthKey}` : `all::${monthKey}`;
    const weekCacheKey = `${weekFrom}::${today}`;

    let monthData = !force ? ledgerCacheRef.current.get(monthCacheKey) : undefined;
    if (!monthData) {
      monthData = await fetchMonthTransactions({
        monthKey,
        accountId: credit ? accountFilter : undefined,
      });
      if (gen !== loadGenRef.current) return;
      ledgerCacheRef.current.set(monthCacheKey, monthData);
    } else if (gen !== loadGenRef.current) {
      return;
    }

    const selectedFromPayload =
      accountFilter === "all"
        ? null
        : (monthData.accounts || []).find(
            (account) => String(account.id) === String(accountFilter)
          );
    if (isCreditAccount(selectedFromPayload) && !credit) {
      const creditKey = `credit::${accountFilter}::${monthKey}`;
      let creditData = !force ? ledgerCacheRef.current.get(creditKey) : undefined;
      if (!creditData) {
        creditData = await fetchMonthTransactions({ monthKey, accountId: accountFilter });
        if (gen !== loadGenRef.current) return;
        ledgerCacheRef.current.set(creditKey, creditData);
      } else if (gen !== loadGenRef.current) {
        return;
      }
      monthData = creditData;
    }

    const rows = monthData.accounts || [];
    const summary = summaryFromMonthData(monthData, accountFilter);
    setAccounts(rows);
    setHasTransactions(Boolean(monthData.hasTransactions));
    setExpenses(monthData.expenses || []);
    setIncomes(monthData.incomes || []);
    setTransfers(monthData.transfers || []);
    setMonthStartOpening(summary.monthStartOpening);
    setStatementOpening(summary.statementOpening);
    setMonthEndBalance(summary.monthEndBalance);
    setCreditBill(summary.creditBill);
    const usingCredit = isCreditAccount(
      accountFilter === "all"
        ? null
        : rows.find((account) => String(account.id) === String(accountFilter))
    );
    setLedgerScope(usingCredit ? `credit::${accountFilter}::${monthKey}` : `all::${monthKey}`);

    const weekCoveredByMonth =
      !usingCredit && monthKey === getMonthKey() && weekFrom.slice(0, 7) === monthKey;

    const inWeek = (tx) => {
      const key = formatDateKey(new Date(tx.date || tx.createdAt));
      return key >= weekFrom && key <= today;
    };

    if (weekCoveredByMonth) {
      const nextWeek = {
        expenses: (monthData.expenses || []).filter(inWeek),
        incomes: (monthData.incomes || []).filter(inWeek),
      };
      setWeekExpenses(nextWeek.expenses);
      setWeekIncomes(nextWeek.incomes);
      weekCacheRef.current.set(weekCacheKey, nextWeek);
      return;
    }

    let nextWeek = !force ? weekCacheRef.current.get(weekCacheKey) : undefined;
    if (!nextWeek) {
      const week = await fetchTransactionsRange({ from: weekFrom, to: today });
      if (gen !== loadGenRef.current) return;
      nextWeek = { expenses: week.expenses || [], incomes: week.incomes || [] };
      weekCacheRef.current.set(weekCacheKey, nextWeek);
    }
    setWeekExpenses(nextWeek.expenses || []);
    setWeekIncomes(nextWeek.incomes || []);
  }, [accountFilter, monthKey]);

  const loadStats = useCallback(async ({ force = false } = {}) => {
    const statsKey = `${accountFilter}::${expenseCategory}::${expenseSubcategory}`;
    let stats = !force ? statsCacheRef.current.get(statsKey) : undefined;
    if (!stats) {
      stats = await fetchSpendingStats({
        accountId: accountFilter,
        category: expenseCategory,
        subcategory: expenseSubcategory,
      });
      statsCacheRef.current.set(statsKey, stats);
    }
    setLifetimeStats({
      categorySums: stats.categorySums || {},
      subcategorySums: stats.subcategorySums || {},
      monthlyTotals: stats.monthlyTotals || [],
      total: stats.total || 0,
    });
  }, [accountFilter, expenseCategory, expenseSubcategory]);

  const reloadLedger = useCallback(async () => {
    ledgerCacheRef.current.clear();
    weekCacheRef.current.clear();
    statsCacheRef.current.clear();
    await Promise.all([loadLedger({ force: true }), loadStats({ force: true })]);
  }, [loadLedger, loadStats]);

  const loadLedgerRef = useRef(loadLedger);
  const loadStatsRef = useRef(loadStats);
  loadLedgerRef.current = loadLedger;
  loadStatsRef.current = loadStats;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await loadLedger();
      } catch {
        if (!cancelled) toast.error("Could not load dashboard data");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadLedger]);

  useEffect(() => {
    loadStats().catch(() => {});
  }, [loadStats]);

  useEffect(() => {
    let cancelled = false;
    let stamp = "";
    let inFlight = false;

    const refresh = async () => {
      if (cancelled || inFlight) return;
      if (document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const next = await fetchDashboardStamp();
        if (cancelled || next === stamp) return;
        stamp = next;
        ledgerCacheRef.current.clear();
        weekCacheRef.current.clear();
        statsCacheRef.current.clear();
        await Promise.all([
          loadLedgerRef.current({ force: true }),
          loadStatsRef.current({ force: true }),
        ]);
      } finally {
        inFlight = false;
      }
    };

    fetchDashboardStamp()
      .then((value) => {
        if (!cancelled) stamp = value;
      })
      .catch(() => {});

    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  useEffect(() => {
    if (user && user.openingBalanceSet === false) {
      setOpeningModalRequired(true);
      setOpeningModalOpen(true);
    }
  }, [user]);

  useEscapeKey(showMenu, () => setShowMenu(false));

  useEffect(() => {
    if (!showMenu) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showMenu]);

  useEffect(() => {
    const onKey = (event) => {
      const tag = event.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || event.target?.isContentEditable) {
        return;
      }
      if (event.key === "n" || event.key === "N") {
        event.preventDefault();
        setEditingTransaction(null);
        setModalOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  const handleSaveOpeningBalance = useCallback(
    async (amount) => {
      try {
        const updated = await updateOpeningBalance(amount);
        setUser((prev) => ({ ...prev, ...updated }));
        setOpeningModalOpen(false);
        setOpeningModalRequired(false);
        await reloadLedger();
        toast.success("Opening balance saved", { position: "top-center" });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not save opening balance");
        throw error;
      }
    },
    [setUser, reloadLedger]
  );

  const openAddModal = useCallback(() => {
    setEditingTransaction(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback(
    (transaction, type) => {
      if (!isTransactionEditable(transaction.createdAt, editWindowMs)) {
        toast.info(editWindowToastMessage(editWindowMs), { position: "top-center" });
        return;
      }
      setEditingTransaction({ ...transaction, type });
      setModalOpen(true);
    },
    [editWindowMs]
  );

  const openEditExpense = useCallback(
    (transaction) => openEditModal(transaction, "expense"),
    [openEditModal]
  );

  const openEditIncome = useCallback(
    (transaction) => openEditModal(transaction, "income"),
    [openEditModal]
  );

  const closeTransactionModal = useCallback(() => {
    setModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const saveTransaction = useCallback(
    async (transaction, existing) => {
      if (transaction.type === "transfer") {
        try {
          const data = await createTransfer(transaction);
          setTransfers((prev) => [data, ...prev]);
          setHasTransactions(true);
          toast.success("Transfer recorded", { position: "top-center" });
          await reloadLedger();
          return;
        } catch (error) {
          toast.error(error?.response?.data?.message || "Could not save transfer");
          throw error;
        }
      }

      const type = existing?.type ?? transaction.type;
      const isIncome = type === "income";

      try {
        if (existing?._id) {
          const data = await updateTransactionRequest(type, existing._id, transaction);
          const updater = (prev) =>
            prev.map((item) => (item._id === existing._id ? data : item));

          if (isIncome) setIncomes(updater);
          else setExpenses(updater);

          toast.success("Updated", { position: "top-center" });
          await reloadLedger();
          return;
        }

        const data = await createTransaction(transaction);
        if (isIncome) setIncomes((prev) => [data, ...prev]);
        else setExpenses((prev) => [data, ...prev]);
        setHasTransactions(true);

        toast.success(isIncome ? "Income added" : "Expense added", { position: "top-center" });
        await reloadLedger();
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            (existing?._id ? "Could not update transaction" : "Could not save transaction")
        );
        throw error;
      }
    },
    [reloadLedger]
  );

  const removeTransaction = useCallback(
    async (type, id) => {
      try {
        await deleteTransactionRequest(type, id);
        if (type === "income") {
          setIncomes((prev) => prev.filter((income) => income._id !== id));
        } else {
          setExpenses((prev) => prev.filter((expense) => expense._id !== id));
        }
        toast.success("Deleted", { position: "top-center" });
        await reloadLedger();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not delete");
        throw error;
      }
    },
    [reloadLedger]
  );

  const removeTransfer = useCallback(
    async (id) => {
      try {
        await deleteTransferRequest(id);
        setTransfers((prev) => prev.filter((row) => row._id !== id));
        toast.success("Transfer deleted", { position: "top-center" });
        await reloadLedger();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not delete transfer");
        throw error;
      }
    },
    [reloadLedger]
  );

  const deleteExpense = useCallback((id) => removeTransaction("expense", id), [removeTransaction]);
  const deleteIncome = useCallback((id) => removeTransaction("income", id), [removeTransaction]);

  const openOpeningBalanceModal = useCallback(() => {
    setOpeningModalRequired(false);
    setOpeningModalOpen(true);
  }, []);

  const skipOpeningBalance = useCallback(() => {
    setOpeningModalOpen(false);
  }, []);

  const exportMonth = useCallback(() => {
    buildTransactionsCsv({
      expenses: consumptionExpenses,
      incomes: monthIncomes,
      transfers: monthTransfers,
      cardPayments: monthCardPayments,
      accounts,
      monthLabel: formatMonthLabel(monthKey),
    });
    toast.success("CSV downloaded", { position: "top-center" });
  }, [accounts, consumptionExpenses, monthCardPayments, monthIncomes, monthKey, monthTransfers]);

  const displayName =
    ((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email;
  const firstName = user.firstName || displayName.split(" ")[0];
  const initials =
    `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase() ||
    (user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="sw-page h-dvh max-h-dvh flex flex-col overflow-hidden">
      <div
        className="shrink-0 z-30 backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--sw-panel) 92%, transparent)",
          borderBottom: "1px solid var(--sw-border)",
        }}
      >
      <header>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-2">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 sm:flex-none sm:max-w-[22rem]">
              <BrandLogo variant="horizontal" className="rounded-md" />
            </div>

            <p className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-ink-muted truncate max-w-[min(40%,16rem)] text-center pointer-events-none">
              {getGreeting()}, {firstName}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl text-ink-soft transition flex items-center justify-center"
                style={{
                  background: "var(--sw-elevated)",
                  border: "1px solid var(--sw-border)",
                }}
                aria-label="Toggle theme"
                title={theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {theme === "dark" ? (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 14.5A8.5 8.5 0 1111.5 3a7 7 0 009.5 11.5z" />
                  </svg>
                )}
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((open) => !open)}
                  className="flex items-center gap-2 rounded-xl p-1 sm:pr-2 transition focus:outline-none focus:ring-2 focus:ring-sage-600/30 hover:bg-[var(--sw-muted-bg)]"
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  <span
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-white text-sm font-semibold flex items-center justify-center shadow-soft ring-2 ring-white/80"
                    style={{
                      background: "linear-gradient(135deg, #16a34a 0%, #2563eb 100%)",
                    }}
                  >
                    {initials}
                  </span>
                  <svg
                    className={`w-4 h-4 text-ink-muted hidden sm:block transition ${showMenu ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.25}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMenu && (
                  <div
                    role="menu"
                    className="sw-menu absolute right-0 top-11 sm:top-12 z-20 w-56 animate-fade-in"
                  >
                    <div className="sw-menu-header">
                      <div className="text-xs text-ink-muted">Signed in as</div>
                      <div className="text-sm font-semibold text-ink truncate">{displayName}</div>
                    </div>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        openOpeningBalanceModal();
                      }}
                      className="sw-menu-item"
                    >
                      Opening balance
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        setAccountsOpen(true);
                      }}
                      className="sw-menu-item"
                    >
                      Accounts
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        setBudgetsOpen(true);
                      }}
                      className="sw-menu-item"
                    >
                      Category budgets
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        setSecurityOpen(true);
                      }}
                      className="sw-menu-item"
                    >
                      Email & password
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        exportMonth();
                      }}
                      className="sw-menu-item"
                    >
                      Export CSV
                    </button>
                    {canInstall && (
                      <button
                        type="button"
                        role="menuitem"
                        onClick={async () => {
                          setShowMenu(false);
                          await install();
                        }}
                        className="sw-menu-item"
                      >
                        Install app
                      </button>
                    )}
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="sw-menu-item text-rose-700 dark:text-rose-400"
                    >
                      Log out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </header>
        {!loading && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-2.5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <MonthSwitcher monthKey={monthKey} onChange={setMonthKey} cycle={periodCycle} />
              <div className="flex items-center gap-2 w-full min-w-0 sm:w-auto sm:ml-auto">
                <button
                  type="button"
                  onClick={() => setBudgetsOpen(true)}
                  className="sw-input !w-auto shrink-0 !px-2.5 !py-1.5 sm:!px-3.5 sm:!py-2 text-xs sm:text-sm font-medium text-sage-700 dark:text-sage-200 hover:bg-[var(--sw-muted-bg)]"
                >
                  Budgets
                </button>
                {accounts.length > 0 && (
                  <select
                    className="sw-input min-w-0 flex-1 sm:flex-none sm:!w-auto sm:min-w-[11rem] !px-2.5 !py-1.5 sm:!px-3.5 sm:!py-2 text-xs sm:text-sm"
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                    aria-label="Filter by account"
                  >
                    <option value="all">All accounts</option>
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
            <SummaryCards
              totalIncome={monthIncomeTotal}
              totalExpense={monthExpenseTotal}
              openingBalance={headerSummary.monthStartOpening}
              accountBalance={headerSummary.monthEndBalance}
              isCredit={viewingCredit}
              creditBill={headerSummary.creditBill}
              periodNote={
                creditCycle ? formatCreditDueLabel(monthKey, periodCycle) : null
              }
              balanceHint={
                creditCycle
                  ? formatCreditStatementHint(monthKey, periodCycle)
                  : accountFilter === "all" || viewingCredit
                    ? "Month end · credit limit is not included"
                    : "Month end · opening this month + income − spend"
              }
              outsideSettled={cardSpendAdjustments.outside}
              unmatchedCardOutflow={cardSpendAdjustments.unmatched}
              onEditOpeningBalance={viewingCredit ? undefined : openOpeningBalanceModal}
            />
          </div>
        )}
      </div>

      <main className="relative z-10 flex-1 min-h-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-28">
        {loading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[88px] rounded-2xl animate-pulse sw-card"
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <OnboardingChecklist
              hasOpeningBalance={Boolean(user.openingBalanceSet)}
              hasAccount={accounts.length > 0}
              hasTransaction={hasTransactions}
              onOpenAccounts={() => setAccountsOpen(true)}
              onAddTransaction={openAddModal}
            />

            <div
              className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex flex-col gap-6 xl:col-span-3">
                <CategoryBreakdown
                  expenses={overviewMonthExpenses}
                  categorySums={categorySums}
                  monthTotal={overviewMonthExpenseTotal}
                  accounts={accounts}
                  accountFilter={accountFilter}
                />
                <WeeklyBarChart
                  expenses={weekOverviewExpenses}
                  accounts={accounts}
                  accountFilter={accountFilter}
                />
                <DailyBreakdown
                  expenses={overviewMonthExpenses}
                  monthKey={monthKey}
                  accounts={accounts}
                  accountFilter={accountFilter}
                  cycle={periodCycle}
                />
                <CategoryBreakdown
                  expenses={[]}
                  categorySums={lifetimeCategorySums}
                  subcategorySums={lifetimeStats.subcategorySums}
                  monthTotal={lifetimeExpenseTotal}
                  accounts={accounts}
                  accountFilter={accountFilter}
                  title="Lifetime"
                  emptyTitle="No spending yet"
                  emptyDescription="Your expenses from every month will appear here"
                  scopeLabel="all time"
                >
                  <MonthlySpendList monthlyTotals={lifetimeStats.monthlyTotals} />
                </CategoryBreakdown>
              </div>

              <div className="xl:col-span-2 min-h-[28rem] xl:min-h-0 xl:relative">
                <div className="xl:absolute xl:inset-0 flex">
                  <Transactions
                    expenses={consumptionExpenses}
                    incomes={monthIncomes}
                    transfers={monthTransfers}
                    cardPayments={monthCardPayments}
                    accounts={accounts}
                    accountFilter={accountFilter}
                    expenseCategory={expenseCategory}
                    expenseSubcategory={expenseSubcategory}
                    onExpenseCategoryChange={handleExpenseCategoryChange}
                    onExpenseSubcategoryChange={setExpenseSubcategory}
                    onEditExpense={openEditExpense}
                    onEditIncome={openEditIncome}
                    onDeleteExpense={deleteExpense}
                    onDeleteIncome={deleteIncome}
                    onDeleteTransfer={removeTransfer}
                    monthStartOpening={headerSummary.monthStartOpening}
                    statementOpening={headerSummary.statementOpening}
                    monthEndBalance={headerSummary.monthEndBalance}
                    isCredit={viewingCredit}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        </div>
      </main>

      <AddExpenseModal
        open={modalOpen}
        onClose={closeTransactionModal}
        onSubmit={saveTransaction}
        defaultType="expense"
        editingTransaction={editingTransaction}
        onOpenRequest={openAddModal}
        accounts={accounts}
        defaultAccountId={defaultAccountId}
      />

      <OpeningBalanceModal
        open={openingModalOpen}
        required={openingModalRequired}
        initialValue={defaultAccountOpening || ""}
        onSave={handleSaveOpeningBalance}
        onSkip={openingModalRequired ? undefined : skipOpeningBalance}
      />

      <AccountsModal
        open={accountsOpen}
        onClose={() => setAccountsOpen(false)}
        accounts={accounts}
        onChanged={reloadLedger}
      />

      <BudgetModal
        open={budgetsOpen}
        onClose={() => setBudgetsOpen(false)}
        monthKey={monthKey}
        categorySums={monthBudgetSums}
      />

      <ProfileSecurityModal open={securityOpen} onClose={() => setSecurityOpen(false)} />
    </div>
  );
}

export default Dashboard;
