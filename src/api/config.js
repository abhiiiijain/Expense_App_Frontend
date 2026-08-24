import { apiClient } from "./client";
import fallbackTaxonomy from "../data/taxonomy.fallback.json";
import { buildCategoriesFromTaxonomy } from "../utils/buildCategories";
import { DEFAULT_EDIT_WINDOW_MS } from "../utils/formatEditWindow";

export const DEFAULT_CONFIG = {
  editWindowMs: DEFAULT_EDIT_WINDOW_MS,
  ...buildCategoriesFromTaxonomy(fallbackTaxonomy),
  loaded: false,
};

export async function fetchAppConfig() {
  const { data } = await apiClient.get("config");
  const taxonomy = {
    expenseCategories: data.expenseCategories ?? fallbackTaxonomy.expenseCategories,
    incomeCategories: data.incomeCategories ?? fallbackTaxonomy.incomeCategories,
    expenseSubcategories: data.expenseSubcategories ?? fallbackTaxonomy.expenseSubcategories,
    incomeSubcategories: data.incomeSubcategories ?? fallbackTaxonomy.incomeSubcategories,
  };

  return {
    editWindowMs: data.editWindowMs ?? DEFAULT_CONFIG.editWindowMs,
    ...buildCategoriesFromTaxonomy(taxonomy),
    loaded: true,
  };
}
