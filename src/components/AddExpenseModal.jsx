import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ModalShell from "./ModalShell";
import { useCategories } from "../config/AppConfigContext";
import { SUBCATEGORY_ICONS } from "../constants/categoryMeta";
import { formatAmountInput, roundMoney, sanitizeAmountInput } from "../utils/sanitizeAmount";
import { formatCurrency } from "../utils/formatCurrency";
import {
  CARD_PAYMENT_SUBCATEGORY,
  EXTERNAL_PAY_FROM,
  isCardPaymentOnCreditAccount,
  suggestedCardPaymentTitle,
} from "../utils/creditCardPayments";
import { RESALE_INCOME_SUBCATEGORY } from "../utils/resaleSales";
import {
  REFUND_SUBCATEGORY,
  REFUND_WINDOW_DAYS,
  refundCapMessage,
  remainingWithEdit,
} from "../utils/spendRefunds";
import {
  formatChartDateLabel,
  formatDateKey,
  subDays,
  toDateInputValue,
  transactionDate,
} from "../utils/dateHelpers";

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
  settlesAccountId: "",
  note: "",
  refundOfExpenseId: "",
  resaleOfExpenseId: "",
});

const formFromTransaction = (transaction, fallbackAccountId, accounts = []) => {
  if (transaction.type === "transfer") {
    return {
      ...emptyForm("transfer", transaction.fromAccountId || fallbackAccountId),
      type: "transfer",
      amount: transaction.amount != null ? formatAmountInput(transaction.amount) : "",
      date: toDateInputValue(transactionDate(transaction)),
      fromAccountId: transaction.fromAccountId || fallbackAccountId || "",
      toAccountId: transaction.toAccountId || "",
      note: transaction.note || "",
    };
  }
  const paidOutside = isCardPaymentOnCreditAccount(transaction, accounts);
  return {
    title: transaction.title || "",
    amount: transaction.amount != null ? formatAmountInput(transaction.amount) : "",
    category: transaction.category || "",
    subcategory: transaction.subcategory || "",
    type: transaction.type === "income" ? "income" : "expense",
    date: toDateInputValue(transactionDate(transaction)),
    accountId: paidOutside ? EXTERNAL_PAY_FROM : transaction.accountId || fallbackAccountId || "",
    fromAccountId: fallbackAccountId || "",
    toAccountId: "",
    settlesAccountId:
      transaction.settlesAccountId || (paidOutside ? transaction.accountId : "") || "",
    note: "",
    refundOfExpenseId: transaction.refundOfExpenseId || "",
    resaleOfExpenseId: transaction.resaleOfExpenseId || "",
  };
};

