import { EXPENSE_CATEGORY_COLORS } from "../constants/categoryMeta";

export function buildCategoriesFromTaxonomy(taxonomy) {
  const expenseCategories = taxonomy.expenseCategories.map((name) => ({
    name,
    color: EXPENSE_CATEGORY_COLORS[name]?.color ?? "#9CA3AF",
    hoverColor: EXPENSE_CATEGORY_COLORS[name]?.hoverColor ?? "#6B7280",
  }));

  return {
    expenseCategories,
    expenseCategoryNames: taxonomy.expenseCategories,
    expenseSubcategories: taxonomy.expenseSubcategories,
    expenseFilterCategories: ["All", ...taxonomy.expenseCategories],
    incomeCategoryNames: taxonomy.incomeCategories,
    incomeSubcategories: taxonomy.incomeSubcategories,
    incomeFilterCategories: ["All", ...taxonomy.incomeCategories],
  };
}
