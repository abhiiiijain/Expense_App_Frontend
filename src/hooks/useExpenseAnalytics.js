import { useMemo } from "react";
import {
  formatChartDateLabel,
  formatChartDayTooltip,
  formatDateKey,
  isInCurrentMonth,
  subDays,
} from "../utils/dateHelpers";

export function useCurrentMonthExpenses(expenses) {
  return useMemo(
    () => expenses.filter((expense) => isInCurrentMonth(expense.createdAt)),
    [expenses]
  );
}

export function useMonthExpenseTotal(monthlyExpenses) {
  return useMemo(
    () => monthlyExpenses.reduce((sum, item) => sum + item.amount, 0),
    [monthlyExpenses]
  );
}

export function useMonthlySummary(expenses, incomes) {
  return useMemo(() => {
    let totalExpense = 0;
    let totalIncome = 0;

    for (const item of expenses) {
      if (isInCurrentMonth(item.createdAt)) {
        totalExpense += item.amount;
      }
    }

    for (const item of incomes) {
      if (isInCurrentMonth(item.createdAt)) {
        totalIncome += item.amount;
      }
    }

    return { totalExpense, totalIncome };
  }, [expenses, incomes]);
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
    const weekStart = subDays(new Date(), 6);
    weekStart.setHours(0, 0, 0, 0);

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
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate < weekStart) {
        return;
      }

      const dayIndex = dateKeys.indexOf(formatDateKey(expenseDate));
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
      data: sums[category],
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

    const weekTotal = activeCategories.reduce(
      (sum, name) => sum + sums[name].reduce((daySum, value) => daySum + value, 0),
      0
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
