import { useCallback, useEffect, useRef, useState } from "react";
import Transactions from "../components/Transactions";
import SummaryCards from "../components/SummaryCards";
import AddExpenseModal from "../components/AddExpenseModal";
import OpeningBalanceModal from "../components/OpeningBalanceModal";
import CategoryBreakdown from "../components/charts/CategoryBreakdown";
import WeeklyBarChart from "../components/charts/WeeklyBarChart";
import { updateOpeningBalance } from "../auth/authService";
import {
  fetchTransactions,
  createTransaction,
  updateTransaction as updateTransactionRequest,
  deleteTransaction as deleteTransactionRequest,
} from "../api/transactions";
import { useAuth } from "../auth/AuthContext";
import { useAppConfig } from "../config/AppConfigContext";
import { useEscapeKey } from "../hooks/useEscapeKey";
import BrandLogo from "../components/BrandLogo";
import { isTransactionEditable } from "../utils/dateHelpers";
import { toast } from "react-toastify";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const { editWindowMs } = useAppConfig();
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [openingModalOpen, setOpeningModalOpen] = useState(false);
  const [openingModalRequired, setOpeningModalRequired] = useState(false);

  const loadTransactions = useCallback(async () => {
    const data = await fetchTransactions();
    setExpenses(data.expenses);
    setIncomes(data.incomes);
  }, []);

  useEffect(() => {
    loadTransactions()
      .catch(() => {
        toast.error("Could not load transactions");
      })
      .finally(() => setLoading(false));
  }, [loadTransactions]);

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

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  const handleSaveOpeningBalance = useCallback(async (amount) => {
    try {
      const updated = await updateOpeningBalance(amount);
      setUser((prev) => ({ ...prev, ...updated }));
      setOpeningModalOpen(false);
      setOpeningModalRequired(false);
      toast.success("Opening balance saved", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save opening balance");
      throw error;
    }
  }, [setUser]);

  const openAddModal = useCallback(() => {
    setEditingTransaction(null);
    setModalOpen(true);
  }, []);

  const openEditModal = useCallback((transaction, type) => {
    if (!isTransactionEditable(transaction.createdAt, editWindowMs)) {
      toast.info("Edits are only allowed within 24 hours of adding", {
        position: "top-center",
      });
      return;
    }
    setEditingTransaction({ ...transaction, type });
    setModalOpen(true);
  }, [editWindowMs]);

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

  const saveTransaction = useCallback(async (transaction, existing) => {
    if (existing?._id) {
      try {
        const data = await updateTransactionRequest(existing.type, existing._id, transaction);

        if (existing.type === "income") {
          setIncomes((prev) =>
            prev.map((income) => (income._id === existing._id ? data : income))
          );
        } else {
          setExpenses((prev) =>
            prev.map((expense) => (expense._id === existing._id ? data : expense))
          );
        }
        toast.success("Updated", { position: "top-center" });
      } catch (error) {
        toast.error(error?.response?.data?.message || "Could not update transaction");
        throw error;
      }
      return;
    }

    try {
      const data = await createTransaction(transaction);

      if (transaction.type === "income") {
        setIncomes((prev) => [data, ...prev]);
      } else {
        setExpenses((prev) => [data, ...prev]);
      }
      toast.success(
        transaction.type === "income" ? "Income added" : "Expense added",
        { position: "top-center" }
      );
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save transaction");
      throw error;
    }
  }, []);

  const deleteExpense = useCallback(async (id) => {
    try {
      await deleteTransactionRequest("expense", id);
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      toast.success("Deleted", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete");
      throw error;
    }
  }, []);

  const deleteIncome = useCallback(async (id) => {
    try {
      await deleteTransactionRequest("income", id);
      setIncomes((prev) => prev.filter((income) => income._id !== id));
      toast.success("Deleted", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete");
      throw error;
    }
  }, []);

  const openOpeningBalanceModal = useCallback(() => {
    setOpeningModalRequired(false);
    setOpeningModalOpen(true);
  }, []);

  const skipOpeningBalance = useCallback(() => {
    setOpeningModalOpen(false);
  }, []);

  const displayName =
    ((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email;
  const firstName = user.firstName || displayName.split(" ")[0];
  const initials = `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`
    .toUpperCase() || (user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="sw-page">
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-sand-50/80 backdrop-blur-md">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1 sm:flex-none sm:max-w-[22rem]">
              <BrandLogo variant="horizontal" className="rounded-md" />
            </div>

            <p className="hidden sm:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm text-ink-muted truncate max-w-[min(40%,16rem)] text-center pointer-events-none">
              {getGreeting()}, {firstName}
            </p>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setShowMenu((open) => !open)}
                  className="flex items-center gap-2 rounded-xl p-1 sm:pr-2 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-sage-600/30 transition"
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                  aria-label="User menu"
                >
                  <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sage-600 text-white text-sm font-semibold flex items-center justify-center">
                    {initials}
                  </span>
                  <svg
                    className={`w-4 h-4 text-ink-muted hidden sm:block transition ${showMenu ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-11 sm:top-12 z-20 w-56 bg-white rounded-xl shadow-panel ring-1 ring-ink/5 py-1 overflow-hidden animate-fade-in"
                  >
                    <div className="px-4 py-3 border-b border-ink/5 bg-sage-50/60">
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
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-ink hover:bg-sand-50 transition"
                    >
                      Opening balance
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-50 transition"
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
                <div key={i} className="h-[88px] bg-white/70 rounded-2xl animate-pulse ring-1 ring-ink/5" />
              ))}
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
              <div className="xl:col-span-3 h-72 bg-white/70 rounded-2xl animate-pulse ring-1 ring-ink/5" />
              <div className="xl:col-span-2 h-72 bg-white/70 rounded-2xl animate-pulse ring-1 ring-ink/5" />
            </div>
          </div>
        ) : (
          <>
            <SummaryCards
              expenses={expenses}
              incomes={incomes}
              openingBalance={user.openingBalance || 0}
              onEditOpeningBalance={openOpeningBalanceModal}
            />

            <div
              className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex flex-col gap-6 xl:col-span-3">
                <CategoryBreakdown expenses={expenses} />
                <WeeklyBarChart expenses={expenses} />
              </div>

              {/* Absolute fill on xl so Activity matches left height without growing the row */}
              <div className="xl:col-span-2 min-h-[28rem] xl:min-h-0 xl:relative">
                <div className="xl:absolute xl:inset-0 flex">
                  <Transactions
                    expenses={expenses}
                    incomes={incomes}
                    onEditExpense={openEditExpense}
                    onEditIncome={openEditIncome}
                    onDeleteExpense={deleteExpense}
                    onDeleteIncome={deleteIncome}
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
      />

      <OpeningBalanceModal
        open={openingModalOpen}
        required={openingModalRequired}
        initialValue={user.openingBalance || ""}
        onSave={handleSaveOpeningBalance}
        onSkip={openingModalRequired ? undefined : skipOpeningBalance}
      />
    </div>
  );
}

export default Dashboard;
