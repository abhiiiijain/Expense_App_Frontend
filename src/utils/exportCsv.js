function downloadCsv(filename, rows) {
  const escape = (value) => {
    const str = value == null ? "" : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csv = rows.map((row) => row.map(escape).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
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
  accounts = [],
  monthLabel,
}) {
  const accountName = Object.fromEntries(
    accounts.map((a) => [String(a.id), a.name])
  );

  const header = ["Type", "Date", "Title", "Category", "Subcategory", "Amount", "Account"];
  const mapRow = (type, tx) => [
    type,
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

  const rows = [
    header,
    ...expenses.map((tx) => mapRow("expense", tx)),
    ...incomes.map((tx) => mapRow("income", tx)),
    ...transfers.map(mapTransfer),
  ];

  const stamp = (monthLabel || "export").replace(/\s+/g, "-").toLowerCase();
  downloadCsv(`spendwise-${stamp}.csv`, rows);
}
