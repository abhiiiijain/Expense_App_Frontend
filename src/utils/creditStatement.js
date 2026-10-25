import {
  formatChartDateLabel,
  formatDateKey,
  getCreditCycleBounds,
  transactionDate,
} from "./dateHelpers";
import {
  accountIdOf,
  isCardPaymentExpense,
  paymentSettlesCreditAccount,
} from "./creditCardPayments";

function inGraceWindow(dateInput, monthKey, cycle) {
  const { statement, due } = getCreditCycleBounds(monthKey, cycle);
  if (!statement || !due) return false;
  const key = formatDateKey(transactionDate(dateInput));
  return key >= formatDateKey(statement) && key <= formatDateKey(due);
}

/**
 * Payments from statement date through due date that settle this card.
 * If they cover the statement closing due, the bill is paid on the covering date.
 */
export function getCreditBillPaymentStatus({
  monthKey,
  closingBalance,
  expenses = [],
  transfers = [],
  creditAccount,
  creditAccounts = [],
  cycle,
}) {
  const due = closingBalance < 0 ? Math.abs(Number(closingBalance) || 0) : 0;
  if (due < 0.005) {
    return { due: 0, paid: 0, isPaid: false, paidOn: null, paidOnLabel: null, instalments: [] };
  }

  const creditId = accountIdOf(creditAccount);
  const payments = [];

  for (const tx of expenses) {
    if (!isCardPaymentExpense(tx)) continue;
    if (!paymentSettlesCreditAccount(tx, creditAccount, creditAccounts)) continue;
    if (!inGraceWindow(tx, monthKey, cycle)) continue;
    payments.push({ date: transactionDate(tx), amount: Number(tx.amount) || 0 });
  }

  for (const tx of transfers) {
    if (String(tx.toAccountId) !== creditId) continue;
    if (!inGraceWindow(tx, monthKey, cycle)) continue;
    payments.push({ date: transactionDate(tx), amount: Number(tx.amount) || 0 });
  }

  payments.sort((a, b) => a.date.getTime() - b.date.getTime());

  const instalments = [];
  let paid = 0;
  let paidOn = null;
  for (const payment of payments) {
    if (paid + 0.005 >= due) break;
    instalments.push({
      amount: payment.amount,
      date: payment.date,
      label: formatChartDateLabel(payment.date),
    });
    paid += payment.amount;
    if (paid + 0.005 >= due) paidOn = payment.date;
  }

  return {
    due,
    paid,
    isPaid: Boolean(paidOn),
    paidOn,
    paidOnLabel: paidOn ? formatChartDateLabel(paidOn) : null,
    instalments,
  };
}
