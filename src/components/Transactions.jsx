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

function TransactionRow({ transaction, type, onDelete }) {
  const isIncome = type === "income";
  const subtitle =
    transaction.title === transaction.subcategory
      ? transaction.category
      : transaction.subcategory;
  const showSubtitle = subtitle && subtitle !== transaction.title;
  const signedAmount = isIncome ? transaction.amount : -Math.abs(transaction.amount);

  return (
    <div className="group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 hover:bg-sand-50 transition">
      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-sand-50 ring-1 ring-ink/5 text-base shrink-0 mt-0.5">
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
            isIncome ? "text-emerald-700" : "text-rose-700"
          }`}
        >
          {formatCurrency(signedAmount, { signed: true })}
        </div>
        <button
          type="button"
          title={`Delete ${type}`}
          aria-label={`Delete ${type}`}
          className="w-7 h-7 rounded-md text-ink-muted/70 hover:text-rose-700 hover:bg-rose-50 text-xs opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition"
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
    <div className="sw-scroll flex-1 min-h-0 overflow-y-auto -mr-1 pr-2 space-y-4">
      {dates.map((date) => (
        <section key={date}>
          <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-1.5 px-2.5 sticky top-0 z-[1] bg-white/95 backdrop-blur-sm py-1.5">
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
        </section>
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
    <div className="sw-panel p-5 sm:p-6 w-full h-full min-h-[28rem] xl:min-h-0 flex flex-col overflow-hidden">
      <div className="mb-3 shrink-0">
        <h3 className="font-display text-lg font-semibold text-ink">Activity</h3>
      </div>

      <div
        className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-sand-100 mb-3 shrink-0"
        role="tablist"
      >
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

      <div className="mb-3 shrink-0">
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
              ? "border-rose-200 text-rose-800 focus:ring-rose-500/25 focus:border-rose-500"
              : "border-emerald-200 text-emerald-800 focus:ring-emerald-500/25 focus:border-emerald-500"
          }`}
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
          }}
        >
          {filterCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {selectedMain !== "All" && (
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
                ? "bg-white text-rose-700 border-rose-200 hover:bg-rose-50"
                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50"
            }
          />
        </div>
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
