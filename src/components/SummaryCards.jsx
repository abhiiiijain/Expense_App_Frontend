import { memo, useMemo } from "react";
import { useMonthlySummary } from "../hooks/useExpenseAnalytics";
import { formatCurrency, formatPercent } from "../utils/formatCurrency";

function SummaryCards({ expenses, incomes, openingBalance = 0, onEditOpeningBalance }) {
  const { totalIncome, totalExpense } = useMonthlySummary(expenses, incomes);

  const accountBalance = useMemo(() => {
    const incomeTotal = incomes.reduce((sum, item) => sum + item.amount, 0);
    const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
    return openingBalance + incomeTotal - expenseTotal;
  }, [expenses, incomes, openingBalance]);

  const monthLabel = new Date().toLocaleString("en-IN", { month: "long", year: "numeric" });
  const spentPct =
    totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : null;
  const spentPctLabel = spentPct !== null ? formatPercent(spentPct) : null;

  const cards = [
    {
      label: "Income this month",
      display: formatCurrency(totalIncome),
      tone: "text-emerald-800",
      accent: "bg-emerald-500",
      surface: "from-emerald-50/80 to-white",
    },
    {
      label: "Spent this month",
      display: formatCurrency(totalExpense),
      tone: "text-rose-800",
      accent: "bg-rose-500",
      surface: "from-rose-50/80 to-white",
    },
    {
      label: "Account balance",
      display: formatCurrency(accountBalance),
      tone: accountBalance >= 0 ? "text-sage-700" : "text-amber-800",
      accent: accountBalance >= 0 ? "bg-sage-600" : "bg-amber-500",
      surface: accountBalance >= 0 ? "from-sage-50 to-white" : "from-amber-50/80 to-white",
      hint: "Opening + income − expenses",
    },
  ];

  return (
    <section className="animate-fade-up">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Overview
          </p>
          <h2 className="font-display text-xl font-semibold text-ink">{monthLabel}</h2>
        </div>
        {spentPctLabel && (
          <p className="text-xs sm:text-sm text-ink-muted">
            You’ve spent{" "}
            <span className="font-semibold text-ink">{spentPctLabel}</span> of this month’s income
          </p>
        )}
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
        <span>
          Opening balance:{" "}
          <span className="font-semibold text-ink tabular-nums">
            {formatCurrency(openingBalance)}
          </span>
        </span>
        {onEditOpeningBalance && (
          <button
            type="button"
            onClick={onEditOpeningBalance}
            className="font-semibold text-sage-700 hover:text-sage-600"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.surface} ring-1 ring-ink/5 p-5 shadow-soft transition hover:-translate-y-0.5 hover:shadow-panel`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${card.accent}`} />
            <p className="text-xs font-medium text-ink-muted pl-2">{card.label}</p>
            <p className={`mt-1 pl-2 text-2xl font-bold tabular-nums tracking-tight ${card.tone}`}>
              {card.display}
            </p>
            {card.hint && (
              <p className="pl-2 mt-1 text-[11px] text-ink-muted">{card.hint}</p>
            )}
          </div>
        ))}
      </div>

      {totalIncome > 0 && (
        <div className="mt-3 h-1.5 rounded-full bg-sand-100 overflow-hidden ring-1 ring-ink/5">
          <div
            className="h-full rounded-full bg-rose-500/80 transition-all duration-500"
            style={{ width: `${spentPct ?? 0}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  );
}

export default memo(SummaryCards);
