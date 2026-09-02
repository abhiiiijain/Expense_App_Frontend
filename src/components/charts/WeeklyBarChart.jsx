import { memo, useEffect, useMemo, useState } from "react";
import { Bar } from "react-chartjs-2";
import { useCategories } from "../../config/AppConfigContext";
import { useWeeklyBarChartData } from "../../hooks/useExpenseAnalytics";
import { formatChartAxis, formatCurrency } from "../../utils/formatCurrency";
import EmptyState from "../EmptyState";
import CardHeader from "./CardHeader";
import { AccountTotalsBar } from "../AccountBreakdown";
import { useAccountExpenseTotals } from "../../hooks/useAccountExpenseTotals";

function useIsNarrow(breakpoint = 640) {
  const [isNarrow, setIsNarrow] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches : false
  );

  useEffect(() => {
    const media = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const onChange = () => setIsNarrow(media.matches);
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [breakpoint]);

  return isNarrow;
}

function useBarChartOptions(isNarrow, tooltipLabels) {
  return useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      layout: {
        padding: {
          top: 8,
          bottom: isNarrow ? 8 : 4,
          left: isNarrow ? 0 : 4,
          right: isNarrow ? 4 : 4,
        },
      },
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          backgroundColor: "#0f172a",
          titleColor: "#f8fafc",
          bodyColor: "#e2e8f0",
          padding: 10,
          cornerRadius: 8,
          boxPadding: 4,
          callbacks: {
            title(items) {
              const index = items[0]?.dataIndex;
              return tooltipLabels[index] || items[0]?.label || "";
            },
            label(tooltipItem) {
              const value = Number(tooltipItem.raw) || 0;
              if (value <= 0) return null;
              return `${tooltipItem.dataset.label}: ${formatCurrency(value)}`;
            },
            footer(items) {
              const total = items.reduce((sum, item) => sum + (Number(item.raw) || 0), 0);
              return total > 0 ? `Total: ${formatCurrency(total)}` : "";
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          border: { display: false },
          ticks: {
            color: "#64748b",
            font: {
              size: isNarrow ? 10 : 11,
              weight: "600",
            },
            maxRotation: isNarrow ? 45 : 0,
            minRotation: isNarrow ? 45 : 0,
            autoSkip: false,
            padding: isNarrow ? 6 : 4,
          },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grace: "8%",
          border: { display: false },
          grid: {
            color: "#f1f5f9",
            drawTicks: false,
          },
          ticks: {
            callback(value) {
              return formatChartAxis(value);
            },
            color: "#94a3b8",
            maxTicksLimit: isNarrow ? 4 : 5,
            padding: isNarrow ? 6 : 10,
            font: { size: isNarrow ? 10 : 11 },
          },
        },
      },
    }),
    [isNarrow, tooltipLabels]
  );
}

function WeeklyChartBlock({ labels, tooltipLabels, datasets }) {
  const isNarrow = useIsNarrow();
  const options = useBarChartOptions(isNarrow, tooltipLabels);

  return (
    <div className="w-full -mx-1 sm:mx-0 h-60 sm:h-72">
      <Bar data={{ labels, datasets }} options={options} />
    </div>
  );
}

function WeeklyBarChart({ expenses, accounts = [], accountFilter = "all" }) {
  const { expenseCategories, expenseCategoryNames } = useCategories();
  const accountTotals = useAccountExpenseTotals(expenses, accounts, accountFilter);
  const { labels, tooltipLabels, datasets, weekTotal, hasData } = useWeeklyBarChartData(
    expenses,
    expenseCategories,
    expenseCategoryNames
  );

  return (
    <div className="sw-panel p-4 sm:p-6 w-full">
      <CardHeader eyebrow="Overview" title="Last 7 Days">
        {hasData && (
          <div className="text-right shrink-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Week total
            </p>
            <p className="text-sm font-bold text-ink tabular-nums mt-0.5">
              {formatCurrency(weekTotal)}
            </p>
          </div>
        )}
      </CardHeader>

      {!hasData ? (
        <EmptyState
          title="No spending this week"
          description="Your last 7 days of expenses will appear here"
        />
      ) : (
        <>
          {accountTotals.length > 0 && (
            <AccountTotalsBar totals={accountTotals} tone="expense" className="mb-4" />
          )}
          <WeeklyChartBlock
            labels={labels}
            tooltipLabels={tooltipLabels}
            datasets={datasets}
          />
        </>
      )}
    </div>
  );
}

export default memo(WeeklyBarChart);
