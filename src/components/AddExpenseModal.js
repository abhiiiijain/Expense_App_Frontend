import React, { useState, useEffect } from "react";
import {
  EXPENSE_CATEGORY_NAMES,
  EXPENSE_SUBCATEGORIES,
  INCOME_CATEGORY_NAMES,
  INCOME_SUBCATEGORIES,
  SUBCATEGORY_ICONS,
} from "../constants/categories";

const AddExpenseModal = ({ AddExpense }) => {
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "",
    subcategory: "",
    type: "expense",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      const sanitizedValue = value.replace(/[^0-9.]/g, "");
      if (Number.isNaN(Number(sanitizedValue)) || sanitizedValue === "") {
        setFormData({ ...formData, [name]: "" });
      } else {
        setFormData({ ...formData, [name]: sanitizedValue });
      }
    } else if (name === "category") {
      setFormData({ ...formData, [name]: value, subcategory: "" });
    } else if (name === "type") {
      setFormData({ ...formData, [name]: value, category: "", subcategory: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      amount: formData.amount,
      category: formData.category,
      subcategory: formData.subcategory,
      type: formData.type,
      icon: SUBCATEGORY_ICONS[formData.subcategory],
    };

    try {
      await AddExpense(payload);
      setShowModal(false);
      setFormData({
        title: "",
        amount: "",
        category: "",
        subcategory: "",
        type: formData.type,
      });
    } catch (_error) {
      // Parent handles API errors
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
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showModal]);

  const subcategoryOptions =
    formData.type === "expense"
      ? EXPENSE_SUBCATEGORIES[formData.category]
      : INCOME_SUBCATEGORIES[formData.category];

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-2xl font-light rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition"
        aria-label="Add transaction"
      >
        +
      </button>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-transaction-title"
          >
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100">
              <h2 id="add-transaction-title" className="text-lg font-bold text-gray-900">
                Add Transaction
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-gray-700">Type</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    className={`${
                      formData.type === "expense"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    } px-3 py-2 rounded`}
                    onClick={() =>
                      setFormData({ ...formData, type: "expense", category: "", subcategory: "" })
                    }
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    className={`${
                      formData.type === "income"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    } px-3 py-2 rounded`}
                    onClick={() =>
                      setFormData({ ...formData, type: "income", category: "", subcategory: "" })
                    }
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category</option>
                  {(formData.type === "expense" ? EXPENSE_CATEGORY_NAMES : INCOME_CATEGORY_NAMES).map(
                    (category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    )
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
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Sub-category</option>
                  {subcategoryOptions?.map((subcategory) => (
                    <option key={subcategory} value={subcategory}>
                      {subcategory}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl transition"
                >
                  Add transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AddExpenseModal;
