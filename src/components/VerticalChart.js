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

    // Build last 7 days date objects and stable keys (yyyy-MM-dd) to avoid cross-year collisions
    const last7Dates = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
    const dateKeys = last7Dates.map((d) => format(d, "yyyy-MM-dd"));
    const labels = last7Dates.map((date) => {
      if (isToday(date)) return "Today";
      if (isYesterday(date)) return "Yesterday";
      return format(date, "do MMM");
    });

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
      const key = format(expenseDate, "yyyy-MM-dd");
      const dayIndex = dateKeys.indexOf(key);
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
            ? "#3B82F6"
            : category === "Non-Essential Expenses"
              ? "#F59E0B"
              : category === "Savings and Investments"
                ? "#10B981"
                : "#9CA3AF",
        stack: "Stack 0",
        borderRadius: 6,
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
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          color: "#6B7280",
          font: {
            weight: "bold",
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "#F3F4F6",
        },
        ticks: {
          callback: function (value) {
            return `₹${value}`;
          },
          color: "#6B7280",
        },
      },
    },
    elements: {
      bar: {
        borderRadius: 6,
      },
    },
  };

  return (
    <>
      <div className="flex flex-col items-center mt-5 w-full">
        <div className="w-full h-64 sm:h-72">
          <Bar data={chartData} options={options} />
        </div>
      </div>
    </>
  );
};

export default VerticalChart;
