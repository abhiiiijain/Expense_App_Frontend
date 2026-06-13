import React, { useMemo } from "react";
import { Doughnut } from "react-chartjs-2";
import "../config/chartSetup";
import {
  EXPENSE_CATEGORY_NAMES,
  EXPENSE_CHART_COLORS,
} from "../constants/categories";
import { formatCurrency } from "../utils/formatCurrency";
import EmptyState from "./EmptyState";

const DoughnutChart = ({ categorySums }) => {
  const { data, options, total, hasData } = useMemo(() => {
    const values = EXPENSE_CATEGORY_NAMES.map((name) => categorySums[name] || 0);
    const chartTotal = values.reduce((sum, value) => sum + value, 0);
    const percentages = values.map((value) =>
      chartTotal > 0 ? ((value / chartTotal) * 100).toFixed(1) : "0"
    );

    return {
      total: chartTotal,
      hasData: chartTotal > 0,
      data: {
        labels: EXPENSE_CATEGORY_NAMES,
        datasets: [
          {
            data: chartTotal > 0 ? values : [1],
            backgroundColor: chartTotal > 0 ? EXPENSE_CHART_COLORS.background : ["#E5E7EB"],
            hoverBackgroundColor: chartTotal > 0 ? EXPENSE_CHART_COLORS.hover : ["#E5E7EB"],
            borderWidth: 2,
            borderColor: "#fff",
            cutout: "65%",
          },
        ],
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: { enabled: chartTotal > 0 },
          datalabels: {
            display: (context) => {
              const value = context.dataset.data[context.dataIndex];
              if (!value || chartTotal <= 0) return false;
              const pct = (value / chartTotal) * 100;
              return pct >= 8;
            },
            formatter: (_value, context) => `${percentages[context.dataIndex]}%`,
            color: "#fff",
            font: { weight: "bold", size: 11 },
          },
        },
        maintainAspectRatio: false,
      },
    };
  }, [categorySums]);

  if (!hasData) {
    return (
      <EmptyState
        icon="💸"
        title="No expenses this month"
        description="Tap + to add your first expense"
      />
    );
  }

  return (
    <div className="relative w-full h-56 sm:h-64">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
          <div className="text-xl font-extrabold text-gray-900 tabular-nums">
            {formatCurrency(total)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoughnutChart;
