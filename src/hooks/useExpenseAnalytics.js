import { useMemo } from "react";
import {
  formatChartDateLabel,
  formatChartDayTooltip,
  formatDateKey,
  subDays,
  transactionDate,
} from "../utils/dateHelpers";

export function useMonthTotal(items) {
  return useMemo(() => items.reduce((sum, item) => sum + item.amount, 0), [items]);
}

export function useCategorySums(monthlyExpenses, expenseCategoryNames) {
  return useMemo(() => {
    const sums = Object.fromEntries(expenseCategoryNames.map((name) => [name, 0]));

    monthlyExpenses.forEach((expense) => {
      if (sums[expense.category] !== undefined) {
        sums[expense.category] += expense.amount;
      }
    });

    return sums;
  }, [monthlyExpenses, expenseCategoryNames]);
}

export function useWeeklyBarChartData(expenses, expenseCategories, expenseCategoryNames) {
  return useMemo(() => {
    const last7Dates = Array.from({ length: 7 }, (_, index) =>
      subDays(new Date(), 6 - index)
    );
    const dateKeys = last7Dates.map((date) => formatDateKey(date));
    const labels = last7Dates.map((date) => formatChartDateLabel(date));
    const tooltipLabels = last7Dates.map((date) => formatChartDayTooltip(date));

    const sums = Object.fromEntries(
      expenseCategoryNames.map((name) => [name, Array(7).fill(0)])
    );

    expenses.forEach((expense) => {
      const dayIndex = dateKeys.indexOf(formatDateKey(transactionDate(expense)));
      if (dayIndex !== -1 && sums[expense.category]) {
        sums[expense.category][dayIndex] += expense.amount;
      }
    });

    const colorByName = Object.fromEntries(
      expenseCategories.map((category) => [category.name, category.color])
    );

    const activeCategories = expenseCategoryNames.filter((name) =>
      sums[name].some((value) => value > 0)
    );

    const datasets = activeCategories.map((category) => ({
      label: category,
      data: sums[category].map((value) => Math.max(0, value)),
      backgroundColor: colorByName[category] || "#9CA3AF",
      stack: "week",
      maxBarThickness: 44,
      categoryPercentage: 0.72,
      barPercentage: 0.9,
      borderSkipped: false,
      borderRadius(ctx) {
        const { chart, dataIndex, datasetIndex } = ctx;
        const stack = chart.data.datasets;
        let topIndex = -1;
        for (let i = stack.length - 1; i >= 0; i -= 1) {
          if ((Number(stack[i].data[dataIndex]) || 0) > 0) {
            topIndex = i;
            break;
          }
        }
        if (datasetIndex !== topIndex) return 0;
        return { topLeft: 8, topRight: 8, bottomLeft: 0, bottomRight: 0 };
      },
    }));

    const weekTotal = Math.max(
      0,
      activeCategories.reduce(
        (sum, name) => sum + sums[name].reduce((daySum, value) => daySum + value, 0),
        0
      )
    );

    return {
      labels,
      tooltipLabels,
      datasets,
      weekTotal,
      hasData: weekTotal > 0,
    };
  }, [expenses, expenseCategories, expenseCategoryNames]);
}
