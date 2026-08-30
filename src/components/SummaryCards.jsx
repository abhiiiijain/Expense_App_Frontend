import { memo } from "react";
import { formatCurrency, formatPercent } from "../utils/formatCurrency";
import { formatMonthLabel } from "../utils/dateHelpers";

function SummaryCards({
  monthKey,
  totalIncome = 0,
  totalExpense = 0,
  openingBalance = 0,
  accountBalance = 0,
  onEditOpeningBalance,
}) {
  const resolvedBalance =
    typeof accountBalance === "number" ? accountBalance : openingBalance;

  const monthLabel = formatMonthLabel(monthKey);
  const spentPct =
    totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : null;
  const spentPctLabel = spentPct !== null ? formatPercent(spentPct) : null;

  const cards = [
    {
      label: "Income",
      display: formatCurrency(totalIncome),
      tone: "text-leaf-700 dark:text-leaf-500",
      accent: "bg-leaf-600",
      wash: "bg-leaf-50 dark:bg-leaf-600/10",
    },
    {
      label: "Spent",
      display: formatCurrency(totalExpense),
      tone: "text-rose-700 dark:text-rose-400",
      accent: "bg-rose-500",
      wash: "bg-rose-50 dark:bg-rose-500/10",
    },
    {
      label: "Account balance",
      display: formatCurrency(resolvedBalance),
      tone:
        resolvedBalance >= 0
          ? "text-sage-700 dark:text-blue-300"
          : "text-amber-800 dark:text-amber-300",
      accent: resolvedBalance >= 0 ? "bg-sage-600" : "bg-amber-500",
      wash:
        resolvedBalance >= 0
          ? "bg-sage-50 dark:bg-sage-600/10"
          : "bg-amber-50 dark:bg-amber-500/10",
      hint: "All accounts · opening + income − expenses",
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
            className="font-semibold text-sage-700 hover:text-sage-600 dark:text-blue-300 dark:hover:text-blue-200"
          >
            Edit
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {cards.map((card, index) => (
          <div
            key={card.label}
            className={`sw-card ${card.wash}`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className={`absolute left-0 top-0 h-full w-1.5 ${card.accent}`} />
            <p className="text-xs font-medium text-ink-muted pl-2">{card.label}</p>
            <p className={`mt-1 pl-2 text-2xl font-bold tabular-nums tracking-tight ${card.tone}`}>
              {card.display}
            </p>
            {card.hint && <p className="pl-2 mt-1 text-[11px] text-ink-muted">{card.hint}</p>}
          </div>
        ))}
      </div>

      {totalIncome > 0 && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden border border-[var(--sw-border)] bg-[var(--sw-muted-bg)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-sage-600 transition-all duration-500"
            style={{ width: `${spentPct ?? 0}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  );
}

export default memo(SummaryCards);
