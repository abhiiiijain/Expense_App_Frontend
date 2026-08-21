/** Everyday personal-finance categories (frontend). Keep in sync with backend/utils/validation.js */

export const EXPENSE_CATEGORIES = [
  { name: "Food & Groceries", color: "#F59E0B", hoverColor: "#D97706" },
  { name: "Transport", color: "#3B82F6", hoverColor: "#2563EB" },
  { name: "Housing", color: "#8B5CF6", hoverColor: "#7C3AED" },
  { name: "Bills & Utilities", color: "#06B6D4", hoverColor: "#0891B2" },
  { name: "Shopping", color: "#EC4899", hoverColor: "#DB2777" },
  { name: "Health", color: "#10B981", hoverColor: "#059669" },
  { name: "Entertainment", color: "#F97316", hoverColor: "#EA580C" },
  { name: "Education & Work", color: "#6366F1", hoverColor: "#4F46E5" },
  { name: "Personal", color: "#14B8A6", hoverColor: "#0D9488" },
  { name: "Finance", color: "#EF4444", hoverColor: "#DC2626" },
  { name: "Family & Social", color: "#A855F7", hoverColor: "#9333EA" },
  { name: "Savings & Investments", color: "#22C55E", hoverColor: "#16A34A" },
  { name: "Other", color: "#9CA3AF", hoverColor: "#6B7280" },
];

export const EXPENSE_CATEGORY_NAMES = EXPENSE_CATEGORIES.map((category) => category.name);

const CATEGORY_COLOR_BY_NAME = Object.fromEntries(
  EXPENSE_CATEGORIES.map((category) => [category.name, category.color])
);

export function getCategoryColor(category) {
  return CATEGORY_COLOR_BY_NAME[category] ?? "#9CA3AF";
}

export const EXPENSE_SUBCATEGORIES = {
  "Food & Groceries": ["Groceries", "Restaurants", "Cafe & Snacks", "Food Delivery", "Milk & Dairy"],
  Transport: ["Fuel", "Cab & Auto", "Public Transit", "Parking", "Vehicle Maintenance"],
  Housing: ["Rent", "Home Maintenance", "Household Items"],
  "Bills & Utilities": ["Electricity", "Internet", "Mobile Recharge", "Water & Gas", "DTH & Cable"],
  Shopping: ["Clothes", "Electronics", "Online Shopping", "Home & Decor"],
  Health: ["Medicines", "Doctor & Clinic", "Fitness", "Insurance (Health)"],
  Entertainment: ["Movies & Events", "Subscriptions", "Games", "Outing"],
  "Education & Work": ["Courses", "Books", "Software & Tools", "Office / Co-working"],
  Personal: ["Salon & Grooming", "Personal Care", "Laundry"],
  Finance: ["Credit Card Payment", "EMI / Loan", "Bank Charges", "Insurance (Life/Other)"],
  "Family & Social": ["Gifts", "Donations", "Family Support"],
  "Savings & Investments": ["Savings Transfer", "Mutual Funds", "Stocks", "Fixed Deposit"],
  Other: ["Miscellaneous", "Petty Cash", "Uncategorized"],
};

export const EXPENSE_FILTER_CATEGORIES = ["All", ...EXPENSE_CATEGORY_NAMES];

export const INCOME_CATEGORY_NAMES = [
  "Salary",
  "Business & Freelance",
  "Investments",
  "Refunds & Cashback",
  "Gifts & Transfers",
  "Other Income",
];

export const INCOME_SUBCATEGORIES = {
  Salary: ["Monthly Salary", "Bonus", "Overtime"],
  "Business & Freelance": ["Freelance", "Client Payment", "Business Income"],
  Investments: ["Dividends", "Interest", "Capital Gains"],
  "Refunds & Cashback": ["Refund", "Cashback", "Reimbursement"],
  "Gifts & Transfers": ["Gift Received", "Family Transfer"],
  "Other Income": ["Rental Income", "Other"],
};

export const INCOME_FILTER_CATEGORIES = ["All", ...INCOME_CATEGORY_NAMES];

export const SUBCATEGORY_ICONS = {
  Groceries: "🛒",
  Restaurants: "🍽️",
  "Cafe & Snacks": "☕",
  "Food Delivery": "🛵",
  "Milk & Dairy": "🥛",
  Fuel: "⛽",
  "Cab & Auto": "🚕",
  "Public Transit": "🚌",
  Parking: "🅿️",
  "Vehicle Maintenance": "🔧",
  Rent: "🏠",
  "Home Maintenance": "🛠️",
  "Household Items": "🧹",
  Electricity: "💡",
  Internet: "📶",
  "Mobile Recharge": "📱",
  "Water & Gas": "🚿",
  "DTH & Cable": "📺",
  Clothes: "👕",
  Electronics: "💻",
  "Online Shopping": "📦",
  "Home & Decor": "🛋️",
  Medicines: "💊",
  "Doctor & Clinic": "🩺",
  Fitness: "🏋️",
  "Insurance (Health)": "🏥",
  "Movies & Events": "🎬",
  Subscriptions: "📺",
  Games: "🎮",
  Outing: "🎉",
  Courses: "📚",
  Books: "📖",
  "Software & Tools": "🧠",
  "Office / Co-working": "🏢",
  "Salon & Grooming": "💇",
  "Personal Care": "🧴",
  Laundry: "👔",
  "Credit Card Payment": "💳",
  "EMI / Loan": "🏦",
  "Bank Charges": "🏧",
  "Insurance (Life/Other)": "📄",
  Gifts: "🎁",
  Donations: "🤝",
  "Family Support": "👨‍👩‍👧",
  "Savings Transfer": "💰",
  "Mutual Funds": "📈",
  Stocks: "📊",
  "Fixed Deposit": "🔒",
  Miscellaneous: "🗂️",
  "Petty Cash": "🪙",
  Uncategorized: "❓",
  "Monthly Salary": "💼",
  Bonus: "💲",
  Overtime: "⏰",
  Freelance: "🧑‍💻",
  "Client Payment": "🤝",
  "Business Income": "🏪",
  Dividends: "🧾",
  Interest: "💹",
  "Capital Gains": "📉",
  Refund: "🔁",
  Cashback: "💸",
  Reimbursement: "🔙",
  "Gift Received": "🎀",
  "Family Transfer": "↔️",
  "Rental Income": "🏡",
  Other: "🔖",
};
