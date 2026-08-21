import { memo, useMemo, useState } from "react";
import {
  EXPENSE_FILTER_CATEGORIES,
  EXPENSE_SUBCATEGORIES,
  INCOME_FILTER_CATEGORIES,
  INCOME_SUBCATEGORIES,
} from "../constants/categories";
import { groupTransactionsByDate } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";
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

function FilterChips({ options, selected, onSelect, activeClass, inactiveClass }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected === option;
        return (
          <button
            key={option}
            type="button"
            className={`${active ? activeClass : inactiveClass} text-xs font-medium px-3 py-1.5 rounded-lg transition border`}
            onClick={() => onSelect(option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function TransactionRow({ transaction, type, onDelete }) {
  const isIncome = type === "income";
  const subtitle =
    transaction.title === transaction.subcategory
      ? transaction.category
      : transaction.subcategory;
  const showSubtitle = subtitle && subtitle !== transaction.title;
  const signedAmount = isIncome ? transaction.amount : -Math.abs(transaction.amount);

  return (
    <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-sage-50/70 transition group border border-transparent hover:border-ink/5">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand-50 ring-1 ring-ink/5 text-lg shrink-0">
        {transaction.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-ink truncate text-sm">{transaction.title}</div>
        {showSubtitle && (
          <div className="text-ink-muted text-xs truncate">{subtitle}</div>
        )}
      </div>
      <div
        className={`font-bold shrink-0 tabular-nums text-sm ${
          isIncome ? "text-emerald-700" : "text-rose-700"
        }`}
      >
        {formatCurrency(signedAmount, { signed: true })}
      </div>
      <button
        type="button"
        title={`Delete ${type}`}
        aria-label={`Delete ${type}`}
        className="shrink-0 w-8 h-8 rounded-lg text-ink-muted hover:text-rose-700 hover:bg-rose-50 sm:opacity-0 sm:group-hover:opacity-100 transition"
        onClick={() => {
          if (!onDelete) return;
          if (window.confirm(`Delete this ${type}?`)) {
            onDelete(transaction._id);
          }
        }}
      >
        ✕
      </button>
    </div>
  );
}

function TransactionList({ grouped, type, onDelete, emptyTitle, emptyDescription }) {
  const dates = Object.keys(grouped);

  if (dates.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} compact />
    );
  }

  return (
    <div className="space-y-5 max-h-[28rem] overflow-y-auto pr-1">
      {dates.map((date) => (
        <div key={date}>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-2 px-1 sticky top-0 bg-white/95 py-1">
            {date}
          </h4>
          <div className="space-y-0.5">
            {grouped[date].map((transaction) => (
              <TransactionRow
                key={transaction._id}
                transaction={transaction}
                type={type}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const Transactions = ({
  expenses = [],
  incomes = [],
  onDeleteExpense,
  onDeleteIncome,
}) => {
  const [tab, setTab] = useState("expense");
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedIncomeMainCategory, setSelectedIncomeMainCategory] = useState("All");
  const [selectedIncomeSubcategory, setSelectedIncomeSubcategory] = useState("All");

  const filteredExpenses = useMemo(() => {
    if (tab !== "expense") return [];
    return filterByCategory(expenses, selectedMainCategory, selectedSubcategory);
  }, [tab, expenses, selectedMainCategory, selectedSubcategory]);

  const filteredIncomes = useMemo(() => {
    if (tab !== "income") return [];
    return filterByCategory(incomes, selectedIncomeMainCategory, selectedIncomeSubcategory);
  }, [tab, incomes, selectedIncomeMainCategory, selectedIncomeSubcategory]);

  const groupedExpenses = useMemo(
    () => (tab === "expense" ? groupTransactionsByDate(filteredExpenses) : {}),
    [tab, filteredExpenses]
  );

  const groupedIncomes = useMemo(
    () => (tab === "income" ? groupTransactionsByDate(filteredIncomes) : {}),
    [tab, filteredIncomes]
  );

  const isExpense = tab === "expense";
  const selectedMain = isExpense ? selectedMainCategory : selectedIncomeMainCategory;
  const selectedSub = isExpense ? selectedSubcategory : selectedIncomeSubcategory;
  const filterCategories = isExpense ? EXPENSE_FILTER_CATEGORIES : INCOME_FILTER_CATEGORIES;
  const subOptions = isExpense
    ? ["All", ...(EXPENSE_SUBCATEGORIES[selectedMainCategory] || [])]
    : ["All", ...(INCOME_SUBCATEGORIES[selectedIncomeMainCategory] || [])];

  return (
    <div className="sw-panel p-5 sm:p-6 w-full h-full flex flex-col">
      <div className="mb-4">
        <h3 className="font-display text-lg font-semibold text-ink">Activity</h3>
      </div>

      <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-sand-100 mb-4" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={isExpense}
          onClick={() => setTab("expense")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            isExpense ? "bg-white text-rose-700 shadow-soft" : "text-ink-muted hover:text-ink"
          }`}
        >
          Expenses
          <span className="ml-1.5 text-xs font-medium opacity-70">{expenses.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={!isExpense}
          onClick={() => setTab("income")}
          className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
            !isExpense ? "bg-white text-emerald-700 shadow-soft" : "text-ink-muted hover:text-ink"
          }`}
        >
          Income
          <span className="ml-1.5 text-xs font-medium opacity-70">{incomes.length}</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
        <select
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
          className={`border rounded-xl px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 w-full ${
            isExpense
              ? "border-rose-200 text-rose-800 focus:ring-rose-500/25"
              : "border-emerald-200 text-emerald-800 focus:ring-emerald-500/25"
          }`}
        >
          {filterCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedMain !== "All" && (
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
              ? "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
              : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
          }
        />
      )}

      <TransactionList
        grouped={isExpense ? groupedExpenses : groupedIncomes}
        type={isExpense ? "expense" : "income"}
        onDelete={isExpense ? onDeleteExpense : onDeleteIncome}
        emptyTitle={isExpense ? "No expenses yet" : "No income yet"}
        emptyDescription={
          isExpense
            ? "Tap + to record your first expense"
            : "Tap + to record your first income"
        }
      />
    </div>
  );
};

export default memo(Transactions);
