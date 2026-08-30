import { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import { useCategories } from "../config/AppConfigContext";
import { SUBCATEGORY_ICONS } from "../constants/categoryMeta";
import { formatAmountInput, roundMoney, sanitizeAmountInput } from "../utils/sanitizeAmount";
import { toDateInputValue, transactionDate } from "../utils/dateHelpers";

const emptyForm = (type = "expense", accountId = "", date = toDateInputValue()) => ({
  title: "",
  amount: "",
  category: "",
  subcategory: "",
  type,
  date,
  accountId,
  fromAccountId: accountId,
  toAccountId: "",
  note: "",
});

const formFromTransaction = (transaction, fallbackAccountId) => ({
  title: transaction.title || "",
  amount: transaction.amount != null ? formatAmountInput(transaction.amount) : "",
  category: transaction.category || "",
  subcategory: transaction.subcategory || "",
  type: transaction.type === "income" ? "income" : "expense",
  date: toDateInputValue(transactionDate(transaction)),
  accountId: transaction.accountId || fallbackAccountId || "",
  fromAccountId: fallbackAccountId || "",
  toAccountId: "",
  note: "",
});

const AddExpenseModal = ({
  open,
  onClose,
  onSubmit,
  defaultType = "expense",
  onOpenRequest,
  editingTransaction = null,
  accounts = [],
  defaultAccountId = "",
}) => {
  const isEditing = Boolean(editingTransaction);
  const canTransfer = accounts.length >= 2;
  const fallbackAccount =
    defaultAccountId || accounts.find((a) => a.isDefault)?.id || accounts[0]?.id || "";
  const [formData, setFormData] = useState(emptyForm(defaultType, fallbackAccount));
  const [saving, setSaving] = useState(false);
  const {
    expenseCategoryNames,
    expenseSubcategories,
    incomeCategoryNames,
    incomeSubcategories,
  } = useCategories();

  useEffect(() => {
    if (!open) return;
    setFormData(
      editingTransaction
        ? formFromTransaction(editingTransaction, fallbackAccount)
        : emptyForm(defaultType, fallbackAccount)
    );
    setSaving(false);
  }, [open, defaultType, editingTransaction, fallbackAccount]);

  const isTransfer = formData.type === "transfer";

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

  const setType = (type) => {
    if (type === "transfer") {
      const from = formData.fromAccountId || formData.accountId || fallbackAccount;
      const to =
        accounts.find((a) => String(a.id) !== String(from))?.id || "";
      setFormData({
        ...emptyForm("transfer", from, formData.date),
        type: "transfer",
        fromAccountId: from,
        toAccountId: to,
      });
      return;
    }
    setFormData({
      ...emptyForm(type, formData.accountId || fallbackAccount, formData.date),
      type,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = isTransfer
      ? {
          type: "transfer",
          amount: roundMoney(formData.amount),
          date: formData.date,
          fromAccountId: formData.fromAccountId,
          toAccountId: formData.toAccountId,
          note: formData.note.trim(),
        }
      : {
          title: formData.title,
          amount: roundMoney(formData.amount),
          category: formData.category,
          subcategory: formData.subcategory,
          type: formData.type,
          icon: SUBCATEGORY_ICONS[formData.subcategory],
          date: formData.date,
          accountId: formData.accountId,
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
      ? expenseSubcategories[formData.category]
      : incomeSubcategories[formData.category];

  const typeLabel = isTransfer
    ? "transfer"
    : formData.type === "income"
      ? "income"
      : "expense";

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
        <div
          className="flex justify-between items-center px-6 py-4 sticky top-0"
          style={{
            borderBottom: "1px solid var(--sw-border)",
            background: "var(--sw-muted-bg)",
          }}
        >
          <div>
            <h2 id="add-transaction-title" className="font-display text-lg font-semibold text-ink">
              {isEditing ? "Edit" : "Add"} {typeLabel}
            </h2>
            <p className="text-xs text-ink-muted mt-0.5">
              {isTransfer
                ? "Moves money between your accounts — not counted as income or spending"
                : isEditing
                  ? "Changes update your dashboard totals"
                  : "Pick the date it happened"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-[var(--sw-elevated)] flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!isEditing && (
            <div>
              <label className="sw-label">Type</label>
              <div className={`grid gap-2 ${canTransfer ? "grid-cols-3" : "grid-cols-2"}`}>
                <button
                  type="button"
                  className={`${
                    formData.type === "expense"
                      ? "bg-rose-600 text-white"
                      : "text-ink-soft hover:opacity-90"
                  } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                  style={
                    formData.type === "expense" ? undefined : { background: "var(--sw-muted-bg)" }
                  }
                  onClick={() => setType("expense")}
                >
                  Expense
                </button>
                <button
                  type="button"
                  className={`${
                    formData.type === "income"
                      ? "bg-emerald-600 text-white"
                      : "text-ink-soft hover:opacity-90"
                  } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                  style={
                    formData.type === "income" ? undefined : { background: "var(--sw-muted-bg)" }
                  }
                  onClick={() => setType("income")}
                >
                  Income
                </button>
                {canTransfer && (
                  <button
                    type="button"
                    className={`${
                      isTransfer
                        ? "bg-sage-600 text-white"
                        : "text-ink-soft hover:opacity-90"
                    } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                    style={isTransfer ? undefined : { background: "var(--sw-muted-bg)" }}
                    onClick={() => setType("transfer")}
                  >
                    Transfer
                  </button>
                )}
              </div>
            </div>
          )}

          {isTransfer ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="sw-label">From</label>
                  <select
                    name="fromAccountId"
                    value={formData.fromAccountId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="sw-label">To</label>
                  <select
                    name="toAccountId"
                    value={formData.toAccountId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    {accounts
                      .filter((a) => String(a.id) !== String(formData.fromAccountId))
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="sw-label">Amount (₹)</label>
                  <input
                    type="text"
                    name="amount"
                    inputMode="decimal"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    className="sw-input"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="sw-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  />
                </div>
              </div>
              <div>
                <label className="sw-label">Note (optional)</label>
                <input
                  type="text"
                  name="note"
                  value={formData.note}
                  onChange={handleInputChange}
                  className="sw-input"
                  placeholder="e.g. Moved to savings"
                />
              </div>
            </>
          ) : (
            <>
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
              <div className="grid grid-cols-2 gap-3">
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
                  <label className="sw-label">Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  />
                </div>
              </div>
              {accounts.length > 0 && (
                <div>
                  <label className="sw-label">Account</label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    {accounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                        {account.isDefault ? " (default)" : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}
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
                  {(formData.type === "expense" ? expenseCategoryNames : incomeCategoryNames).map(
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
            </>
          )}

          <button type="submit" disabled={saving} className="sw-btn-primary">
            {saving
              ? "Saving…"
              : isEditing
                ? `Update ${typeLabel}`
                : isTransfer
                  ? "Transfer"
                  : `Save ${typeLabel}`}
          </button>
        </form>
      </ModalShell>
    </>
  );
};

export default AddExpenseModal;
