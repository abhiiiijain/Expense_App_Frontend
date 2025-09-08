import React, { useState, useEffect } from "react";

const AddExpenseModal = ({ AddExpense, user }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    subcategory: "",
    type: "expense",
  });

  const expenseSubcategories = {
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

  const incomeCategories = [
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

  const subcategoryIcons = {
    Housing: "🏠",
    Transportation: "🚗",
    Food: "🍔",
    "Utilities and Services": "💡",
    Healthcare: "⚕️",
    Insurance: "📑",
    "Debt Repayments": "💳",
    "Entertainment and Leisure": "🎉",
    "Personal Care": "💅",
    "Clothing and Accessories": "👗",
    Savings: "💰",
    Investments: "📈",
    "Education and Self-Improvement": "🎓",
    "Gifts and Donations": "🎁",
    Miscellaneous: "🛠️",
    Salary: "💼",
    Bonus: "💲",
    Freelance: "🧑‍💻",
    "Side Hustle": "🧰",
    Dividends: "🧾",
    Interest: "💹",
    Gift: "🎁",
    "Tax Refund": "🔁",
    Other: "🔖",
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Allow only numbers and decimal points
      const sanitizedValue = value.replace(/[^0-9.]/g, "");

      if (isNaN(sanitizedValue) || sanitizedValue === "") {
        setFormData({ ...formData, [name]: "" });
      } else {
        setFormData({ ...formData, [name]: sanitizedValue });
      }
    } else if (name === "category") {
      setFormData({ ...formData, [name]: value, subcategory: "" });
    } else if (name === "subcategory") {
      setFormData({ ...formData, [name]: value });
    } else if (name === "type") {
      setFormData({ ...formData, [name]: value, category: "", subcategory: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let obj = {
      ...formData,
      icon: subcategoryIcons[formData.subcategory],
      email: user.email,
    };

    try {
      await AddExpense(obj);
      setShowModal(false);
      setFormData({
        title: "",
        amount: "",
        category: "",
        subcategory: "",
      });
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setShowModal(false);
      }
    };

    if (showModal) {
      window.addEventListener("keydown", handleKeyDown);
    } else {
      window.removeEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  return (
    <>
      <div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-500 text-white font-bold py-2 px-4 rounded-full fixed bottom-10 right-10 shadow-lg">
          +
        </button>
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50">
            <div className="bg-white rounded-lg overflow-hidden shadow-xl transform transition-all max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Add Transaction</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600">
                  &times;
                </button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-gray-700">Type</label>
                  <div className="mt-1 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      className={`${formData.type === "expense" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-2 rounded`}
                      onClick={() => setFormData({ ...formData, type: "expense", category: "", subcategory: "" })}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      className={`${formData.type === "income" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"} px-3 py-2 rounded`}
                      onClick={() => setFormData({ ...formData, type: "income", category: "", subcategory: "" })}
                    >
                      Income
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-gray-700">
                    {formData.type === "expense" ? "What did you spend on?" : "What did you earn?"}
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Amount</label>
                  <input
                    type="text"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-gray-700">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Category</option>
                    {formData.type === "expense" ? (
                      <>
                        <option value="Essential Expenses">Essential Expenses</option>
                        <option value="Non-Essential Expenses">Non-Essential Expenses</option>
                        <option value="Savings and Investments">Savings and Investments</option>
                        <option value="Miscellaneous">Miscellaneous</option>
                      </>
                    ) : (
                      <>
                        {incomeCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700">Sub-category</label>
                  <select
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Select Sub-category</option>
                    {formData.category && (
                      formData.type === "expense"
                        ? expenseSubcategories[formData.category]
                        : incomeSubcategories[formData.category]
                    )?.map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="bg-blue-500 text-white font-bold py-2 px-4 rounded">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default AddExpenseModal;
