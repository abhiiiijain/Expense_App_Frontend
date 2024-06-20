import React, { useEffect, useState } from "react";
import PieChart from "./components/PieChart";
import Transactions from "./components/Transactions";
import BarChart from "./components/BarChart";
import AddExpenseModal from "./components/AddExpenseModal";
import axios from "axios";
import {
  auth,
  // db
} from "./auth/Firebase";
// import { doc, getDoc } from "firebase/firestore";

export const BASE_URL = "http://localhost:5000/api/v1/";
// export const BASE_URL = "https://expenseappbackend-bqd2.onrender.com/api/v1/";

function App() {
  // profile
  // const [userDetails, setUserDetails] = useState(null);
  const [user, setUser] = useState(null);
  const [showLogout, setShowLogout] = useState(false);

  // const fetchUserData = async () => {
  //   auth.onAuthStateChanged(async (user) => {
  //     console.log(user);

  //     const docRef = doc(db, "Users", user.uid);
  //     const docSnap = await getDoc(docRef);
  //     if (docSnap.exists()) {
  //       setUserDetails(docSnap.data());
  //       // console.log(docSnap.data());
  //     } else {
  //       console.log("User is not logged in");
  //     }
  //   });
  // };

  // useEffect(() => {
  //   fetchUserData();
  // }, []);

  // console.log(userDetails);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  console.log(user);

  async function handleLogout() {
    try {
      await auth.signOut();
      window.location.href = "/login";
      console.log("User logged out successfully!");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  const [error, setError] = useState(null);
  let [expenses, setExpenses] = useState([]);

  const getExpenses = async () => {
    const response = await axios.get(`${BASE_URL}get-expenses`);
    setExpenses(response.data);
    // console.log(response.data);
  };

  const addExpense = async (expense) => {
    // console.log(expense);
    const response = await axios
      .post(`${BASE_URL}add-expense`, expense)
      .catch((err) => {
        setError(err.response.data.message);
      });
    getExpenses();
  };

  useEffect(() => {
    getExpenses();
  }, []);

  return (
    <>
      {/* main section */}
      <div className="bg-gray-100 relative flex flex-col items-center">
        <header className="w-[90%] flex justify-between items-center p-5">
          <img src="./logo.png" alt="Logo" className="h-10" />

          {user ? (
            <>
              <h1>Welcome {user.firstName}</h1>
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
                    onClick={handleLogout}>
                    Logout
                  </button>
                )}
              </div>
            </>
          ) : (
            <p>Not Logged In</p>
          )}
        </header>
        <main className="flex justify-center gap-10 p-3 w-full px-50">
          <div className="flex flex-col gap-10 w-[50%]">
            <PieChart expensess={expenses} user={user} />
            <BarChart expensess={expenses} user={user} />
          </div>
          <div className="flex flex-wrap w-[30%]">
            <Transactions expensess={expenses} user={user} />
          </div>
          <div className="fixed bottom-10 right-10">
            <AddExpenseModal AddExpense={addExpense} user={user} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
