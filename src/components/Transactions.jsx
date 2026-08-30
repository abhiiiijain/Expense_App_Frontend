import { memo, useMemo, useState } from "react";
import { useAppConfig, useCategories } from "../config/AppConfigContext";
import {
  groupTransactionsByDate,
  isTransactionEditable,
} from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";
import ConfirmModal from "./ConfirmModal";
import EmptyState from "./EmptyState";

function filterByCategory(transactions, mainCategory, subcategory) {
  if (mainCategory === "All") {
    return transactions;
  }

  const byCategory = transactions.filter(
    (transaction) => transaction.category === mainCategory
  );

  if (subcategory === "All") {
    return byCategory;
  }

  return byCategory.filter((transaction) => transaction.subcategory === subcategory);
}

function filterBySearch(transactions, query) {
  const q = query.trim().toLowerCase();
  if (!q) return transactions;
  return transactions.filter((tx) => {
    const haystack = `${tx.title} ${tx.category} ${tx.subcategory}`.toLowerCase();
    return haystack.includes(q);
  });
}

function FilterChips({ options, selected, onSelect, activeClass, inactiveClass }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {options.map((option) => {
        const active = selected === option;
        return (
          <button
            key={option}
            type="button"
            className={`${active ? activeClass : inactiveClass} text-xs font-medium px-2.5 py-1 rounded-lg transition border`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TransactionRow({ transaction, type, onEdit, onDelete, editWindowMs }) {
  const isIncome = type === "income";
  const canModify = isTransactionEditable(transaction.createdAt, editWindowMs);
  const subtitle =
    transaction.title === transaction.subcategory
      ? transaction.category
      : transaction.subcategory;
  const showSubtitle = subtitle && subtitle !== transaction.title;
  const signedAmount = isIncome ? transaction.amount : -Math.abs(transaction.amount);

  return (
    <div className="group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-[var(--sw-muted-bg)]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-base shrink-0 mt-0.5"
        style={{
          background: "var(--sw-muted-bg)",
          border: "1px solid var(--sw-border)",
        }}
      >
        {transaction.icon}
      </div>

      <div className="min-w-0 flex-1 pr-1">
        <div className="font-semibold text-ink text-sm leading-snug line-clamp-2">
          {transaction.title}
        </div>
        {showSubtitle && (
          <div className="text-ink-muted text-xs mt-0.5 truncate">{subtitle}</div>
        )}
      </div>

      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <div
          className={`font-bold tabular-nums text-sm whitespace-nowrap ${
            isIncome
              ? "text-emerald-700 dark:text-emerald-400"
              : "text-rose-700 dark:text-rose-400"
          }`}
        >
          {formatCurrency(signedAmount, { signed: true })}
        </div>
        <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition">
          {canModify && (
            <button
              type="button"
              title={`Edit ${type}`}
              aria-label={`Edit ${type}`}
              className="w-7 h-7 rounded-md text-ink-muted hover:text-sage-700 hover:bg-[var(--sw-muted-bg)] dark:hover:text-blue-200 text-xs transition"
              onClick={() => onEdit?.(transaction)}
            >
              ✎
            </button>
          )}
          {canModify && (
            <button
              type="button"
              title={`Delete ${type}`}
              aria-label={`Delete ${type}`}
              className="w-7 h-7 rounded-md text-ink-muted hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 text-xs transition"
              onClick={() => onDelete?.(transaction)}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function TransferRow({ transfer, accountNameById, onDelete, editWindowMs }) {
  const canModify = isTransactionEditable(transfer.createdAt, editWindowMs);
  const fromName = accountNameById[String(transfer.fromAccountId)] || "Account";
  const toName = accountNameById[String(transfer.toAccountId)] || "Account";

  return (
    <div className="group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-[var(--sw-muted-bg)]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-base shrink-0 mt-0.5"
        style={{
          background: "var(--sw-muted-bg)",
          border: "1px solid var(--sw-border)",
        }}
      >
        🔁
      </div>
      <div className="min-w-0 flex-1 pr-1">
        <div className="font-semibold text-ink text-sm leading-snug">
          {fromName} → {toName}
        </div>
        <div className="text-ink-muted text-xs mt-0.5 truncate">
          {transfer.note?.trim() || "Account transfer · not income or spending"}
        </div>
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <div className="font-bold tabular-nums text-sm text-sage-700 dark:text-blue-300">
          {formatCurrency(transfer.amount)}
        </div>
        {canModify && (
          <button
            type="button"
            title="Delete transfer"
            aria-label="Delete transfer"
            className="w-7 h-7 rounded-md text-ink-muted hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 text-xs transition opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => onDelete?.(transfer)}
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

function TransactionList({ grouped, type, onEdit, onDelete, editWindowMs, emptyTitle, emptyDescription }) {
  const dates = Object.keys(grouped);

  if (dates.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} compact />
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
      {dates.map((date) => (
        <section key={date}>
          <h4
            className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-1.5 px-2.5 sticky top-0 z-[1] py-1.5 backdrop-blur-sm"
            style={{ background: "color-mix(in srgb, var(--sw-panel) 92%, transparent)" }}
          >
            {date}
          </h4>
          <div className="space-y-0.5">
            {grouped[date].map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                type={type}
                onEdit={onEdit}
                onDelete={onDelete}
                editWindowMs={editWindowMs}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

const Transactions = ({
  expenses = [],
  incomes = [],
  transfers = [],
  accounts = [],
  onEditExpense,
  onEditIncome,
  onDeleteExpense,
  onDeleteIncome,
  onDeleteTransfer,
}) => {
  const [tab, setTab] = useState("expense");
  const [search, setSearch] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedIncomeMainCategory, setSelectedIncomeMainCategory] = useState("All");
  const [selectedIncomeSubcategory, setSelectedIncomeSubcategory] = useState("All");
  const [pendingDelete, setPendingDelete] = useState(null);
  const { editWindowMs } = useAppConfig();
  const {
    expenseFilterCategories,
    expenseSubcategories,
    incomeFilterCategories,
    incomeSubcategories,
  } = useCategories();

  const accountNameById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [String(a.id), a.name])),
    [accounts]
  );

  const filteredExpenses = useMemo(() => {
    if (tab !== "expense") return [];
    return filterBySearch(
      filterByCategory(expenses, selectedMainCategory, selectedSubcategory),
      search
    );
  }, [tab, expenses, selectedMainCategory, selectedSubcategory, search]);

  const filteredIncomes = useMemo(() => {
    if (tab !== "income") return [];
    return filterBySearch(
      filterByCategory(incomes, selectedIncomeMainCategory, selectedIncomeSubcategory),
      search
    );
  }, [tab, incomes, selectedIncomeMainCategory, selectedIncomeSubcategory, search]);

  const filteredTransfers = useMemo(() => {
    if (tab !== "transfer") return [];
    const q = search.trim().toLowerCase();
    if (!q) return transfers;
    return transfers.filter((tx) => {
      const from = accountNameById[String(tx.fromAccountId)] || "";
      const to = accountNameById[String(tx.toAccountId)] || "";
      return `${from} ${to} ${tx.note || ""}`.toLowerCase().includes(q);
    });
  }, [tab, transfers, search, accountNameById]);

  const groupedExpenses = useMemo(
    () => (tab === "expense" ? groupTransactionsByDate(filteredExpenses) : {}),
    [tab, filteredExpenses]
  );

  const groupedIncomes = useMemo(
    () => (tab === "income" ? groupTransactionsByDate(filteredIncomes) : {}),
    [tab, filteredIncomes]
  );

  const groupedTransfers = useMemo(
    () => (tab === "transfer" ? groupTransactionsByDate(filteredTransfers) : {}),
    [tab, filteredTransfers]
  );

  const isExpense = tab === "expense";
  const isIncome = tab === "income";
  const isTransfer = tab === "transfer";
  const selectedMain = isExpense ? selectedMainCategory : selectedIncomeMainCategory;
  const selectedSub = isExpense ? selectedSubcategory : selectedIncomeSubcategory;
  const filterCategories = isExpense ? expenseFilterCategories : incomeFilterCategories;
  const subOptions = isExpense
    ? ["All", ...(expenseSubcategories[selectedMainCategory] || [])]
    : ["All", ...(incomeSubcategories[selectedIncomeMainCategory] || [])];

  const requestDelete = (transaction, type) => {
    setPendingDelete({
      id: transaction._id,
      type,
      title:
        type === "transfer"
          ? `${accountNameById[String(transaction.fromAccountId)] || "From"} → ${
              accountNameById[String(transaction.toAccountId)] || "To"
            }`
          : transaction.title,
    });
  };

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, type } = pendingDelete;
    if (type === "income") await onDeleteIncome?.(id);
    else if (type === "transfer") await onDeleteTransfer?.(id);
    else await onDeleteExpense?.(id);
    setPendingDelete(null);
  };

  return (
    <div className="sw-panel p-5 sm:p-6 w-full h-full min-h-[28rem] xl:min-h-0 flex flex-col overflow-hidden">
      <div className="mb-3 shrink-0">
        <h3 className="font-display text-lg font-semibold text-ink">Activity</h3>
      </div>

      <div
        className="grid grid-cols-3 gap-1 p-1 rounded-xl mb-3 shrink-0"
        style={{ background: "var(--sw-muted-bg)" }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isExpense}
          onClick={() => setTab("expense")}
          className={`sw-segment-btn ${isExpense ? "is-active text-rose-700 dark:text-rose-300" : ""}`}
        >
          Expenses
          <span className="ml-1 text-xs font-medium opacity-70">{expenses.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isIncome}
          onClick={() => setTab("income")}
          className={`sw-segment-btn ${isIncome ? "is-active text-emerald-700 dark:text-emerald-300" : ""}`}
        >
          Income
          <span className="ml-1 text-xs font-medium opacity-70">{incomes.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isTransfer}
          onClick={() => setTab("transfer")}
          className={`sw-segment-btn ${isTransfer ? "is-active text-sage-700 dark:text-blue-300" : ""}`}
        >
          Transfers
          <span className="ml-1 text-xs font-medium opacity-70">{transfers.length}</span>
        </button>
      </div>

      <div className="mb-3 shrink-0">
        <label className="sr-only" htmlFor="activity-search">
          Search transactions
        </label>
        <input
          id="activity-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={
            isTransfer ? "Search transfers…" : "Search title or category…"
          }
          className="sw-input py-2 text-sm mb-2"
        />
        {!isTransfer && (
          <>
            <label className="sr-only" htmlFor="activity-category-filter">
              Filter by category
            </label>
            <select
              id="activity-category-filter"
              value={selectedMain}
              onChange={(e) => {
                const value = e.target.value;
                if (isExpense) {
                  setSelectedMainCategory(value);
                  setSelectedSubcategory("All");
                } else {
                  setSelectedIncomeMainCategory(value);
                  setSelectedIncomeSubcategory("All");
                }
              }}
              className={`sw-input py-2 text-sm appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9 ${
                isExpense
                  ? "border-rose-200 text-rose-800 focus:ring-rose-500/25 focus:border-rose-500 dark:border-rose-500/30 dark:text-rose-300"
                  : "border-emerald-200 text-emerald-800 focus:ring-emerald-500/25 focus:border-emerald-500 dark:border-emerald-500/30 dark:text-emerald-300"
              }`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
              }}
            >
              {filterCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </>
        )}
      </div>

      {!isTransfer && selectedMain !== "All" && (
        <div className="shrink-0">
          <FilterChips
            options={subOptions}
            selected={selectedSub}
            onSelect={isExpense ? setSelectedSubcategory : setSelectedIncomeSubcategory}
            activeClass={
              isExpense
                ? "bg-rose-700 text-white border-rose-700"
                : "bg-emerald-700 text-white border-emerald-700"
            }
            inactiveClass={
              isExpense
                ? "bg-white text-rose-700 border-rose-200 hover:bg-rose-50 dark:bg-transparent dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10"
            }
          />
        </div>
      )}

      {isTransfer ? (
        Object.keys(groupedTransfers).length === 0 ? (
          <EmptyState
            title="No transfers yet"
            description="Tap + and choose Transfer to move money between accounts"
            compact
          />
        ) : (
          <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
            {Object.keys(groupedTransfers).map((date) => (
              <section key={date}>
                <h4
                  className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-1.5 px-2.5 sticky top-0 z-[1] py-1.5 backdrop-blur-sm"
                  style={{
                    background: "color-mix(in srgb, var(--sw-panel) 92%, transparent)",
                  }}
                >
                  {date}
                </h4>
                <div className="space-y-0.5">
                  {groupedTransfers[date].map((transfer) => (
                    <TransferRow
                      key={transfer._id}
                      transfer={transfer}
                      accountNameById={accountNameById}
                      editWindowMs={editWindowMs}
                      onDelete={(row) => requestDelete(row, "transfer")}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )
      ) : (
        <TransactionList
          grouped={isExpense ? groupedExpenses : groupedIncomes}
          type={isExpense ? "expense" : "income"}
          onEdit={isExpense ? onEditExpense : onEditIncome}
          onDelete={(transaction) =>
            requestDelete(transaction, isExpense ? "expense" : "income")
          }
          editWindowMs={editWindowMs}
          emptyTitle={isExpense ? "No expenses yet" : "No income yet"}
          emptyDescription={
            isExpense
              ? "Tap + to record your first expense"
              : "Tap + to record your first income"
          }
        />
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title={`Delete this ${pendingDelete?.type || "item"}?`}
        description={
          pendingDelete?.title
            ? `"${pendingDelete.title}" will be removed permanently.`
            : "This will be removed permanently."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default memo(Transactions);
