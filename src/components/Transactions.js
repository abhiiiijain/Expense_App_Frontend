import { useMemo, useState } from "react";
import {
  EXPENSE_FILTER_CATEGORIES,
  EXPENSE_SUBCATEGORIES,
  INCOME_FILTER_CATEGORIES,
  INCOME_SUBCATEGORIES,
} from "../constants/categories";
import { groupTransactionsByDate } from "../utils/dateHelpers";
import { formatCurrency } from "../utils/formatCurrency";
import EmptyState from "./EmptyState";

function filterByCategory(transactions, mainCategory, subcategory, subcategoryMap) {
  if (mainCategory === "All") {
    return transactions;
  }
  if (subcategory === "All") {
    return transactions.filter((transaction) =>
      subcategoryMap[mainCategory]?.includes(transaction.subcategory)
    );
  }
  return transactions.filter((transaction) => transaction.subcategory === subcategory);
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
            className={`${active ? activeClass : inactiveClass} text-sm px-3 py-1.5 rounded-full transition border`}
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

  return (
    <div className="flex items-center gap-3 bg-gray-50 hover:bg-gray-100 transition border border-gray-100 rounded-xl p-3 group">
      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white border border-gray-200 text-xl shrink-0">
        {transaction.icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-gray-900 truncate">{transaction.title}</div>
        {showSubtitle && (
          <div className="text-gray-500 text-xs truncate">{subtitle}</div>
        )}
      </div>
      <div
        className={`font-bold shrink-0 tabular-nums ${
          isIncome ? "text-green-700" : "text-red-700"
        }`}
      >
        {formatCurrency(transaction.amount, { signed: true })}
      </div>
      <button
        type="button"
        title={`Delete ${type}`}
        aria-label={`Delete ${type}`}
        className="shrink-0 w-8 h-8 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 sm:opacity-0 sm:group-hover:opacity-100 transition"
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

function TransactionList({ grouped, type, onDelete, emptyIcon, emptyTitle, emptyDescription }) {
  const dates = Object.keys(grouped);

  if (dates.length === 0) {
    return (
      <EmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        compact
      />
    );
  }

  return (
    <div className="space-y-5">
      {dates.map((date) => (
        <div key={date}>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            {date}
          </h4>
          <div className="space-y-2">
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

const Transactions = ({ expenses = [], incomes = [], onDeleteExpense, onDeleteIncome }) => {
  const [selectedMainCategory, setSelectedMainCategory] = useState("All");
  const [selectedSubcategory, setSelectedSubcategory] = useState("All");
  const [selectedIncomeMainCategory, setSelectedIncomeMainCategory] = useState("All");
  const [selectedIncomeSubcategory, setSelectedIncomeSubcategory] = useState("All");

  const filteredExpenses = useMemo(
    () =>
      filterByCategory(
        expenses,
        selectedMainCategory,
        selectedSubcategory,
        EXPENSE_SUBCATEGORIES
      ),
    [expenses, selectedMainCategory, selectedSubcategory]
  );

  const filteredIncomes = useMemo(
    () =>
      filterByCategory(
        incomes,
        selectedIncomeMainCategory,
        selectedIncomeSubcategory,
        INCOME_SUBCATEGORIES
      ),
    [incomes, selectedIncomeMainCategory, selectedIncomeSubcategory]
  );

  const groupedExpenses = useMemo(
    () => groupTransactionsByDate(filteredExpenses),
    [filteredExpenses]
  );

  const groupedIncomes = useMemo(
    () => groupTransactionsByDate(filteredIncomes),
    [filteredIncomes]
  );

  const expenseSubOptions = ["All", ...(EXPENSE_SUBCATEGORIES[selectedMainCategory] || [])];
  const incomeSubOptions = [
    "All",
    ...(INCOME_SUBCATEGORIES[selectedIncomeMainCategory] || []),
  ];

  return (
    <>
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-extrabold text-gray-900">Expenses</h3>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
              {filteredExpenses.length}
            </span>
          </div>
          <select
            value={selectedMainCategory}
            onChange={(e) => {
              setSelectedMainCategory(e.target.value);
              setSelectedSubcategory("All");
            }}
            className="border border-red-200 text-red-700 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 w-full sm:w-auto"
          >
            {EXPENSE_FILTER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedMainCategory !== "All" && (
          <FilterChips
            options={expenseSubOptions}
            selected={selectedSubcategory}
            onSelect={setSelectedSubcategory}
            activeClass="bg-red-600 text-white border-red-600"
            inactiveClass="bg-white text-red-600 border-red-200 hover:bg-red-50"
          />
        )}

        <TransactionList
          grouped={groupedExpenses}
          type="expense"
          onDelete={onDeleteExpense}
          emptyIcon="🧾"
          emptyTitle="No expenses found"
          emptyDescription={
            expenses.length === 0
              ? "Tap + to record your first expense"
              : "Try changing the category filter"
          }
        />
      </div>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <h3 className="text-lg font-extrabold text-gray-900">Incomes</h3>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full min-w-[1.5rem] text-center">
              {filteredIncomes.length}
            </span>
          </div>
          <select
            value={selectedIncomeMainCategory}
            onChange={(e) => {
              setSelectedIncomeMainCategory(e.target.value);
              setSelectedIncomeSubcategory("All");
            }}
            className="border border-green-200 text-green-700 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 w-full sm:w-auto"
          >
            {INCOME_FILTER_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {selectedIncomeMainCategory !== "All" && (
          <FilterChips
            options={incomeSubOptions}
            selected={selectedIncomeSubcategory}
            onSelect={setSelectedIncomeSubcategory}
            activeClass="bg-green-600 text-white border-green-600"
            inactiveClass="bg-white text-green-600 border-green-200 hover:bg-green-50"
          />
        )}

        <TransactionList
          grouped={groupedIncomes}
          type="income"
          onDelete={onDeleteIncome}
          emptyIcon="💰"
          emptyTitle="No income found"
          emptyDescription={
            incomes.length === 0
              ? "Tap + to record your first income"
              : "Try changing the category filter"
          }
        />
      </div>
    </>
  );
};

export default Transactions;
