import { memo, useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { useCategories } from "../../config/AppConfigContext";
import { formatCurrency } from "../../utils/formatCurrency";

/** Min share before a segment gets an on-chart % label (matches deployed). */
const LABEL_MIN_PCT = 10;

function DoughnutChart({ categorySums }) {
  const { expenseCategories } = useCategories();

  const { data, options, total, hasData } = useMemo(() => {
    const active = expenseCategories.filter((category) => (categorySums[category.name] || 0) > 0);
    const values = active.map((category) => categorySums[category.name]);
    const chartTotal = values.reduce((sum, value) => sum + value, 0);

    return {
      total: chartTotal,
      hasData: chartTotal > 0,
      data: {
        labels: active.map((category) => category.name),
        datasets: [
          {
            data: values,
            backgroundColor: active.map((category) => category.color),
            hoverBackgroundColor: active.map((category) => category.hoverColor),
            borderWidth: 1,
            borderColor: "#fff",
            hoverBorderColor: "#fff",
            cutout: "68%",
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: { enabled: false },
          datalabels: {
            display(context) {
              const value = context.dataset.data[context.dataIndex];
              if (!value || chartTotal <= 0) return false;
              return (value / chartTotal) * 100 >= LABEL_MIN_PCT;
            },
            formatter(value) {
              const pct = chartTotal > 0 ? (value / chartTotal) * 100 : 0;
              return `${pct.toFixed(1)}%`;
            },
            color: "#fff",
            font: { weight: "700", size: 11 },
            textStrokeColor: "rgba(15, 23, 42, 0.25)",
            textStrokeWidth: 2,
            anchor: "center",
            align: "center",
          },
        },
      },
    };
  }, [categorySums, expenseCategories]);

  if (!hasData) return null;

  return (
    <div className="relative w-full h-60 sm:h-64">
      <Doughnut data={data} options={options} plugins={[ChartDataLabels]} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center px-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
            Total
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-ink tabular-nums leading-tight mt-0.5">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(DoughnutChart);
