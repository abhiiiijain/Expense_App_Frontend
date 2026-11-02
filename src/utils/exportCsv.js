import { cardPaymentRoute, isCardPaymentExpense } from "./creditCardPayments";
import { isResaleIncome } from "./resaleSales";
import { isSpendRefund } from "./spendRefunds";

function downloadCsv(filename, rows) {
  const escape = (value) => {
    const str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function buildTransactionsCsv({
  expenses = [],
  incomes = [],
  transfers = [],
  cardPayments = [],
  accounts = [],
  monthLabel,
}) {
  const accountName = Object.fromEntries(
    accounts.map((a) => [String(a.id), a.name])
  );

  const header = ["Type", "Date", "Title", "Category", "Subcategory", "Amount", "Account"];
  const mapRow = (type, tx) => [
    isSpendRefund(tx) ? "Refund" : isResaleIncome(tx) ? "Resale" : type,
    tx.date || tx.createdAt,
    tx.title,
    tx.category,
    tx.subcategory,
    tx.amount,
    accountName[String(tx.accountId)] || tx.accountId || "",
  ];

  const mapTransfer = (tx) => [
    "transfer",
    tx.date || tx.createdAt,
    tx.note || "Account transfer",
    "",
    "",
    tx.amount,
    `${accountName[String(tx.fromAccountId)] || "From"} → ${
      accountName[String(tx.toAccountId)] || "To"
    }`,
  ];

  const mapCardPayment = (tx) => {
    const route = cardPaymentRoute(tx, accounts);
    return [
      "card payment",
      tx.date || tx.createdAt,
      tx.title,
      tx.category,
      tx.subcategory,
      tx.amount,
      `${route.fromName} → ${route.toName}`,
    ];
  };

  const consumption = expenses.filter((tx) => !isCardPaymentExpense(tx));

  const rows = [
    header,
    ...consumption.map((tx) => mapRow("expense", tx)),
    ...incomes.map((tx) => mapRow("income", tx)),
    ...transfers.map(mapTransfer),
    ...cardPayments.map(mapCardPayment),
  ];

  const stamp = (monthLabel || "export").replace(/\s+/g, "-").toLowerCase();
  downloadCsv(`spendwise-${stamp}.csv`, rows);
}
