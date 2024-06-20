// src/VerticalChart.js
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { format, subDays, isToday, isYesterday } from "date-fns";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
);

const VerticalChart = ({ expensess, user }) => {
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  useEffect(() => {
    if (!user) {
      return;
    }

    const userExpenses = expensess.filter(
      (expense) => expense.email === user.email
    );

    // Generate the labels for the past 7 days with Today and Yesterday labels
    const labels = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), i);
      if (isToday(date)) {
        return "Today";
      }
      if (isYesterday(date)) {
        return "Yesterday";
      }
      return format(date, "do MMM");
    }).reverse();

    // Initialize sums for each category
    const sums = {
      "Essential Expenses": Array(7).fill(0),
      "Non-Essential Expenses": Array(7).fill(0),
      "Savings and Investments": Array(7).fill(0),
      Miscellaneous: Array(7).fill(0),
    };

    // Aggregate data by category and date
    userExpenses.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      let label;
      if (isToday(expenseDate)) {
        label = "Today";
      } else if (isYesterday(expenseDate)) {
        label = "Yesterday";
      } else {
        label = format(expenseDate, "do MMM");
      }

      const dayIndex = labels.indexOf(label);
      if (dayIndex !== -1) {
        sums[expense.category][dayIndex] += expense.amount;
      }
    });

    const datasets = Object.keys(sums).map((category) => {
      // Filter out zero values
      const filteredData = sums[category].map((value) =>
        value === 0 ? null : value
      );

      return {
        label: category,
        data: filteredData,
        backgroundColor:
          category === "Essential Expenses"
            ? "#36A2EB"
            : category === "Non-Essential Expenses"
            ? "#FFCE56"
            : category === "Savings and Investments"
            ? "#4BC0C0"
            : "#C0C0C0",
        stack: "Stack 0",
      };
    });

    setChartData({ labels, datasets });
  }, [expensess, user]);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: "right",
      },
      tooltip: {
        callbacks: {
          label: function (tooltipItem) {
            return `₹${tooltipItem.raw}`;
          },
        },
      },
      // afterDatasetsDraw: {
      //   id: "afterDatasetsDraw",
      //   afterDatasetsDraw(chart) {
      //     const { ctx, scales } = chart;
      //     const xScale = scales.x;
      //     const yScale = scales.y;

      //     chartData.labels.forEach((label, index) => {
      //       let sum = 0;
      //       chartData.datasets.forEach((dataset) => {
      //         if (dataset.data[index] !== null) {
      //           sum += dataset.data[index];
      //         }
      //       });
      //       const x = xScale.getPixelForValue(label);
      //       const y = yScale.getPixelForValue(sum);

      //       ctx.save();
      //       ctx.font = "bold 12px Arial";
      //       ctx.fillStyle = "#000";
      //       ctx.textAlign = "center";
      //       ctx.fillText(`₹${sum}`, x, y - 10);
      //       ctx.restore();
      //     });
      //   },
      // },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
        },
      },
    },
  };

  return (
    <>
      <div className="flex flex-col items-center mt-5">
        <Bar data={chartData} options={options} />
      </div>
    </>
  );
};

export default VerticalChart;
