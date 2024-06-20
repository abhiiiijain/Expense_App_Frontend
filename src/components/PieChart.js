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
      <div className="bg-white shadow-md rounded-lg p-5 w-full">
        <div className="font-bold">This Month</div>
        <div className="flex flex-row justify-center">
          <DoughnutChart expensess={expensess} user={user} />
          <div className="ml-4">
            {categories.map((category) => (
              <div
                key={category.name}
                className="flex flex-row items-center mb-2">
                <div
                  className="w-8 h-8 mr-2 rounded-md"
                  style={{ backgroundColor: category.color }}></div>
                <div className="flex flex-col">
                  <div>{category.name}</div>
                  <div>₹{categorySums[category.name].toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default PieChart;
