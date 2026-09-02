import { memo, useMemo, useState } from "react";
import DoughnutChart from "./DoughnutChart";
import CardHeader from "./CardHeader";
import ModalShell from "../ModalShell";
import { useCategories } from "../../config/AppConfigContext";
import { formatCurrency, formatPercent } from "../../utils/formatCurrency";
import { clampBarWidth } from "../../utils/clampBarWidth";
import { AccountTotalsBar } from "../AccountBreakdown";
import { useAccountExpenseTotals } from "../../hooks/useAccountExpenseTotals";
import EmptyState from "../EmptyState";

function CategoryDetailPopover({ detail, onClose }) {
  if (!detail) return null;

  const { category, amount, subcategories, scopeTotal = amount } = detail;
  const categoryPct = scopeTotal > 0 ? (amount / scopeTotal) * 100 : 0;

  return (
    <ModalShell
      open
      onClose={onClose}
      labelledBy="category-detail-title"
      panelClassName="max-h-[min(80vh,28rem)] flex flex-col"
    >
      <div
        className="px-5 py-4 border-b border-ink/5 shrink-0"
        style={{ backgroundColor: `${category.color}14` }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-sm shrink-0 ring-1 ring-black/5"
                style={{ backgroundColor: category.color }}
                aria-hidden="true"
              />
              <h2 id="category-detail-title" className="font-display text-lg font-semibold text-ink truncate">
                {category.name}
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-1.5 tabular-nums">
              {formatCurrency(amount)} · {formatPercent(categoryPct)} of month
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-white dark:hover:bg-white/10 flex items-center justify-center shrink-0"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      </div>

      <ul className="divide-y divide-ink/5 overflow-y-auto flex-1 min-h-0">
        {subcategories.map((sub) => {
          const subPct = amount > 0 ? (sub.amount / amount) * 100 : 0;
          const subBarWidth = clampBarWidth(subPct);

          return (
            <li key={sub.name} className="px-5 py-3">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-sm font-medium text-ink leading-snug">
                  {sub.name}
                </span>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold text-ink tabular-nums">
                    {formatCurrency(sub.amount)}
                  </p>
                  <p className="text-[11px] text-ink-muted tabular-nums mt-0.5">
                    {formatPercent(subPct)} of category
                  </p>
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full overflow-hidden bg-[var(--sw-muted-bg)]">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${subBarWidth}%`,
                    backgroundColor: category.color,
                    opacity: 0.85,
                  }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </ModalShell>
  );
}

function CategoryRow({ category, amount, monthTotal, subcategories, onOpen }) {
  const pct = monthTotal > 0 ? (amount / monthTotal) * 100 : 0;
  const barWidth = clampBarWidth(pct);
  const hasBreakdown = subcategories.length > 0;

  return (
    <li>
      <button
        type="button"
        onClick={() =>
          hasBreakdown && onOpen({ category, amount, subcategories, scopeTotal: monthTotal })
        }
        aria-haspopup="dialog"
        className={`w-full text-left rounded-xl px-2 py-2 transition ${
          hasBreakdown
            ? "hover:bg-[var(--sw-muted-bg)] cursor-pointer"
            : "cursor-default"
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-sm shrink-0 ring-1 ring-black/5"
            style={{ backgroundColor: category.color }}
            aria-hidden="true"
          />
          <span className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-ink truncate">
            {category.name}
          </span>
          {hasBreakdown && (
            <span className="text-[10px] font-medium text-sage-700 dark:text-sage-200 shrink-0">View</span>
          )}
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
      </button>
    </li>
  );
}

function MonthCategoryContent({
  expenses,
  categorySums,
  monthTotal,
  onSelectDetail,
}) {
  const [showEmpty, setShowEmpty] = useState(false);
  const { expenseCategories } = useCategories();

  const { activeCategories, emptyCategories, subcategoryBreakdowns } = useMemo(() => {
    const active = expenseCategories
      .filter((c) => categorySums[c.name] > 0)
      .sort((a, b) => categorySums[b.name] - categorySums[a.name]);
    const empty = expenseCategories.filter((c) => !categorySums[c.name]);

    const breakdownMap = {};
    expenses.forEach((expense) => {
      if (!breakdownMap[expense.category]) breakdownMap[expense.category] = {};
      breakdownMap[expense.category][expense.subcategory] =
        (breakdownMap[expense.category][expense.subcategory] || 0) + expense.amount;
    });

    const subcategoryBreakdowns = Object.fromEntries(
      Object.entries(breakdownMap).map(([category, subs]) => [
        category,
        Object.entries(subs)
          .map(([name, amount]) => ({ name, amount }))
          .sort((a, b) => b.amount - a.amount),
      ])
    );

    return {
      activeCategories: active,
      emptyCategories: empty,
      subcategoryBreakdowns,
    };
  }, [expenses, categorySums, expenseCategories]);

  return (
    <div className="flex flex-col lg:flex-row lg:items-start gap-4 lg:gap-5">
      <div className="w-full max-w-[220px] mx-auto lg:mx-0 lg:w-[200px] shrink-0">
        <DoughnutChart categorySums={categorySums} />
      </div>

      <div className="w-full lg:flex-1 min-w-0">
        <ul className="space-y-1">
          {activeCategories.map((category) => (
            <CategoryRow
              key={category.name}
              category={category}
              amount={categorySums[category.name]}
              monthTotal={monthTotal}
              subcategories={subcategoryBreakdowns[category.name] || []}
              onOpen={onSelectDetail}
            />
          ))}
        </ul>

        {emptyCategories.length > 0 && (
          <div className="pt-2 mt-2" style={{ borderTop: "1px solid var(--sw-border)" }}>
            <button
              type="button"
              onClick={() => setShowEmpty((v) => !v)}
              className="text-[11px] font-medium text-sage-700 hover:text-sage-600 dark:text-blue-300 dark:hover:text-blue-200"
            >
              {showEmpty
                ? "Hide unused categories"
                : `Show ${emptyCategories.length} unused categories`}
            </button>

            {showEmpty && (
              <div className="mt-2 flex flex-wrap gap-1 animate-fade-in">
                {emptyCategories.map((category) => (
                  <span
                    key={category.name}
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] text-ink-muted"
                    style={{
                      background: "var(--sw-muted-bg)",
                      border: "1px solid var(--sw-border)",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full opacity-50"
                      style={{ backgroundColor: category.color }}
                      aria-hidden="true"
                    />
                    {category.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryBreakdown({
  expenses: monthlyExpenses,
  categorySums,
  monthTotal,
  accounts = [],
  accountFilter = "all",
}) {
  const [selectedDetail, setSelectedDetail] = useState(null);
  const accountTotals = useAccountExpenseTotals(monthlyExpenses, accounts, accountFilter);
  const hasSpending = monthTotal > 0;

  return (
    <div className="sw-panel p-4 sm:p-5 w-full">
      <CardHeader eyebrow="Overview" title="This Month" className="mb-3 sm:mb-4">
        {hasSpending && (
          <div className="text-right shrink-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Spent
            </p>
            <p className="text-sm font-bold text-ink tabular-nums">
              {formatCurrency(monthTotal)}
            </p>
          </div>
        )}
      </CardHeader>

      {!hasSpending ? (
        <EmptyState
          title="No spending this month"
          description="Your expenses for this month will appear here"
        />
      ) : (
        <>
          {accountTotals.length > 0 && (
            <AccountTotalsBar totals={accountTotals} tone="expense" className="mb-4" />
          )}
          <MonthCategoryContent
            expenses={monthlyExpenses}
            categorySums={categorySums}
            monthTotal={monthTotal}
            onSelectDetail={setSelectedDetail}
          />
        </>
      )}

      <CategoryDetailPopover
        detail={selectedDetail}
        onClose={() => setSelectedDetail(null)}
      />
    </div>
  );
}

export default memo(CategoryBreakdown);
