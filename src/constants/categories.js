export const EXPENSE_CATEGORIES = [
  { name: "Essential Expenses", color: "#3B82F6", hoverColor: "#2563EB" },
  { name: "Non-Essential Expenses", color: "#F59E0B", hoverColor: "#D97706" },
  { name: "Savings and Investments", color: "#10B981", hoverColor: "#059669" },
  { name: "Miscellaneous", color: "#9CA3AF", hoverColor: "#6B7280" },
];

export const EXPENSE_CATEGORY_NAMES = EXPENSE_CATEGORIES.map((category) => category.name);

export const EXPENSE_CHART_COLORS = {
  background: EXPENSE_CATEGORIES.map((category) => category.color),
  hover: EXPENSE_CATEGORIES.map((category) => category.hoverColor),
};

export function getCategoryColor(category) {
  return EXPENSE_CATEGORIES.find((item) => item.name === category)?.color ?? "#9CA3AF";
}

export const EXPENSE_SUBCATEGORIES = {
  "Essential Expenses": [
    "Housing",
    "Transportation",
    "Food",
    "Utilities and Services",
    "Healthcare",
    "Insurance",
    "Debt Repayments",
  ],
  "Non-Essential Expenses": [
    "Entertainment and Leisure",
    "Personal Care",
    "Clothing and Accessories",
  ],
  "Savings and Investments": ["Savings", "Investments"],
  Miscellaneous: [
    "Education and Self-Improvement",
    "Gifts and Donations",
    "Miscellaneous",
  ],
};

export const EXPENSE_FILTER_CATEGORIES = ["All", ...EXPENSE_CATEGORY_NAMES];

export const INCOME_CATEGORY_NAMES = [
  "Primary Income",
  "Secondary Income",
  "Investments",
  "Gifts & Refunds",
  "Other Income",
];

export const INCOME_SUBCATEGORIES = {
  "Primary Income": ["Salary", "Bonus"],
  "Secondary Income": ["Freelance", "Side Hustle"],
  Investments: ["Dividends", "Interest"],
  "Gifts & Refunds": ["Gift", "Tax Refund"],
  "Other Income": ["Other"],
};

export const INCOME_FILTER_CATEGORIES = ["All", ...INCOME_CATEGORY_NAMES];

export const SUBCATEGORY_ICONS = {
  Housing: "🏠",
  Transportation: "🚗",
  Food: "🍔",
  "Utilities and Services": "💡",
  Healthcare: "⚕️",
  Insurance: "📑",
  "Debt Repayments": "💳",
  "Entertainment and Leisure": "🎉",
  "Personal Care": "💅",
  "Clothing and Accessories": "👗",
  Savings: "💰",
  Investments: "📈",
  "Education and Self-Improvement": "🎓",
  "Gifts and Donations": "🎁",
  Miscellaneous: "🛠️",
  Salary: "💼",
  Bonus: "💲",
  Freelance: "🧑‍💻",
  "Side Hustle": "🧰",
  Dividends: "🧾",
  Interest: "💹",
  Gift: "🎁",
  "Tax Refund": "🔁",
  Other: "🔖",
};
