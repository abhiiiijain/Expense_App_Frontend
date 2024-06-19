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

const Transactions = ({ expensess, userDetails }) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  if (!userDetails) {
    return null;
  }

  const filteredTransactions = expensess.filter((transaction) => {
    if (transaction.email !== userDetails.email) {
      return false;
    }
    if (selectedMainCategory === "All") {
      return true;
    }
    if (selectedSubcategory === "All") {
      return subcategories[selectedMainCategory].includes(
        transaction.subcategory
      );
    }
    return transaction.subcategory === selectedSubcategory;
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

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <>
      <div className="bg-white flex-wrap shadow-md rounded-lg p-5 w-full">
        <div className="p-2">
          <div className="flex flex-wrap items-center justify-between mb-4 w-full">
            <h3 className="text-xl font-bold mb-4">Transactions</h3>
            <select
              value={selectedMainCategory}
              onChange={(e) => {
                setSelectedMainCategory(e.target.value);
                setSelectedSubcategory("All");
              }}
              className="bg-white-200 border text-black px-3 py-1 rounded">
              {mainCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          {selectedMainCategory !== "All" && (
            <>
              <div>
                <button
                  className={`${
                    selectedSubcategory === "All"
                      ? "bg-blue-400 border-blue-400"
                      : "bg-transparent border-blue-400"
                  } text-black px-3 py-1 rounded mr-2 border`}
                  onClick={() => setSelectedSubcategory("All")}>
                  All
                </button>

                {subcategories[selectedMainCategory].map((subcategory) => (
                  <button
                    key={subcategory}
                    className={`${
                      selectedSubcategory === subcategory
                        ? "bg-blue-400 border-blue-400"
                        : "bg-transparent border-blue-400"
                    } text-black px-3 py-1 rounded mr-2 border`}
                    onClick={() => setSelectedSubcategory(subcategory)}>
                    <div className="text-sky font-xs">{subcategory}</div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Expenses showing */}
        <div>
          {Object.keys(groupedTransactions).map((date) => (
            <div key={date}>
              <h4 className="font-thin font-sans mb-2">{date}</h4>
              {groupedTransactions[date].map((transaction, index) => (
                <div key={index} className="flex items-center mb-4">
                  <span className="text-2xl mr-3">{transaction.icon}</span>
                  <div>
                    <div className="font-bold font-serif">
                      {transaction.title}
                    </div>
                    <div className="text-gray-500 text-sm font-serif">
                      {transaction.subcategory}
                    </div>
                  </div>
                  <div className="ml-auto text-grey-500">{`-₹${transaction.amount.toFixed(
                    2
                  )}`}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Transactions;