const AddExpenseModal = ({
  open,
  onClose,
  onSubmit,
  defaultType = "expense",
  onOpenRequest,
  editingTransaction = null,
  accounts = [],
  defaultAccountId = "",
  preferredSettleAccountId = "",
  resaleLots = [],
  refundableExpenses = [],
}) => {
  const isEditing = Boolean(
    editingTransaction && !editingTransaction.isRefundDraft && !editingTransaction.isResaleDraft
  );
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
        ? formFromTransaction(editingTransaction, fallbackAccount, accounts)
        : emptyForm(defaultType, fallbackAccount)
    );
    setSaving(false);
  }, [open, defaultType, editingTransaction, fallbackAccount]);

  const isTransfer = formData.type === "transfer";
  const isCardPayment =
    !isTransfer &&
    formData.type === "expense" &&
    formData.subcategory === CARD_PAYMENT_SUBCATEGORY;
  const paidOutside = isCardPayment && formData.accountId === EXTERNAL_PAY_FROM;
  const creditAccounts = accounts.filter((account) => account.type === "credit");
  const payFromAccounts = isCardPayment
    ? accounts.filter((account) => account.type !== "credit")
    : accounts;
  const showCardSettle = isCardPayment && creditAccounts.length > 0;
  const isResale =
    !isTransfer && formData.type === "income" && formData.subcategory === RESALE_INCOME_SUBCATEGORY;
  const isRefund =
    !isTransfer && formData.type === "income" && formData.subcategory === REFUND_SUBCATEGORY;
  const editingIncome = isEditing ? editingTransaction : null;
  const leftover = (record, linkField) => remainingWithEdit(record, editingIncome, linkField);
  const selectedLot = resaleLots.find(
    (lot) => String(lot._id || lot.id) === String(formData.resaleOfExpenseId)
  );
  const selectedLotRemaining = selectedLot ? leftover(selectedLot, "resaleOfExpenseId") : 0;
  const selectedRefundExpense = refundableExpenses.find(
    (row) => String(row._id || row.id) === String(formData.refundOfExpenseId)
  );
  const selectedRefundRemaining = selectedRefundExpense
    ? leftover(selectedRefundExpense, "refundOfExpenseId")
    : 0;
  const refundOverLimit =
    isRefund &&
    Boolean(formData.refundOfExpenseId) &&
    (Number(formData.amount) || 0) > selectedRefundRemaining + 0.005;
  const saleAmount = Number(formData.amount) || 0;
  const resaleCost = Math.min(saleAmount, selectedLotRemaining);
  const resaleProfit = roundMoney(Math.max(0, saleAmount - resaleCost));

  useEffect(() => {
    if (formData.type !== "expense" || formData.subcategory !== CARD_PAYMENT_SUBCATEGORY) return;
    setFormData((prev) => {
      const credits = accounts.filter((account) => account.type === "credit");
      const fromCredit = credits.some((account) => String(account.id) === String(prev.accountId));
      const accountId = fromCredit ? EXTERNAL_PAY_FROM : prev.accountId;
      const paidFromOutside = accountId === EXTERNAL_PAY_FROM;
      const stillValid = credits.some(
        (account) =>
          String(account.id) === String(prev.settlesAccountId) &&
          (paidFromOutside || String(account.id) !== String(accountId))
      );
      const preferred = credits.find(
        (account) =>
          String(account.id) === String(preferredSettleAccountId) &&
          (paidFromOutside || String(account.id) !== String(accountId))
      );
      const nextSettle =
        (stillValid ? prev.settlesAccountId : "") ||
        preferred?.id ||
        credits.find((account) => paidFromOutside || String(account.id) !== String(accountId))
          ?.id ||
        "";
      const card = credits.find((account) => String(account.id) === String(nextSettle));
      const title = prev.title.trim() ? prev.title : suggestedCardPaymentTitle(card);
      if (
        accountId === prev.accountId &&
        nextSettle === prev.settlesAccountId &&
        title === prev.title
      ) {
        return prev;
      }
      return { ...prev, accountId, settlesAccountId: nextSettle, title };
    });
  }, [accounts, formData.type, formData.accountId, formData.subcategory, preferredSettleAccountId]);

  useEffect(() => {
    if (!isResale || formData.resaleOfExpenseId) return;
    const openLots = resaleLots.filter(
      (lot) => remainingWithEdit(lot, editingIncome, "resaleOfExpenseId") > 0.005
    );
    if (openLots.length !== 1) return;
    const onlyId = String(openLots[0]._id || openLots[0].id || "");
    if (!onlyId) return;
    setFormData((prev) =>
      prev.resaleOfExpenseId ? prev : { ...prev, resaleOfExpenseId: onlyId }
    );
  }, [editingIncome, formData.resaleOfExpenseId, isResale, resaleLots]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
      setFormData((prev) => ({ ...prev, [name]: sanitizeAmountInput(value) }));
    } else if (name === "category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subcategory: "",
        resaleOfExpenseId: "",
        refundOfExpenseId: "",
      }));
    } else if (name === "subcategory") {
      const openLots = resaleLots.filter((lot) => leftover(lot, "resaleOfExpenseId") > 0.005);
      const onlyLotId =
        openLots.length === 1 ? String(openLots[0]._id || openLots[0].id || "") : "";
      setFormData((prev) => ({
        ...prev,
        subcategory: value,
        resaleOfExpenseId:
          value === RESALE_INCOME_SUBCATEGORY ? prev.resaleOfExpenseId || onlyLotId : "",
        refundOfExpenseId: value === REFUND_SUBCATEGORY ? prev.refundOfExpenseId : "",
      }));
    } else if (name === "refundOfExpenseId") {
      const expense = refundableExpenses.find(
        (row) => String(row._id || row.id) === String(value)
      );
      const remaining = expense ? leftover(expense, "refundOfExpenseId") : 0;
      setFormData((prev) => {
        const current = Number(prev.amount) || 0;
        const overCap = remaining > 0.005 && current > remaining + 0.005;
        return {
          ...prev,
          refundOfExpenseId: value,
          title:
            prev.title.trim() ||
            (expense ? `${String(expense.title || "Expense").trim()} refund`.slice(0, 50) : ""),
          amount:
            !prev.amount || overCap
              ? remaining > 0.005
                ? formatAmountInput(remaining)
                : prev.amount
              : prev.amount,
        };
      });
    } else if (name === "fromAccountId") {
      setFormData((prev) => {
        const nextTo =
          String(prev.toAccountId) === String(value)
            ? accounts.find((account) => String(account.id) !== String(value))?.id || ""
            : prev.toAccountId;
        return { ...prev, fromAccountId: value, toAccountId: nextTo };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const setType = (type) => {
    if (isEditing && type === "transfer") return;
    if (type === "bill") {
      const credits = accounts.filter((account) => account.type === "credit");
      const settle =
        credits.find((account) => String(account.id) === String(preferredSettleAccountId))?.id ||
        credits[0]?.id ||
        "";
      const card = credits.find((account) => String(account.id) === String(settle));
      setFormData((prev) => ({
        ...emptyForm("expense", fallbackAccount, prev.date),
        type: "expense",
        title: suggestedCardPaymentTitle(card),
        amount: prev.amount,
        category: "Finance",
        subcategory: CARD_PAYMENT_SUBCATEGORY,
        accountId: fallbackAccount,
        settlesAccountId: settle,
      }));
      return;
    }
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
    if (isEditing) {
      setFormData((prev) => ({
        ...prev,
        type,
        category: "",
        subcategory: "",
        resaleOfExpenseId: "",
        refundOfExpenseId: "",
      }));
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
          icon: SUBCATEGORY_ICONS[formData.subcategory] || "🧾",
          date: formData.date,
          accountId: paidOutside ? formData.settlesAccountId : formData.accountId,
          ...(isCardPayment && formData.settlesAccountId
            ? { settlesAccountId: formData.settlesAccountId }
            : {}),
          ...(isRefund && formData.refundOfExpenseId
            ? { refundOfExpenseId: formData.refundOfExpenseId }
            : {}),
          ...(isResale && formData.resaleOfExpenseId
            ? { resaleOfExpenseId: formData.resaleOfExpenseId }
            : {}),
        };

    if (isRefund && refundOverLimit) {
      toast.error(refundCapMessage(selectedRefundRemaining, formatCurrency));
      return;
    }

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

  const refundDateKey = formData.date || toDateInputValue();
  const refundWindowStartKey = formatDateKey(
    subDays(new Date(`${refundDateKey}T12:00:00`), REFUND_WINDOW_DAYS)
  );
  const refundPurchaseOptions = isRefund
    ? refundableExpenses
        .filter((expense) => {
          const id = String(expense._id || expense.id);
          if (id === String(formData.refundOfExpenseId)) return true;
          const purchaseKey = formatDateKey(transactionDate(expense));
          if (purchaseKey < refundWindowStartKey || purchaseKey > refundDateKey) return false;
          return leftover(expense, "refundOfExpenseId") > 0.005;
        })
        .sort((a, b) => {
          const aTime = new Date(a.date || a.createdAt || 0).getTime();
          const bTime = new Date(b.date || b.createdAt || 0).getTime();
          return bTime - aTime;
        })
    : [];

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
                : isResale
                  ? "Links the sale to stock. Only profit is counted as income."
                  : isRefund
                    ? "Links the refund to the original purchase. Not counted as income."
                : isEditing
                  ? "Changes update your dashboard totals"
                  : "Pick the date it happened"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              if (!saving) onClose?.();
            }}
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-[var(--sw-elevated)] flex items-center justify-center"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {(!isEditing || editingTransaction?.type !== "transfer") && (
            <div>
              <label className="sw-label">Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className={`${
                    formData.type === "expense" && !isCardPayment
                      ? "bg-rose-600 text-white"
                      : "text-ink-soft hover:opacity-90"
                  } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                  style={
                    formData.type === "expense" && !isCardPayment
                      ? undefined
                      : { background: "var(--sw-muted-bg)" }
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
                {canTransfer && !isEditing && (
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
                {!isEditing && creditAccounts.length > 0 && (
                  <button
                    type="button"
                    className={`${
                      isCardPayment
                        ? "bg-amber-600 text-white"
                        : "text-ink-soft hover:opacity-90"
                    } px-3 py-2.5 rounded-xl text-sm font-semibold transition`}
                    style={isCardPayment ? undefined : { background: "var(--sw-muted-bg)" }}
                    onClick={() => setType("bill")}
                  >
                    Pay bill
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
                  maxLength={50}
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
                  <label className="sw-label">{isCardPayment ? "Paid from" : "Account"}</label>
                  <select
                    name="accountId"
                    value={formData.accountId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    {payFromAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.name}
                        {account.isDefault ? " (default)" : ""}
                      </option>
                    ))}
                    {isCardPayment && creditAccounts.length > 0 && (
                      <option value={EXTERNAL_PAY_FROM}>Outside SpendWise (family / other)</option>
                    )}
                  </select>
                  {paidOutside && (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      Reduces the card due. Does not change your other tracked accounts.
                    </p>
                  )}
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
              {isResale && (
                <div>
                  <label className="sw-label">Sold from</label>
                  <select
                    name="resaleOfExpenseId"
                    value={formData.resaleOfExpenseId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    <option value="">Select stock</option>
                    {resaleLots
                      .filter((lot) => {
                        const id = String(lot._id || lot.id);
                        return (
                          leftover(lot, "resaleOfExpenseId") > 0.005 ||
                          id === String(formData.resaleOfExpenseId)
                        );
                      })
                      .map((lot) => {
                        const id = String(lot._id || lot.id);
                        const remaining = leftover(lot, "resaleOfExpenseId");
                        const date = formatChartDateLabel(transactionDate(lot));
                        const cost = formatCurrency(lot.amount);
                        const label =
                          remaining + 0.005 < Number(lot.amount)
                            ? `${lot.title} · ${date} · ${formatCurrency(remaining)} left of ${cost}`
                            : `${lot.title} · ${date} · ${cost}`;
                        return (
                          <option key={id} value={id}>
                            {label}
                          </option>
                        );
                      })}
                  </select>
                  {resaleLots.length === 0 ? (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      Add the purchase first as Shopping → Resale inventory.
                    </p>
                  ) : selectedLot && saleAmount > 0.005 ? (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      {resaleProfit > 0.005
                        ? `${formatCurrency(resaleProfit)} counted as income · ${formatCurrency(resaleCost)} recovers stock`
                        : "Stock recovery · not counted as income"}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      Only the profit after this stock cost is counted as income.
                    </p>
                  )}
                </div>
              )}
              {isRefund && (
                <div>
                  <label className="sw-label">Refund of</label>
                  <select
                    name="refundOfExpenseId"
                    value={formData.refundOfExpenseId}
                    onChange={handleInputChange}
                    required
                    className="sw-input"
                  >
                    <option value="">Select purchase</option>
                    {refundPurchaseOptions.map((expense) => {
                      const id = String(expense._id || expense.id);
                      const remaining = leftover(expense, "refundOfExpenseId");
                      const date = formatChartDateLabel(transactionDate(expense));
                      const card =
                        accounts.find((account) => String(account.id) === String(expense.accountId))
                          ?.name || "Card";
                      const cost = formatCurrency(expense.amount);
                      const amountLabel =
                        remaining + 0.005 < Number(expense.amount)
                          ? `${formatCurrency(remaining)} left of ${cost}`
                          : cost;
                      return (
                        <option key={id} value={id}>
                          {`${expense.title} · ${card} · ${date} · ${amountLabel}`}
                        </option>
                      );
                    })}
                  </select>
                  {refundPurchaseOptions.length === 0 ? (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      No card purchases in the last {REFUND_WINDOW_DAYS} days to refund.
                    </p>
                  ) : refundOverLimit ? (
                    <p className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400">
                      {refundCapMessage(selectedRefundRemaining, formatCurrency)}
                    </p>
                  ) : selectedRefundExpense ? (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      {selectedRefundRemaining + 0.005 < Number(selectedRefundExpense.amount)
                        ? `${formatCurrency(selectedRefundRemaining)} left of ${formatCurrency(selectedRefundExpense.amount)}. Later refunds of this item can't go past that.`
                        : `Can't refund more than ${formatCurrency(selectedRefundRemaining)} on this purchase.`}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-ink-muted">
                      Card purchases from the last {REFUND_WINDOW_DAYS} days. Not counted as income.
                    </p>
                  )}
                </div>
              )}
              {showCardSettle && (
                <div>
                  <label className="sw-label">Pays toward</label>
                  <select
                    name="settlesAccountId"
                    value={formData.settlesAccountId}
                    onChange={handleInputChange}
                    className="sw-input"
                  >
                    {creditAccounts
                      .filter((account) => String(account.id) !== String(formData.accountId))
                      .map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </>
          )}

          <button type="submit" disabled={saving || refundOverLimit} className="sw-btn-primary">
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
