import { memo, useEffect, useMemo, useState } from "react";
import DoughnutChart from "./DoughnutChart";
import CardHeader from "./CardHeader";
import { useCategories } from "../../config/AppConfigContext";
import { useCategorySums, useMonthTotal } from "../../hooks/useExpenseAnalytics";
import { formatCurrency, formatPercent } from "../../utils/formatCurrency";
import { clampBarWidth } from "../../utils/clampBarWidth";
import { AccountTotalsBar } from "../AccountBreakdown";
import { useAccountExpenseTotals } from "../../hooks/useAccountExpenseTotals";
import {
  formatChartDayTooltip,
  formatDateKey,
  getDayBoundsForMonth,
  getMonthKey,
  shiftDateKey,
  transactionDate,
} from "../../utils/dateHelpers";
import EmptyState from "../EmptyState";

function DaySwitcher({ dayKey, monthKey, onChange }) {
  const todayKey = formatDateKey(new Date());
  const { minDayKey, maxDayKey } = getDayBoundsForMonth(monthKey);
  const atMin = dayKey <= minDayKey;
  const atMax = dayKey >= maxDayKey;
  const isToday = dayKey === todayKey;

  const [year, month, day] = dayKey.split("-").map(Number);
  const dayLabel = formatChartDayTooltip(new Date(year, month - 1, day));

  return (
    <div className="sw-chip gap-1">
      <button
        type="button"
        aria-label="Previous day"
        disabled={atMin}
        className="w-8 h-8 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition disabled:opacity-30"
        onClick={() => onChange(shiftDateKey(dayKey, -1))}
      >
        ‹
      </button>
      <div className="min-w-[9.5rem] text-center px-2">
        <p className="text-sm font-semibold text-ink tabular-nums">{dayLabel}</p>
        {!isToday && getMonthKey(new Date()) === monthKey && (
          <button
            type="button"
            className="text-[10px] font-medium text-sage-700 dark:text-blue-300 hover:underline"
            onClick={() => onChange(todayKey)}
          >
            Jump to today
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Next day"
        disabled={atMax}
        className="w-8 h-8 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition disabled:opacity-30"
        onClick={() => onChange(shiftDateKey(dayKey, 1))}
      >
        ›
      </button>
    </div>
  );
}

function CategoryRow({ category, amount, dayTotal }) {
  const pct = dayTotal > 0 ? (amount / dayTotal) * 100 : 0;
  const barWidth = clampBarWidth(pct);

  return (
    <li>
      <div className="w-full text-left rounded-xl px-2 py-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-sm shrink-0 ring-1 ring-black/5"
            style={{ backgroundColor: category.color }}
            aria-hidden="true"
          />
          <span className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-ink truncate">
            {category.name}
          </span>
          <span className="text-[11px] text-ink-muted tabular-nums shrink-0">
            {formatPercent(pct)}
          </span>
          <span className="text-xs sm:text-sm font-bold text-ink tabular-nums shrink-0 w-[5.25rem] text-right">
            {formatCurrency(amount)}
          </span>
        </div>
        <div className="mt-1.5 ml-4 h-1 rounded-full overflow-hidden bg-[var(--sw-muted-bg)]">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${barWidth}%`,
              backgroundColor: category.color,
            }}
          />
        </div>
      </div>
    </li>
  );
}

function DailyBreakdown({
  expenses,
  monthKey,
  accounts = [],
  accountFilter = "all",
}) {
  const { expenseCategories, expenseCategoryNames } = useCategories();
  const { maxDayKey } = getDayBoundsForMonth(monthKey);
  const [dayKey, setDayKey] = useState(() => formatDateKey(new Date()));

  useEffect(() => {
    setDayKey((current) => {
      if (current > maxDayKey) return maxDayKey;
      const { minDayKey } = getDayBoundsForMonth(monthKey);
      if (current < minDayKey) return maxDayKey;
      return current;
    });
  }, [monthKey, maxDayKey]);

  const dayExpenses = useMemo(
    () => expenses.filter((expense) => formatDateKey(transactionDate(expense)) === dayKey),
    [dayKey, expenses]
  );

  const categorySums = useCategorySums(dayExpenses, expenseCategoryNames);
  const dayTotal = useMonthTotal(dayExpenses);
  const accountTotals = useAccountExpenseTotals(dayExpenses, accounts, accountFilter);

  const activeCategories = useMemo(
    () =>
      expenseCategories
        .filter((category) => categorySums[category.name] > 0)
        .sort((a, b) => categorySums[b.name] - categorySums[a.name]),
    [categorySums, expenseCategories]
  );

  const hasSpending = dayTotal > 0;
  const [year, month, day] = dayKey.split("-").map(Number);
  const dayLabel = formatChartDayTooltip(new Date(year, month - 1, day));

  return (
    <div className="sw-panel p-4 sm:p-5 w-full">
      <CardHeader eyebrow="Overview" title="Daily" className="mb-3 sm:mb-4">
        {hasSpending && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Spent
            </p>
            <p className="text-sm font-bold text-ink tabular-nums">
              {formatCurrency(dayTotal)}
            </p>
          </div>
        )}
      </CardHeader>

      <div className="mb-4 flex justify-center sm:justify-start">
        <DaySwitcher dayKey={dayKey} monthKey={monthKey} onChange={setDayKey} />
      </div>

      {!hasSpending ? (
        <EmptyState
          title="No spending this day"
          description={`Expenses on ${dayLabel} will appear here`}
        />
      ) : (
        <>
          {accountTotals.length > 0 && (
            <AccountTotalsBar totals={accountTotals} tone="expense" className="mb-4" />
          )}
          <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5">
            <div className="w-full max-w-[220px] mx-auto lg:mx-0 lg:w-[200px] shrink-0">
              <DoughnutChart categorySums={categorySums} />
            </div>
            <ul className="w-full lg:flex-1 min-w-0 space-y-1">
              {activeCategories.map((category) => (
                <CategoryRow
                  key={category.name}
                  category={category}
                  amount={categorySums[category.name]}
                  dayTotal={dayTotal}
                />
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

export default memo(DailyBreakdown);
