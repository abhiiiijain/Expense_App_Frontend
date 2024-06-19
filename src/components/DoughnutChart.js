import React from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const DoughnutChart = ({ expensess, userDetails }) => {
  if (!userDetails) {
    return null;
  }

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const userExpenses = expensess.filter(
    (expense) =>
      expense.email === userDetails.email &&
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
        backgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0", "#C0C0C0"],
        hoverBackgroundColor: ["#36A2EB", "#FFCE56", "#4BC0C0", "#C0C0C0"],
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
            return `${
              data.labels[tooltipItem.dataIndex]
            }: ${value} (${percentage}%)`;
          },
        },
      },
      datalabels: {
        formatter: (value, context) => {
          const percentage = percentages[context.dataIndex];
          return `${percentage}%`;
        },
        color: "#000",
        borderRadius: 3,
        font: {
          weight: "light",
        },
        padding: 10,
      },
      // sum: {
      //   afterDraw: (chart) => {
      //     const {
      //       ctx,
      //       chartArea: { left, right, bottom },
      //     } = chart;
      //     ctx.save();
      //     ctx.font = "bold 14px Arial";
      //     ctx.fillStyle = "#000";
      //     ctx.textAlign = "center";
      //     ctx.fillText(`Total: ${total}`, (left + right) / 2, bottom + 30);
      //   },
      // },
    },
  };

  return (
    <>
      <div>
        <Doughnut data={data} options={options} />
      </div>
    </>
  );
};

export default DoughnutChart;
