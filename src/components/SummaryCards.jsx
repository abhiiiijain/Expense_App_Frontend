import { memo } from "react";
import { formatCurrency, formatLedgerAmount, formatPercent } from "../utils/formatCurrency";

function creditBillHint(creditBill, fallback) {
  const instalments = creditBill?.instalments || [];
  if (instalments.length > 1) {
    const parts = instalments
      .map((row) => (row.label ? `${row.label} ${formatCurrency(row.amount)}` : null))
      .filter(Boolean);
    return `Paid in ${instalments.length} instalments · ${parts.join(" · ")}`;
  }
  if (creditBill?.paidOnLabel) return `Paid on ${creditBill.paidOnLabel}`;
  if (instalments.length === 1 && instalments[0].label) {
    return `${formatCurrency(instalments[0].amount)} paid on ${instalments[0].label}`;
  }
  return fallback;
}

function SummaryCards({
  totalIncome = 0,
  totalExpense = 0,
  openingBalance = 0,
  accountBalance = 0,
  isCredit = false,
  creditBill = null,
  periodNote = null,
  balanceHint = "Month end · opening this month + income − spend",
  outsideSettled = 0,
  unmatchedCardOutflow = 0,
  onEditOpeningBalance,
}) {
  const resolvedBalance =
    typeof accountBalance === "number" ? accountBalance : openingBalance;
  const billPaid = Boolean(isCredit && creditBill?.isPaid);
  const hideOpening = isCredit && Math.abs(openingBalance) < 0.005;
  const showDue = isCredit && resolvedBalance < 0 && !billPaid;

  const spentPct =
    totalIncome > 0 ? Math.min(100, (totalExpense / totalIncome) * 100) : null;
  const spentPctLabel = spentPct !== null ? formatPercent(spentPct) : null;
  const paidHint = billPaid || creditBill?.instalments?.length
    ? creditBillHint(creditBill, balanceHint)
    : null;
  const reconcileParts = [];
  if (outsideSettled > 0.005) {
    reconcileParts.push(`+ ${formatCurrency(outsideSettled)} paid outside SpendWise`);
  }
  if (unmatchedCardOutflow > 0.005) {
    reconcileParts.push(`− ${formatCurrency(unmatchedCardOutflow)} other card payments`);
  }

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
    billPaid
      ? {
          label: "Amount due",
          shortLabel: "Due",
          display: formatCurrency(creditBill.due),
          badge: "✓ Paid",
          tone: "text-emerald-700 dark:text-emerald-400",
          accent: "bg-emerald-600",
          wash: "bg-emerald-50 dark:bg-emerald-500/10",
          hint: paidHint,
          wideOnMobile: true,
        }
      : {
          label: showDue ? "Amount due" : "Account balance",
          shortLabel: showDue ? "Due" : "Balance",
          display: formatCurrency(showDue ? Math.abs(resolvedBalance) : resolvedBalance),
          tone:
            resolvedBalance >= 0
              ? "text-sage-700 dark:text-blue-300"
              : "text-amber-800 dark:text-amber-300",
          accent: resolvedBalance >= 0 ? "bg-sage-600" : "bg-amber-500",
          wash:
            resolvedBalance >= 0
              ? "bg-sage-50 dark:bg-sage-600/10"
              : "bg-amber-50 dark:bg-amber-500/10",
          hint: paidHint || balanceHint,
          wideOnMobile: true,
        },
  ];

  return (
    <section>
      <div className="mb-1.5 sm:mb-2 flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-x-4 text-xs text-ink-muted">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 min-w-0">
          {!hideOpening && (
            <span className="inline-flex items-baseline flex-wrap gap-x-1.5">
              Opening
              <span className="font-semibold text-ink tabular-nums">
                {formatLedgerAmount(openingBalance)}
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
            </span>
          )}
          {periodNote && <span className="truncate">{periodNote}</span>}
        </div>
        {spentPctLabel && (
          <p>
            Spent <span className="font-semibold text-ink">{spentPctLabel}</span> of income
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 sm:gap-2">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`relative overflow-hidden rounded-xl px-2 py-1.5 sm:px-3 sm:py-2 ${card.wash} ${
              card.wideOnMobile
                ? "col-span-2 sm:col-span-1 max-sm:flex max-sm:items-center max-sm:justify-between max-sm:gap-2"
                : ""
            }`}
            style={{ border: "1px solid var(--sw-border)" }}
            title={card.hint || undefined}
          >
            <div className={`absolute left-0 top-0 h-full w-1 ${card.accent}`} />
            <p className="text-[11px] font-medium text-ink-muted pl-2 leading-none shrink-0">
              <span className="sm:hidden">{card.shortLabel || card.label}</span>
              <span className="hidden sm:inline">{card.label}</span>
            </p>
            <div
              className={`pl-2 flex items-baseline justify-between gap-1.5 min-w-0 ${
                card.wideOnMobile ? "mt-0 sm:mt-1" : "mt-1"
              }`}
            >
              <p
                className={`text-base sm:text-xl font-bold tabular-nums tracking-tight leading-tight ${card.tone}`}
              >
                {card.display}
              </p>
              {card.badge && (
                <p className={`shrink-0 text-xs font-semibold ${card.tone}`}>{card.badge}</p>
              )}
            </div>
            {card.hint && (billPaid || (creditBill?.instalments?.length || 0) > 0) && (
              <p className="pl-2 mt-0.5 text-[10px] text-ink-muted truncate max-sm:hidden">{card.hint}</p>
            )}
          </div>
        ))}
      </div>

      {reconcileParts.length > 0 && (
        <p className="mt-2 text-[11px] text-ink-muted">
          Balance is not opening + income − spent · {reconcileParts.join(" · ")}
        </p>
      )}

      {totalIncome > 0 && (
        <div className="mt-2 h-1 rounded-full overflow-hidden bg-[var(--sw-muted-bg)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-leaf-500 to-sage-600"
            style={{ width: `${spentPct ?? 0}%` }}
            aria-hidden="true"
          />
        </div>
      )}
    </section>
  );
}

export default memo(SummaryCards);
