import { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import {
  EXPENSE_CATEGORY_NAMES,
  EXPENSE_SUBCATEGORIES,
  INCOME_CATEGORY_NAMES,
  INCOME_SUBCATEGORIES,
  SUBCATEGORY_ICONS,
} from "../constants/categories";
import { formatAmountInput, roundMoney, sanitizeAmountInput } from "../utils/sanitizeAmount";

const emptyForm = (type = "expense") => ({
  title: "",
  amount: "",
  category: "",
  subcategory: "",
  type,
});

const formFromTransaction = (transaction) => ({
  title: transaction.title || "",
  amount: transaction.amount != null ? formatAmountInput(transaction.amount) : "",
  category: transaction.category || "",
  subcategory: transaction.subcategory || "",
  type: transaction.type === "income" ? "income" : "expense",
});

const AddExpenseModal = ({
  open,
  onClose,
  onSubmit,
  defaultType = "expense",
  onOpenRequest,
  editingTransaction = null,
}) => {
  const isEditing = Boolean(editingTransaction);
  const [formData, setFormData] = useState(emptyForm(defaultType));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFormData(
      editingTransaction ? formFromTransaction(editingTransaction) : emptyForm(defaultType)
    );
    setSaving(false);
  }, [open, defaultType, editingTransaction]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setFormData((prev) => ({ ...prev, [name]: sanitizeAmountInput(value) }));
    } else if (name === "category") {
      setFormData((prev) => ({ ...prev, [name]: value, subcategory: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      amount: roundMoney(formData.amount),
      category: formData.category,
      subcategory: formData.subcategory,
      type: formData.type,
      icon: SUBCATEGORY_ICONS[formData.subcategory],
    };

    try {
      setSaving(true);
      await onSubmit(payload, editingTransaction);
      onClose?.();
    } catch (_error) {
      // Parent shows toast
    } finally {
      setSaving(false);
    }
  };

  const subcategoryOptions =
    formData.type === "expense"
      ? EXPENSE_SUBCATEGORIES[formData.category]
      : INCOME_SUBCATEGORIES[formData.category];

  return (
    <>
      <button
        type="button"
        onClick={() => onOpenRequest?.()}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 h-14 pl-4 pr-5 bg-sage-600 hover:bg-sage-700 active:scale-95 text-white font-semibold rounded-2xl shadow-panel transition"
        aria-label="Add transaction"
      >
        <span className="text-2xl font-light leading-none">+</span>
        <span className="text-sm hidden sm:inline">Add</span>
      </button>

      <ModalShell
        open={open}
        onClose={() => {
          if (!saving) onClose?.();
        }}
        closeOnEscape={!saving}
        closeOnBackdrop={!saving}
        variant="sheet"
        maxWidth="md"
        zIndex={50}
        panelClassName="max-h-[92vh] overflow-y-auto"
        labelledBy="add-transaction-title"
      >
        <div className="flex justify-between items-center px-6 py-4 border-b border-ink/5 bg-sand-50/80 sticky top-0">
          <div>
            <h2 id="add-transaction-title" className="font-display text-lg font-semibold text-ink">
              {isEditing ? "Edit" : "Add"}{" "}
              {formData.type === "income" ? "income" : "expense"}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isEditing
                ? "Changes update your dashboard totals"
                : "Saved to this month’s dashboard"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-white flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEditing && (
            <div>
              <label className="sw-label">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`${
                    formData.type === "expense"
                      ? "bg-rose-600 text-white"
                      : "bg-sand-100 text-ink-soft hover:bg-sand-50"
                  } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                  onClick={() =>
                    setFormData({ ...emptyForm("expense"), type: "expense" })
                  }
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`${
                    formData.type === "income"
                      ? "bg-emerald-600 text-white"
                      : "bg-sand-100 text-ink-soft hover:bg-sand-50"
                  } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                  onClick={() =>
                    setFormData({ ...emptyForm("income"), type: "income" })
                  }
                >
                  Income
                </button>
              </div>
            </div>
          )}
          <div>
            <label className="sw-label">
              {formData.type === "expense" ? "What did you spend on?" : "What did you earn?"}
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              autoFocus
              className="sw-input"
              placeholder={formData.type === "expense" ? "e.g. Groceries" : "e.g. Salary"}
            />
          </div>
          <div>
            <label className="sw-label">Amount (₹)</label>
            <input
              type="text"
              name="amount"
              inputMode="decimal"
              value={formData.amount}
              onChange={handleInputChange}
              required
              className="sw-input"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="sw-label">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className="sw-input"
            >
              <option value="">Select category</option>
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
            <label className="sw-label">Sub-category</label>
            <select
              name="subcategory"
              value={formData.subcategory}
              onChange={handleInputChange}
              required
              disabled={!formData.category}
              className="sw-input disabled:opacity-60"
            >
              <option value="">
                {formData.category ? "Select sub-category" : "Choose a category first"}
              </option>
              {subcategoryOptions?.map((subcategory) => (
                <option key={subcategory} value={subcategory}>
                  {subcategory}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" disabled={saving} className="sw-btn-primary">
            {saving
              ? "Saving…"
              : isEditing
                ? `Update ${formData.type}`
                : `Save ${formData.type}`}
          </button>
        </form>
      </ModalShell>
    </>
  );
};

export default AddExpenseModal;
