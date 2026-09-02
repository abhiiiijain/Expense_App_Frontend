import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "../config/chartSetup";
import Transactions from "../components/Transactions";
import SummaryCards from "../components/SummaryCards";
import AddExpenseModal from "../components/AddExpenseModal";
import OpeningBalanceModal from "../components/OpeningBalanceModal";
import CategoryBreakdown from "../components/charts/CategoryBreakdown";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import MonthSwitcher from "../components/MonthSwitcher";
import BudgetPanel from "../components/BudgetPanel";
import AccountsModal from "../components/AccountsModal";
import ProfileSecurityModal from "../components/ProfileSecurityModal";
import OnboardingChecklist from "../components/OnboardingChecklist";
import { updateOpeningBalance } from "../auth/authService";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction as updateTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
} from "../api/transactions";
import { createTransfer, deleteTransfer as deleteTransferRequest } from "../api/transfers";
import { fetchAccounts } from "../api/accounts";
import { useAuth } from "../auth/AuthContext";
import { useAppConfig, useCategories } from "../config/AppConfigContext";
import { useTheme } from "../config/ThemeContext";
import { useEscapeKey } from "../hooks/useEscapeKey";
import { usePwaInstall } from "../hooks/usePwaInstall";
import { useCategorySums, useMonthItems, useMonthTotal } from "../hooks/useExpenseAnalytics";
import BrandLogo from "../components/BrandLogo";
import {
  getMonthKey,
  isTransactionEditable,
  formatMonthLabel,
  transactionDate,
} from "../utils/dateHelpers";
import { editWindowToastMessage } from "../utils/formatEditWindow";
import { buildTransactionsCsv } from "../utils/exportCsv";
import { toast } from "react-toastify";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function belongsToMonth(transaction, monthKey) {
  return getMonthKey(transactionDate(transaction)) === monthKey;
}

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const { editWindowMs } = useAppConfig();
  const { theme, toggleTheme } = useTheme();
  const { canInstall, install } = usePwaInstall();
  const { expenseCategoryNames } = useCategories();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [hasTransactions, setHasTransactions] = useState(false);
  const [loading, setLoading] = useState(true);
  const [metaReady, setMetaReady] = useState(false);
  const [monthReady, setMonthReady] = useState(false);
  const [monthKey, setMonthKey] = useState(() => getMonthKey());
  const [accountFilter, setAccountFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openingModalRequired, setOpeningModalRequired] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(false);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [hasBudget, setHasBudget] = useState(false);

  const defaultAccountId =
    accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || "";
  const defaultAccountOpening =
    accounts.find((a) => a.isDefault)?.openingBalance ??
    accounts[0]?.openingBalance ??
    0;

  const totalOpening = useMemo(
    () => accounts.reduce((sum, a) => sum + (a.openingBalance || 0), 0),
    [accounts]
  );

  const totalBalance = useMemo(
    () => accounts.reduce((sum, a) => sum + (a.balance || 0), 0),
    [accounts]
  );

  const scopedExpenses = useMemo(
    () =>
      accountFilter === "all"
        ? expenses
        : expenses.filter((tx) => String(tx.accountId) === String(accountFilter)),
    [accountFilter, expenses]
  );

  const scopedIncomes = useMemo(
    () =>
      accountFilter === "all"
        ? incomes
        : incomes.filter((tx) => String(tx.accountId) === String(accountFilter)),
    [accountFilter, incomes]
  );

  const scopedTransfers = useMemo(
    () =>
      accountFilter === "all"
        ? transfers
        : transfers.filter(
            (tx) =>
              String(tx.fromAccountId) === String(accountFilter) ||
              String(tx.toAccountId) === String(accountFilter)
          ),
    [accountFilter, transfers]
  );

  const scopedRecentExpenses = useMemo(
    () =>
      accountFilter === "all"
        ? recentExpenses
        : recentExpenses.filter((tx) => String(tx.accountId) === String(accountFilter)),
    [accountFilter, recentExpenses]
  );

  // API scopes by month; client filter is a rollout safety net.
  const monthExpenses = useMonthItems(scopedExpenses, monthKey);
  const monthIncomes = useMonthItems(scopedIncomes, monthKey);
  const monthTransfers = useMonthItems(scopedTransfers, monthKey);
  const categorySums = useCategorySums(monthExpenses, expenseCategoryNames);
  const monthExpenseTotal = useMonthTotal(monthExpenses);
  const monthIncomeTotal = useMonthTotal(monthIncomes);

  const handleBudgetsChange = useCallback((rows) => {
    setHasBudget(rows.some((b) => (b.amount || 0) > 0));
  }, []);

  const loadAccounts = useCallback(async () => {
    const { accounts: rows, hasTransactions: flag } = await fetchAccounts();
    setAccounts(rows);
    setHasTransactions(flag);
    return rows;
  }, []);

  const loadMonthTransactions = useCallback(async (key) => {
    const data = await fetchTransactions({ month: key });
    setExpenses(data.expenses);
    setIncomes(data.incomes);
    setTransfers(data.transfers || []);
  }, []);

  const loadRecentExpenses = useCallback(async () => {
    const data = await fetchTransactions({ days: 7 });
    setRecentExpenses(data.expenses);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([loadRecentExpenses(), loadAccounts()])
      .catch(() => {
        if (!cancelled) toast.error("Could not load dashboard data");
      })
      .finally(() => {
        if (!cancelled) setMetaReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loadRecentExpenses, loadAccounts]);

  useEffect(() => {
    let cancelled = false;
    setMonthReady(false);
    loadMonthTransactions(monthKey)
      .catch(() => {
        if (!cancelled) toast.error("Could not load month transactions");
      })
      .finally(() => {
        if (!cancelled) setMonthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey, loadMonthTransactions]);

  useEffect(() => {
    if (metaReady && monthReady) setLoading(false);
  }, [metaReady, monthReady]);

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
        await loadAccounts();
        toast.success("Opening balance saved", { position: "top-center" });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not save opening balance");
        throw error;
      }
    },
    [setUser, loadAccounts]
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
          if (belongsToMonth(data, monthKey)) {
            setTransfers((prev) => [data, ...prev]);
          }
          setHasTransactions(true);
          toast.success("Transfer recorded", { position: "top-center" });
          await loadAccounts();
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
          const updater = (prev) => {
            if (!belongsToMonth(data, monthKey)) {
              return prev.filter((item) => item._id !== existing._id);
            }
            return prev.map((item) => (item._id === existing._id ? data : item));
          };

          if (isIncome) setIncomes(updater);
          else setExpenses(updater);

          toast.success("Updated", { position: "top-center" });
          await Promise.all([loadAccounts(), loadRecentExpenses()]);
          return;
        }

        const data = await createTransaction(transaction);
        if (belongsToMonth(data, monthKey)) {
          if (isIncome) setIncomes((prev) => [data, ...prev]);
          else setExpenses((prev) => [data, ...prev]);
        }
        setHasTransactions(true);

        toast.success(isIncome ? "Income added" : "Expense added", { position: "top-center" });
        await Promise.all([loadAccounts(), loadRecentExpenses()]);
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            (existing?._id ? "Could not update transaction" : "Could not save transaction")
        );
        throw error;
      }
    },
    [loadAccounts, loadRecentExpenses, monthKey]
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
        setRecentExpenses((prev) => prev.filter((expense) => expense._id !== id));
        toast.success("Deleted", { position: "top-center" });
        await loadAccounts();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not delete");
        throw error;
      }
    },
    [loadAccounts]
  );

  const removeTransfer = useCallback(
    async (id) => {
      try {
        await deleteTransferRequest(id);
        setTransfers((prev) => prev.filter((row) => row._id !== id));
        toast.success("Transfer deleted", { position: "top-center" });
        await loadAccounts();
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not delete transfer");
        throw error;
      }
    },
    [loadAccounts]
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
      expenses: monthExpenses,
      incomes: monthIncomes,
      transfers: monthTransfers,
      accounts,
      monthLabel: formatMonthLabel(monthKey),
    });
    toast.success("CSV downloaded", { position: "top-center" });
  }, [accounts, monthExpenses, monthIncomes, monthKey, monthTransfers]);

  const displayName =
    ((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email;
  const firstName = user.firstName || displayName.split(" ")[0];
  const initials =
    `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`.toUpperCase() ||
    (user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="sw-page">
      <header
        className="sticky top-0 z-30 backdrop-blur-md"
        style={{
          background: "color-mix(in srgb, var(--sw-panel) 92%, transparent)",
          borderBottom: "1px solid var(--sw-border)",
        }}
      >
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5">
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

          <p className="sm:hidden mt-2 text-center text-xs text-ink-muted truncate">
            {getGreeting()}, {firstName}
          </p>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 pb-28">
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
            <div className="flex flex-wrap items-center justify-between gap-3">
              <MonthSwitcher monthKey={monthKey} onChange={setMonthKey} />
              {accounts.length > 0 && (
                <select
                  className="sw-input !w-auto py-2 text-sm"
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

            <OnboardingChecklist
              hasOpeningBalance={Boolean(user.openingBalanceSet)}
              hasAccount={accounts.length > 0}
              hasTransaction={hasTransactions}
              hasBudget={hasBudget}
              onOpenAccounts={() => setAccountsOpen(true)}
              onAddTransaction={openAddModal}
            />

            <SummaryCards
              monthKey={monthKey}
              totalIncome={monthIncomeTotal}
              totalExpense={monthExpenseTotal}
              openingBalance={
                accountFilter === "all"
                  ? totalOpening
                  : accounts.find((a) => String(a.id) === String(accountFilter))?.openingBalance ||
                    0
              }
              accountBalance={
                accountFilter === "all"
                  ? totalBalance
                  : accounts.find((a) => String(a.id) === String(accountFilter))?.balance
              }
              onEditOpeningBalance={openOpeningBalanceModal}
            />

            <div
              className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex flex-col gap-6 xl:col-span-3">
                <CategoryBreakdown
                  expenses={monthExpenses}
                  categorySums={categorySums}
                  monthTotal={monthExpenseTotal}
                />
                <BudgetPanel
                  monthKey={monthKey}
                  categorySums={categorySums}
                  onBudgetsChange={handleBudgetsChange}
                />
                <WeeklyBarChart expenses={scopedRecentExpenses} />
              </div>

              <div className="xl:col-span-2 min-h-[28rem] xl:min-h-0 xl:relative">
                <div className="xl:absolute xl:inset-0 flex">
                  <Transactions
                    expenses={monthExpenses}
                    incomes={monthIncomes}
                    transfers={monthTransfers}
                    accounts={accounts}
                    onEditExpense={openEditExpense}
                    onEditIncome={openEditIncome}
                    onDeleteExpense={deleteExpense}
                    onDeleteIncome={deleteIncome}
                    onDeleteTransfer={removeTransfer}
                  />
                </div>
              </div>
            </div>
          </>
        )}
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
        onChanged={loadAccounts}
      />

      <ProfileSecurityModal open={securityOpen} onClose={() => setSecurityOpen(false)} />
    </div>
  );
}

export default Dashboard;
