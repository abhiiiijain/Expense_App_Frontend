import { useMemo } from "react";
import { formatCurrency } from "../../utils/formatCurrency";
import { clampBarWidth } from "../../utils/clampBarWidth";
import { formatMonthLabel } from "../../utils/dateHelpers";

function MonthlySpendList({ monthlyTotals = [] }) {
  const rows = useMemo(() => {
    const sums = {};
    monthlyTotals.forEach((row) => {
      sums[row.monthKey] = row.total;
    });

    const amounts = Object.values(sums);
    const max = Math.max(0, ...amounts);

    return Object.keys(sums)
      .sort((a, b) => b.localeCompare(a))
      .map((monthKey) => {
        const amount = sums[monthKey];
        const pct = max > 0 ? (amount / max) * 100 : 0;
        return {
          monthKey,
          label: formatMonthLabel(monthKey),
          amount,
          barWidth: clampBarWidth(pct),
        };
      });
  }, [monthlyTotals]);

  if (rows.length === 0) return null;

  return (
    <div className="pt-4 mt-4" style={{ borderTop: "1px solid var(--sw-border)" }}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted mb-2">
        By month
      </p>
      <ul className="space-y-1">
        {rows.map((row) => (
          <li key={row.monthKey} className="px-2 py-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex-1 min-w-0 text-xs sm:text-sm font-medium text-ink truncate">
                {row.label}
              </span>
              <span className="text-xs sm:text-sm font-bold text-ink tabular-nums shrink-0">
                {formatCurrency(row.amount)}
              </span>
            </div>
            <div className="mt-1.5 h-1 rounded-full overflow-hidden bg-[var(--sw-muted-bg)]">
              <div
                className="h-full rounded-full bg-sage-600 transition-all duration-500"
                style={{ width: `${row.barWidth}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MonthlySpendList;
