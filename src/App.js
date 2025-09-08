import React, { useEffect, useState } from "react";
import PieChart from "./components/PieChart";
import Transactions from "./components/Transactions";
import BarChart from "./components/BarChart";
import AddExpenseModal from "./components/AddExpenseModal";
import axios from "axios";
import { getStoredAuth, logout, API_BASE_URL, authHeader, clearAuth } from "./auth/authService";
// import { doc, getDoc } from "firebase/firestore";

// export const BASE_URL = "http://localhost:5000/api/v1/";
// Using API_BASE_URL from authService

function App() {
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);



  useEffect(() => {
    const { user } = getStoredAuth();
    setUser(user);
  }, []);

  console.log("user", user);

  async function handleLogout() {
    logout();
    window.location.href = "/login";
    console.log("User logged out successfully!");
  }

  const [error, setError] = useState(null);
  let [expenses, setExpenses] = useState([]);
  let [incomes, setIncomes] = useState([]);

  const getExpenses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}get-expenses`, {
        headers: authHeader(),
      });
      setExpenses(response.data);
      console.log(response.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
    }
  };

  const getIncomes = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}get-incomes`, {
        headers: authHeader(),
      });
      setIncomes(response.data);
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
    }
  };

  const addExpense = async (expense) => {
    try {
      const endpoint = expense.type === "income" ? "add-income" : "add-expense";
      await axios.post(`${API_BASE_URL}${endpoint}`, expense, {
        headers: authHeader(),
      });
      getExpenses();
      getIncomes();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add expense");
      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
    }
  };

  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}delete-expense/${id}`, {
        headers: authHeader(),
      });
      setExpenses((prev) => prev.filter((e) => e._id !== id));
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
    }
  };

  const deleteIncome = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}delete-income/${id}`, {
        headers: authHeader(),
      });
      setIncomes((prev) => prev.filter((i) => i._id !== id));
    } catch (err) {
      if (err?.response?.status === 401) {
        clearAuth();
        window.location.href = "/login";
      }
    }
  };

  useEffect(() => {
    getExpenses();
    getIncomes();
  }, []);

  return (
    <>
      {/* main section */}
      <div className="bg-gray-100 relative flex flex-col items-center">
        <header className="w-[90%] flex justify-between items-center p-5 relative">
          <img src="./logo.png" alt="Logo" className="h-10" />

          {user && (
            <div className="absolute left-1/2 -translate-x-1/2 text-gray-900 font-extrabold text-lg truncate max-w-[60%] text-center">
              Welcome{" "}
              {((user.firstName || "") + " " + (user.lastName || "")).trim() || user.email}
            </div>
          )}

          {user ? (
            <>
              {/* <h1>Welcome {user.firstName}</h1> */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => setShowLogout(!showLogout)}>
                <img
                  src={user.photo || "./icon.png"}
                  width={"40%"}
                  style={{ borderRadius: "50%" }}
                  alt="User icon"
                />
                {showLogout && (
                  <button
                    className="absolute top-0 left-full ml-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLogout();
                    }}>
                    Logout
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>Not Logged In</p>
          )}
        </header>
        <main className="flex flex-col md:flex-row justify-center gap-6 md:gap-10 p-3 w-full">
          <div className="flex flex-col gap-6 md:gap-10 w-full md:w-1/2">
            <PieChart expensess={expenses} user={user} />
            <BarChart expensess={expenses} user={user} />
          </div>
          <div className="flex flex-wrap w-full md:w-1/3 mt-6 md:mt-0">
            <Transactions
              expenses={expenses}
              incomes={incomes}
              user={user}
              onDeleteExpense={deleteExpense}
              onDeleteIncome={deleteIncome}
            />
          </div>
          <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10">
            <AddExpenseModal AddExpense={addExpense} user={user} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
