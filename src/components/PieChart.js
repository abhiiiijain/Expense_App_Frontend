import React, { useState } from "react";
import DoughnutChart from "./DoughnutChart";
import CardHeader from "./CardHeader";
import {
  useCategorySums,
  useCurrentMonthExpenses,
} from "../hooks/useExpenseAnalytics";
import { EXPENSE_CATEGORIES } from "../constants/categories";
import { formatCurrency } from "../utils/formatCurrency";

function PieChart({ expenses }) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const monthlyExpenses = useCurrentMonthExpenses(expenses);
  const categorySums = useCategorySums(monthlyExpenses);
  const monthTotal = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);

  const activeCategories = EXPENSE_CATEGORIES.filter((c) => categorySums[c.name] > 0);
  const visibleCategories = showAllCategories ? EXPENSE_CATEGORIES : activeCategories;

  return (
    <div className="bg-white shadow-lg rounded-2xl p-6 w-full ring-1 ring-gray-100">
      <CardHeader eyebrow="Overview" title="This Month" />
      <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
        <div className="w-full lg:w-[260px] shrink-0 mx-auto">
          <DoughnutChart categorySums={categorySums} />
        </div>
        <div className="w-full lg:flex-1">
          {visibleCategories.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              Category breakdown appears here once you add expenses.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {visibleCategories.map((category) => {
                const amount = categorySums[category.name];
                const pct = monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0;

                return (
                  <div
                    key={category.name}
                    className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl py-2.5 px-3"
                  >
                    <div
                      className="w-3 h-3 shrink-0 rounded-sm"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="flex-1 min-w-0 text-sm text-gray-800 truncate">
                      {category.name}
                    </div>
                    <div className="text-xs font-medium text-gray-500 w-9 text-right tabular-nums">
                      {pct}%
                    </div>
                    <div className="text-sm font-bold text-gray-900 w-[5.5rem] text-right tabular-nums">
                      {formatCurrency(amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {monthTotal > 0 && activeCategories.length < EXPENSE_CATEGORIES.length && (
            <button
              type="button"
              onClick={() => setShowAllCategories((v) => !v)}
              className="mt-3 text-xs font-medium text-blue-600 hover:text-blue-700"
            >
              {showAllCategories ? "Hide empty categories" : "Show all categories"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default PieChart;
