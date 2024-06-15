import React, { useEffect, useState } from "react";
import PieChart from "./components/PieChart";
import Transactions from "./components/Transactions";
import BarChart from "./components/BarChart";
import AddExpenseModal from "./components/AddExpenseModal";
import axios from "axios";

const BASE_URL = "http://localhost:5000/api/v1/";

function App() {
  const [error, setError] = useState(null);
  let [expenses, setExpenses] = useState([]);

  // const {expenses, getExpenses} = useGlobalContext()
  const getExpenses = async () => {
    const response = await axios.get(`${BASE_URL}get-expenses`);
    setExpenses(response.data);
    console.log(response.data);
  };

  const addExpense = async (expense) => {
    console.log(expense);
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

  // expenses = expenses.map((data) => {
  //   return {
  //     ...data,
  //     icon: "💡",
  //   };
  // });

  return (
    <>
      {/* <div className="flex w-full h-screen">
        <div className="w-full flex items-center justify-center lg:w-1/2">
          <Form />
        </div>
        <div className="hidden lg:flex h-full w-1/2 items-center justify-center bg-gray-200">
          <div className="w-60 h-60 bg-gradient-to-tr from-violet-500 to-pink-500 rounded-full animate-bounce" />
          <div className="w-full  absolute bg-white/10 backdrop-blur-lg" />
        </div>
      </div> */}

      {/* main section */}
      <div className="bg-gray-100 relative  flex flex-col items-center">
        <header className="w-3/4 flex justify-between items-center p-5">
          <img src="./logo.png" alt="Logo" className="h-10" />
          <img src="/icon.png" alt="Icon" className="h-8" />
        </header>
        <main className="flex flex-wrap justify-center gap-10 p-3 w-full">
          <div className=" flex flex-col gap-10 ">
            <PieChart expensess={expenses} />
            <BarChart expensess={expenses} />
          </div>

          <Transactions expensess={expenses} />
          <div className="fixed bottom-10 right-10">
            <AddExpenseModal AddExpense={addExpense} />
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
