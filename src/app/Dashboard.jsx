import { useCallback, useEffect, useState } from "react";
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
  deleteTransaction as deleteTransactionRequest,
} from "../api/transactions";
import { useAuth } from "../auth/AuthContext";
import { APP_NAME } from "../constants/app";
import { toast } from "react-toastify";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function Dashboard() {
  const { user, setUser, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
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

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  const handleSaveOpeningBalance = async (amount) => {
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
  };

  const addTransaction = async (transaction) => {
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
  };

  const deleteTransaction = async (type, id) => {
    try {
      await deleteTransactionRequest(type, id);

      if (type === "income") {
        setIncomes((prev) => prev.filter((income) => income._id !== id));
      } else {
        setExpenses((prev) => prev.filter((expense) => expense._id !== id));
      }
      toast.success("Deleted", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete");
    }
  };

  const displayName =
    ((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email;
  const firstName = user.firstName || displayName.split(" ")[0];
  const initials = `${(user.firstName || "").charAt(0)}${(user.lastName || "").charAt(0)}`
    .toUpperCase() || (user.email || "?").charAt(0).toUpperCase();

  return (
    <div className="sw-page">
      <header className="sticky top-0 z-30 border-b border-ink/5 bg-sand-50/80 backdrop-blur-md">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="font-display text-xl sm:text-2xl font-bold tracking-tight text-sage-600">
              {APP_NAME}
            </p>
            <p className="text-xs text-ink-muted truncate">
              {getGreeting()}, {firstName}
            </p>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((open) => !open)}
                className="flex items-center gap-2 rounded-xl p-1 pr-2 hover:bg-white/70 focus:outline-none focus:ring-2 focus:ring-sage-600/30 transition"
                aria-expanded={showMenu}
                aria-haspopup="menu"
                aria-label="User menu"
              >
                {user.photo ? (
                  <img
                    src={user.photo}
                    alt=""
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-ink/10"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-xl bg-sage-600 text-white text-sm font-semibold flex items-center justify-center">
                    {initials}
                  </span>
                )}
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
                <>
                  <button
                    type="button"
                    className="fixed inset-0 z-10 cursor-default"
                    aria-label="Close menu"
                    onClick={() => setShowMenu(false)}
                  />
                  <div
                    role="menu"
                    className="absolute right-0 top-12 z-20 w-56 bg-white rounded-xl shadow-panel ring-1 ring-ink/5 py-1 overflow-hidden animate-fade-in"
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
                        setOpeningModalRequired(false);
                        setOpeningModalOpen(true);
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
                </>
              )}
            </div>
          </div>
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
              onEditOpeningBalance={() => {
                setOpeningModalRequired(false);
                setOpeningModalOpen(true);
              }}
            />

            <div
              className="grid grid-cols-1 xl:grid-cols-5 gap-6 animate-fade-up"
              style={{ animationDelay: "80ms" }}
            >
              <div className="flex flex-col gap-6 xl:col-span-3">
                <CategoryBreakdown expenses={expenses} />
                <WeeklyBarChart expenses={expenses} />
              </div>

              <div className="xl:col-span-2">
                <Transactions
                  expenses={expenses}
                  incomes={incomes}
                  onDeleteExpense={(id) => deleteTransaction("expense", id)}
                  onDeleteIncome={(id) => deleteTransaction("income", id)}
                />
              </div>
            </div>
          </>
        )}
      </main>

      <AddExpenseModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={addTransaction}
        defaultType="expense"
        onOpenRequest={() => setModalOpen(true)}
      />

      <OpeningBalanceModal
        open={openingModalOpen}
        required={openingModalRequired}
        initialValue={user.openingBalance || ""}
        onSave={handleSaveOpeningBalance}
        onSkip={
          openingModalRequired
            ? undefined
            : () => setOpeningModalOpen(false)
        }
      />
    </div>
  );
}

export default Dashboard;
