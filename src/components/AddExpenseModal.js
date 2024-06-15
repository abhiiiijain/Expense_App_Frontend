import React, { useState } from "react";

const AddExpenseModal = (props) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    subcategory: "",
  });

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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      // Allow only numbers and decimal points
      const sanitizedValue = value.replace(/[^0-9.]/g, "");

      // If the sanitized value is not a number, set the amount to an empty string
      if (isNaN(sanitizedValue) || sanitizedValue === "") {
        setFormData({ ...formData, [name]: "" });
      } else {
        setFormData({ ...formData, [name]: sanitizedValue });
      }
    } else if (name === "category") {
      setFormData({ ...formData, [name]: value, subcategory: "" });
    } else if (name === "subcategory") {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    const hours = String(currentDate.getHours()).padStart(2, "0");
    const minutes = String(currentDate.getMinutes()).padStart(2, "0");
    const seconds = String(currentDate.getSeconds()).padStart(2, "0");
    const milliseconds = String(currentDate.getMilliseconds()).padStart(3, "0");
    const isoString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${milliseconds}Z`;

    let obj = {
      ...formData,
      icon: subcategoryIcons[formData.subcategory], // Add the icon corresponding to the subcategory
      _id: Math.random(),
      type: "expense",
      __v: 0,
      createdAt: isoString,
      updatedAt: isoString,
    };

    try {
      await props.AddExpense(obj);
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

  return (
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
              <h2 className="text-lg font-semibold">New Expense</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600">
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700">
                  What did you spend on?
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
                  <option value="Essential Expenses">Essential Expenses</option>
                  <option value="Non-Essential Expenses">
                    Non-Essential Expenses
                  </option>
                  <option value="Savings and Investments">
                    Savings and Investments
                  </option>
                  <option value="Miscellaneous">Miscellaneous</option>
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
                  {formData.category &&
                    subcategories[formData.category].map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {/* {subcategoryIcons[subcategory]} */}
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
  );
};

export default AddExpenseModal;
