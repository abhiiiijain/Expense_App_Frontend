import { useCallback, useEffect, useState } from "react";
import Transactions from "./components/Transactions";
import SummaryCards from "./components/SummaryCards";
import AddExpenseModal from "./components/AddExpenseModal";
import PieChart from "./components/PieChart";
import BarChart from "./components/BarChart";
import { apiClient, fetchTransactions } from "./auth/authService";
import { useAuth } from "./auth/AuthContext";
import { APP_NAME } from "./constants/app";
import { toast } from "react-toastify";

function App() {
  const { user, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = () => {
    setShowMenu(false);
    logout();
  };

  const addTransaction = async (transaction) => {
    const endpoint = transaction.type === "income" ? "add-income" : "add-expense";
    const { data } = await apiClient.post(endpoint, transaction);

    if (transaction.type === "income") {
      setIncomes((prev) => [data, ...prev]);
    } else {
      setExpenses((prev) => [data, ...prev]);
    }
  };

  const deleteTransaction = async (type, id) => {
    const endpoint = type === "income" ? `delete-income/${id}` : `delete-expense/${id}`;
    await apiClient.delete(endpoint);

    if (type === "income") {
      setIncomes((prev) => prev.filter((income) => income._id !== id));
    } else {
      setExpenses((prev) => prev.filter((expense) => expense._id !== id));
    }
  };

  const displayName =
    ((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-gray-100">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <span className="text-xl font-extrabold tracking-tight text-blue-700">{APP_NAME}</span>

          <div className="hidden sm:block text-center flex-1 min-w-0">
            <div className="text-xs text-gray-500">Welcome back</div>
            <div className="font-bold text-gray-900 truncate">{displayName}</div>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu((open) => !open)}
              className="flex items-center gap-1.5 rounded-full p-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-expanded={showMenu}
              aria-haspopup="menu"
              aria-label="User menu"
            >
              <img
                src={user.photo || "./icon.png"}
                alt=""
                className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
              />
              <svg
                className={`w-4 h-4 text-gray-500 hidden sm:block transition ${showMenu ? "rotate-180" : ""}`}
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
                  className="absolute right-0 top-12 z-20 w-52 bg-white rounded-xl shadow-xl border border-gray-200 py-1 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
                    <div className="text-xs text-gray-500">Signed in as</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">{displayName}</div>
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <span aria-hidden="true">↪</span>
                    Log out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-white rounded-2xl animate-pulse ring-1 ring-gray-100" />
            ))}
          </div>
        ) : (
          <SummaryCards expenses={expenses} incomes={incomes} />
        )}

        <div className="flex flex-col xl:flex-row gap-6">
          <div className="flex flex-col gap-6 w-full xl:w-3/5">
            <PieChart expenses={expenses} />
            <BarChart expenses={expenses} />
          </div>

          <div className="w-full xl:w-2/5">
            <Transactions
              expenses={expenses}
              incomes={incomes}
              onDeleteExpense={(id) => deleteTransaction("expense", id)}
              onDeleteIncome={(id) => deleteTransaction("income", id)}
            />
          </div>
        </div>
      </main>

      <AddExpenseModal AddExpense={addTransaction} />
    </div>
  );
}

export default App;
