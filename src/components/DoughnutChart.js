import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DoughnutChart = ({ expensess, user }) => {
  if (!user) {
    return null;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const userExpenses = expensess.filter(
    (expense) =>
      expense.email === user.email &&
      new Date(expense.createdAt).getMonth() === currentMonth &&
      new Date(expense.createdAt).getFullYear() === currentYear
  );

  let sum1 = 0;
  let sum2 = 0;
  let sum3 = 0;
  let sum4 = 0;

  userExpenses.forEach((data) => {
    if (data.category === "Essential Expenses") {
      sum1 += data.amount;
    } else if (data.category === "Non-Essential Expenses") {
      sum2 += data.amount;
    } else if (data.category === "Savings and Investments") {
      sum3 += data.amount;
    } else if (data.category === "Miscellaneous") {
      sum4 += data.amount;
    }
  });

  const total = sum1 + sum2 + sum3 + sum4;
  const percentages = [
    ((sum1 / total) * 100).toFixed(2),
    ((sum2 / total) * 100).toFixed(2),
    ((sum3 / total) * 100).toFixed(2),
    ((sum4 / total) * 100).toFixed(2),
  ];

  const data = {
    labels: [
      "Essential Expenses",
      "Non-Essential Expenses",
      "Savings and Investments",
      "Miscellaneous",
    ],
    datasets: [
      {
        data: [sum1, sum2, sum3, sum4],
        backgroundColor: ["#3B82F6", "#F59E0B", "#10B981", "#9CA3AF"],
        hoverBackgroundColor: ["#2563EB", "#D97706", "#059669", "#6B7280"],
        borderWidth: 2,
        borderColor: "#fff",
        cutout: "65%",
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
        position: "right",
        labels: {
          usePointStyle: true,
          pointStyle: "rect",
          boxWidth: 20,
          padding: 20,
          font: {
            weight: "bold",
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            const value = tooltipItem.raw;
            const percentage = ((value / total) * 100).toFixed(2);
            return `${data.labels[tooltipItem.dataIndex]}: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const percentage = percentages[context.dataIndex];
          return `${percentage}%`;
        },
        color: "#111827",
        borderRadius: 3,
        font: {
          weight: "bold",
          size: 12,
        },
        padding: 10,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <>
      <div className="relative w-full h-56 sm:h-64">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
            <div className="text-xl font-extrabold text-gray-900">₹{total.toFixed(2)}</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoughnutChart;
