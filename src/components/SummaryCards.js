import { useMonthlySummary } from "../hooks/useExpenseAnalytics";
import { formatCurrency } from "../utils/formatCurrency";

function SummaryCards({ expenses, incomes }) {
  const { totalIncome, totalExpense, balance } = useMonthlySummary(expenses, incomes);

  const cards = [
    {
      label: "Income",
      display: formatCurrency(totalIncome),
      color: "text-green-700",
      labelColor: "text-green-800/70",
      bg: "bg-green-50",
      ring: "ring-green-200/60",
      icon: "↑",
    },
    {
      label: "Expenses",
      display: formatCurrency(totalExpense),
      color: "text-red-700",
      labelColor: "text-red-800/70",
      bg: "bg-red-50",
      ring: "ring-red-200/60",
      icon: "↓",
    },
    {
      label: "Balance",
      display: formatCurrency(balance, { signed: true }),
      color: balance >= 0 ? "text-blue-700" : "text-orange-700",
      labelColor: balance >= 0 ? "text-blue-800/70" : "text-orange-800/70",
      bg: balance >= 0 ? "bg-blue-50" : "bg-orange-50",
      ring: balance >= 0 ? "ring-blue-200/60" : "ring-orange-200/60",
      icon: "=",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`${card.bg} ring-1 ${card.ring} rounded-2xl p-5 flex items-center gap-4`}
        >
          <div
            className={`w-11 h-11 rounded-xl bg-white shadow-sm flex items-center justify-center text-lg font-bold ${card.color}`}
          >
            {card.icon}
          </div>
          <div className="min-w-0">
            <div className={`text-xs font-semibold uppercase tracking-wide ${card.labelColor}`}>
              {card.label} · This month
            </div>
            <div className={`text-2xl font-extrabold tabular-nums ${card.color}`}>
              {card.display}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default SummaryCards;
