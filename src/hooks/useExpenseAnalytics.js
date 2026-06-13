import { useMemo } from "react";
import {
  EXPENSE_CATEGORY_NAMES,
  getCategoryColor,
} from "../constants/categories";
import {
  formatChartLabel,
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

export function useMonthlySummary(expenses, incomes) {
  return useMemo(() => {
    const monthlyExpenses = expenses.filter((item) => isInCurrentMonth(item.createdAt));
    const monthlyIncomes = incomes.filter((item) => isInCurrentMonth(item.createdAt));

    const totalExpense = monthlyExpenses.reduce((sum, item) => sum + item.amount, 0);
    const totalIncome = monthlyIncomes.reduce((sum, item) => sum + item.amount, 0);

    return {
      totalExpense,
      totalIncome,
      balance: totalIncome - totalExpense,
    };
  }, [expenses, incomes]);
}

export function useCategorySums(monthlyExpenses) {
  return useMemo(() => {
    const sums = Object.fromEntries(
      EXPENSE_CATEGORY_NAMES.map((name) => [name, 0])
    );

    monthlyExpenses.forEach((expense) => {
      if (sums[expense.category] !== undefined) {
        sums[expense.category] += expense.amount;
      }
    });

    return sums;
  }, [monthlyExpenses]);
}

export function useWeeklyBarChartData(expenses) {
  return useMemo(() => {
    const weekStart = subDays(new Date(), 6);
    weekStart.setHours(0, 0, 0, 0);

    const last7Dates = Array.from({ length: 7 }, (_, index) =>
      subDays(new Date(), 6 - index)
    );
    const dateKeys = last7Dates.map((date) => formatDateKey(date));
    const labels = last7Dates.map((date) => formatChartLabel(date));

    const sums = Object.fromEntries(
      EXPENSE_CATEGORY_NAMES.map((name) => [name, Array(7).fill(0)])
    );

    let hasData = false;

    expenses.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate < weekStart) {
        return;
      }

      hasData = true;
      const key = formatDateKey(expenseDate);
      const dayIndex = dateKeys.indexOf(key);
      if (dayIndex !== -1 && sums[expense.category]) {
        sums[expense.category][dayIndex] += expense.amount;
      }
    });

    const datasets = Object.keys(sums).map((category) => ({
      label: category,
      data: sums[category].map((value) => (value === 0 ? null : value)),
      backgroundColor: getCategoryColor(category),
      stack: "Stack 0",
      borderRadius: 6,
    }));

    return { labels, datasets, hasData };
  }, [expenses]);
}
