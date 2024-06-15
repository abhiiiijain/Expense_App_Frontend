import React, { useEffect, useState } from "react";

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

const Transactions = (props) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");

  const filteredTransactions = props.expensess.filter((transaction) => {
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
      const date = new Date(transaction.createdAt).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(transaction);
      return groups;
    }, {});
  };

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  return (
    <div className="bg-white shadow-md rounded-lg p-5 w-1/2">
      <div className="p-2">
        <div className="flex items-center justify-between mb-4">
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
                className={`bg-${
                  selectedSubcategory === "All" ? "blue" : "gray"
                }-500 text-black px-3 py-1 rounded mr-2`}
                onClick={() => setSelectedSubcategory("All")}>
                All
              </button>

              {subcategories[selectedMainCategory].map((subcategory) => (
                <button
                  key={subcategory}
                  className={`bg-${
                    selectedSubcategory === subcategory ? "blue" : "gray"
                  }-200 text-black px-3 py-1 rounded mr-2`}
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
            <h4 className="font-thin  mb-2">{date}</h4>
            {groupedTransactions[date].map((transaction, index) => (
              <div key={index} className="flex items-center mb-4">
                <span className="text-2xl mr-3">{transaction.icon}</span>
                <div>
                  <div className="font-bold">{transaction.title}</div>
                  <div className="text-gray-500">{transaction.subcategory}</div>
                </div>
                <div className="ml-auto text-grey-500">{`₹${transaction.amount.toFixed(
                  2
                )}`}</div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Transactions;
