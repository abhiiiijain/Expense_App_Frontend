import { memo, useMemo, useState } from "react";
import DoughnutChart from "./DoughnutChart";
import CardHeader from "./CardHeader";
import {
  useCategorySums,
  useCurrentMonthExpenses,
} from "../../hooks/useExpenseAnalytics";
import { EXPENSE_CATEGORIES } from "../../constants/categories";
import { formatCurrency } from "../../utils/formatCurrency";

function CategoryBreakdown({ expenses }) {
  const [showEmpty, setShowEmpty] = useState(false);
  const monthlyExpenses = useCurrentMonthExpenses(expenses);
  const categorySums = useCategorySums(monthlyExpenses);

  const { monthTotal, activeCategories, emptyCategories, hasSpending } = useMemo(() => {
    const total = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
    const active = EXPENSE_CATEGORIES.filter((c) => categorySums[c.name] > 0).sort(
      (a, b) => categorySums[b.name] - categorySums[a.name]
    );
    const empty = EXPENSE_CATEGORIES.filter((c) => !categorySums[c.name]);
    return {
      monthTotal: total,
      activeCategories: active,
      emptyCategories: empty,
      hasSpending: active.length > 0,
    };
  }, [monthlyExpenses, categorySums]);

  return (
    <div className="sw-panel p-5 sm:p-6 w-full">
      <CardHeader eyebrow="Overview" title="This Month" />
      {!hasSpending ? (
        <DoughnutChart categorySums={categorySums} />
      ) : (
        <div className="flex flex-col lg:flex-row justify-center items-stretch gap-6">
          <div className="w-full lg:w-[260px] shrink-0 mx-auto">
            <DoughnutChart categorySums={categorySums} />
          </div>
          <div className="w-full lg:flex-1 min-w-0 space-y-4">
            <div className="space-y-2">
              {activeCategories.map((category) => {
                const amount = categorySums[category.name];
                const pct = monthTotal > 0 ? Math.round((amount / monthTotal) * 100) : 0;

                return (
                  <div key={category.name} className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2.5 h-2.5 shrink-0 rounded-sm"
                        style={{ backgroundColor: category.color }}
                      />
                      <div className="flex-1 min-w-0 text-sm font-medium text-ink truncate">
                        {category.name}
                      </div>
                      <div className="text-xs font-medium text-ink-muted tabular-nums">
                        {pct}%
                      </div>
                      <div className="text-sm font-bold text-ink w-[5.5rem] text-right tabular-nums">
                        {formatCurrency(amount)}
                      </div>
                    </div>
                    <div className="h-1 rounded-full bg-sand-100 overflow-hidden ml-[1.375rem]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {emptyCategories.length > 0 && (
              <div className="pt-1 border-t border-ink/5">
                <button
                  type="button"
                  onClick={() => setShowEmpty((v) => !v)}
                  className="text-xs font-medium text-sage-700 hover:text-sage-600"
                >
                  {showEmpty
                    ? "Hide unused categories"
                    : `Show ${emptyCategories.length} unused categories`}
                </button>

                {showEmpty && (
                  <div className="mt-3 flex flex-wrap gap-1.5 animate-fade-in">
                    {emptyCategories.map((category) => (
                      <span
                        key={category.name}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs text-ink-muted bg-sand-50 ring-1 ring-ink/5"
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full opacity-50"
                          style={{ backgroundColor: category.color }}
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
      )}
    </div>
  );
}

export default memo(CategoryBreakdown);
