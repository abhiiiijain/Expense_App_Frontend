import React from "react";
import DoughnutChart from "./DoughnutChart";

function PieChart(props) {
  const { expensess, user } = props;

  if (!user) {
    return null;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const userExpenses = expensess.filter(
    (expense) =>
      expense.email === user.email &&
      new Date(expense.createdAt).getMonth() === currentMonth &&
      new Date(expense.createdAt).getFullYear() === currentYear
  );

  const categorySums = {
    "Essential Expenses": 0,
    "Non-Essential Expenses": 0,
    "Savings and Investments": 0,
    Miscellaneous: 0,
  };

  userExpenses.forEach((data) => {
    if (categorySums.hasOwnProperty(data.category)) {
      categorySums[data.category] += data.amount;
    }
  });

  const categories = [
    { name: "Essential Expenses", color: "#36A2EB" },
    { name: "Non-Essential Expenses", color: "#FFCE56" },
    { name: "Savings and Investments", color: "#4BC0C0" },
    { name: "Miscellaneous", color: "#C0C0C0" },
  ];

  return (
    <>
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-gray-400">Overview</div>
            <div className="font-extrabold text-gray-900">This Month</div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
          <div className="w-full sm:w-auto max-w-[260px] min-w-[220px]">
            <DoughnutChart expensess={expensess} user={user} />
          </div>
          <div className="grid grid-cols-1 gap-3 w-full sm:w-auto">
            {categories.map((category) => (
              <div key={category.name} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3">
                <div className="flex items-center">
                  <div
                    className="w-3.5 h-3.5 mr-3 rounded-sm"
                    style={{ backgroundColor: category.color }}></div>
                  <div className="text-sm text-gray-700">{category.name}</div>
                </div>
                <div className="text-sm font-bold text-gray-900">₹{categorySums[category.name].toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PieChart;
