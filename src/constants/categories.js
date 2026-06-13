export const EXPENSE_CATEGORY_NAMES = [
  "Essential Expenses",
  "Non-Essential Expenses",
  "Savings and Investments",
  "Miscellaneous",
];

export const EXPENSE_CATEGORIES = [
  { name: "Essential Expenses", color: "#36A2EB" },
  { name: "Non-Essential Expenses", color: "#FFCE56" },
  { name: "Savings and Investments", color: "#4BC0C0" },
  { name: "Miscellaneous", color: "#C0C0C0" },
];

export const EXPENSE_CHART_COLORS = {
  background: ["#3B82F6", "#F59E0B", "#10B981", "#9CA3AF"],
  hover: ["#2563EB", "#D97706", "#059669", "#6B7280"],
};

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

export function getCategoryBarColor(category) {
  switch (category) {
    case "Essential Expenses":
      return "#3B82F6";
    case "Non-Essential Expenses":
      return "#F59E0B";
    case "Savings and Investments":
      return "#10B981";
    default:
      return "#9CA3AF";
  }
}
