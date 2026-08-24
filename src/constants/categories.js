import taxonomy from "../../../shared/taxonomy.json";
import { EXPENSE_CATEGORY_COLORS, SUBCATEGORY_ICONS } from "./categoryMeta";

export { SUBCATEGORY_ICONS };

export const EXPENSE_CATEGORIES = taxonomy.expenseCategories.map((name) => ({
  name,
  color: EXPENSE_CATEGORY_COLORS[name]?.color ?? "#9CA3AF",
  hoverColor: EXPENSE_CATEGORY_COLORS[name]?.hoverColor ?? "#6B7280",
}));

export const EXPENSE_CATEGORY_NAMES = taxonomy.expenseCategories;

export const EXPENSE_SUBCATEGORIES = taxonomy.expenseSubcategories;

export const EXPENSE_FILTER_CATEGORIES = ["All", ...EXPENSE_CATEGORY_NAMES];

export const INCOME_CATEGORY_NAMES = taxonomy.incomeCategories;

export const INCOME_SUBCATEGORIES = taxonomy.incomeSubcategories;

export const INCOME_FILTER_CATEGORIES = ["All", ...INCOME_CATEGORY_NAMES];
