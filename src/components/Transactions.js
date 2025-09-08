import React, { useState } from "react";

const mainCategories = [
  "All",
  "Essential Expenses",
  "Non-Essential Expenses",
  "Savings and Investments",
  "Miscellaneous",
];

const subcategories = {
  "Essential Expenses": [
    "Housing",
    "Transportation",
    "Food",
    "Utilities and Services",
    "Healthcare",
    "Insurance",
    "Debt Repayments",
  ],
  "Non-Essential Expenses": [
    "Entertainment and Leisure",
    "Personal Care",
    "Clothing and Accessories",
  ],
  "Savings and Investments": ["Savings", "Investments"],
  Miscellaneous: [
    "Education and Self-Improvement",
    "Gifts and Donations",
    "Miscellaneous",
  ],
};

const incomeMainCategories = [
  "All",
  "Primary Income",
  "Secondary Income",
  "Investments",
  "Gifts & Refunds",
  "Other Income",
];

const incomeSubcategories = {
  "Primary Income": ["Salary", "Bonus"],
  "Secondary Income": ["Freelance", "Side Hustle"],
  Investments: ["Dividends", "Interest"],
  "Gifts & Refunds": ["Gift", "Tax Refund"],
  "Other Income": ["Other"],
};

const Transactions = ({ expenses = [], incomes = [], user }) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedIncomeMainCategory, setSelectedIncomeMainCategory] =
    useState("All");
  const [selectedIncomeSubcategory, setSelectedIncomeSubcategory] =
    useState("All");

  if (!user) {
    return null;
  }

  // Expenses filtering (based on expense categories)
  const filteredExpenses = expenses.filter((transaction) => {
    if (transaction.email !== user.email) {
      return false;
    }
    if (selectedMainCategory === "All") {
      return true;
    }
    if (selectedSubcategory === "All") {
      return subcategories[selectedMainCategory]?.includes(
        transaction.subcategory
      );
    }
    return transaction.subcategory === selectedSubcategory;
  });

  // Incomes filtering (with income categories)
  const filteredIncomes = incomes.filter((transaction) => {
    if (transaction.email !== user.email) return false;
    if (selectedIncomeMainCategory === "All") return true;
    if (selectedIncomeSubcategory === "All") {
      return incomeSubcategories[selectedIncomeMainCategory]?.includes(
        transaction.subcategory
      );
    }
    return transaction.subcategory === selectedIncomeSubcategory;
  });

  const groupTransactionsByDate = (transactions) => {
    return transactions.reduce((groups, transaction) => {
      const date = new Date(transaction.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let dateKey;
      if (date.toDateString() === today.toDateString()) {
        dateKey = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        dateKey = "Yesterday";
      } else {
        dateKey = date.toLocaleDateString();
      }

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(transaction);
      return groups;
    }, {});
  };

  const groupedExpenses = groupTransactionsByDate(filteredExpenses);
  const groupedIncomes = groupTransactionsByDate(filteredIncomes);

  return (
    <>
      {/* Expenses Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100 mb-6 overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 w-full">
          <h3 className="text-lg font-extrabold text-gray-900">Expenses</h3>
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubcategory("All");
            }}
            className="border border-blue-200 text-blue-700 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
          >
            {mainCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedMainCategory !== "All" && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className={`${selectedSubcategory === "All"
                ? "bg-blue-100 text-blue-800 border-blue-200"
                : "bg-white text-blue-600 border-blue-200 hover:bg-blue-50"
                } border text-sm px-3 py-1.5 rounded-full transition`}
              onClick={() => setSelectedSubcategory("All")}
            >
              All
            </button>

            {subcategories[selectedMainCategory]?.map((subcategory) => {
              const active = selectedSubcategory === subcategory;
              return (
                <button
                  key={subcategory}
                  className={`${active
                    ? "bg-blue-600 text-white"
                    : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
                    } text-sm px-3 py-1.5 rounded-full transition`}
                  onClick={() => setSelectedSubcategory(subcategory)}
                >
                  {subcategory}
                </button>
              );
            })}
          </div>
        )}

        {/* Expenses list */}
        <div className="space-y-5">
          {Object.keys(groupedExpenses).map((date) => (
            <div key={date}>
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                {date}
              </h4>
              <div className="space-y-2">
                {groupedExpenses[date].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-xl">
                      {transaction.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {transaction.title}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {transaction.subcategory}
                      </div>
                    </div>
                    <div className="ml-auto font-bold text-gray-900">
                      {`-₹${transaction.amount.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Incomes Card */}
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 w-full">
          <h3 className="text-lg font-extrabold text-gray-900">Incomes</h3>
          <select
            value={selectedIncomeMainCategory}
            onChange={(e) => {
              setSelectedIncomeMainCategory(e.target.value);
              setSelectedIncomeSubcategory("All");
            }}
            className="border border-green-200 text-green-700 bg-white rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            {incomeMainCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedIncomeMainCategory !== "All" && (
          <div className="mb-4 flex flex-wrap gap-2">
            <button
              className={`${selectedIncomeSubcategory === "All"
                  ? "bg-green-100 text-green-800 border-green-200"
                  : "bg-white text-green-600 border-green-200 hover:bg-green-50"
                } border text-sm px-3 py-1.5 rounded-full transition`}
              onClick={() => setSelectedIncomeSubcategory("All")}
            >
              All
            </button>

            {incomeSubcategories[selectedIncomeMainCategory]?.map(
              (subcategory) => {
                const active = selectedIncomeSubcategory === subcategory;
                return (
                  <button
                    key={subcategory}
                    className={`${active
                        ? "bg-green-600 text-white"
                        : "bg-white text-green-600 border border-green-200 hover:bg-green-50"
                      } text-sm px-3 py-1.5 rounded-full transition`}
                    onClick={() => setSelectedIncomeSubcategory(subcategory)}
                  >
                    {subcategory}
                  </button>
                );
              }
            )}
          </div>
        )}

        {/* Incomes list */}
        <div className="space-y-5">
          {Object.keys(groupedIncomes).map((date) => (
            <div key={date}>
              <h4 className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                {date}
              </h4>
              <div className="space-y-2">
                {groupedIncomes[date].map((transaction, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition border border-gray-100 rounded-xl p-3"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-xl">
                      {transaction.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">
                        {transaction.title}
                      </div>
                      <div className="text-gray-500 text-xs">
                        {transaction.subcategory}
                      </div>
                    </div>
                    <div className="ml-auto font-bold text-green-700">
                      {`+₹${transaction.amount.toFixed(2)}`}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Transactions;
