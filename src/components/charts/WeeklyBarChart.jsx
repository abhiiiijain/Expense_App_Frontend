import { memo, useMemo } from "react";
import { Bar } from "react-chartjs-2";
import { useWeeklyBarChartData } from "../../hooks/useExpenseAnalytics";
import { formatChartAxis, formatCurrency } from "../../utils/formatCurrency";
import EmptyState from "../EmptyState";
import CardHeader from "./CardHeader";

function WeeklyBarChart({ expenses }) {
  const { labels, datasets, hasData } = useWeeklyBarChartData(expenses);

  const options = useMemo(
    () => ({
      responsive: true,
      plugins: {
        legend: { display: false },
        datalabels: { display: false },
        tooltip: {
          callbacks: {
            label(tooltipItem) {
              const label = tooltipItem.dataset.label || "";
              return `${label}: ${formatCurrency(tooltipItem.raw)}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: "#6B7280", font: { size: 11, weight: "600" } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          grid: { color: "#F3F4F6" },
          ticks: {
            callback(value) {
              return formatChartAxis(value);
            },
            color: "#6B7280",
            maxTicksLimit: 6,
          },
        },
      },
      elements: {
        bar: { borderRadius: 6 },
      },
    }),
    []
  );

  return (
    <div className="sw-panel p-5 sm:p-6 w-full">
      <CardHeader eyebrow="Overview" title="Last 7 Days" />
      {!hasData ? (
        <EmptyState
          title="No spending this week"
          description="Your last 7 days of expenses will appear here"
        />
      ) : (
        <div className="w-full h-64 sm:h-72 mt-2">
          <Bar data={{ labels, datasets }} options={options} />
        </div>
      )}
    </div>
  );
}

export default memo(WeeklyBarChart);
