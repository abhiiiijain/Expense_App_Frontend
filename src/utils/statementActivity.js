import { paymentSettlesCreditAccount } from "./creditCardPayments";
import { sortTransactionsNewestFirst } from "./dateHelpers";

function amountOf(row) {
  return Number(row?.amount) || 0;
}

function selectedId(accountFilter) {
  return accountFilter && accountFilter !== "all" ? String(accountFilter) : null;
}

function statementDelta(row, selected, selectedAccount, credits) {
  const kind = row?._activityKind;
  const amount = amountOf(row);

  if (kind === "income") return amount;
  if (kind === "expense") return -Math.abs(amount);

  if (kind === "transfer") {
    if (!selected) return 0;
    if (String(row.toAccountId) === selected) return amount;
    if (String(row.fromAccountId) === selected) return -Math.abs(amount);
    return 0;
  }

  if (kind === "cardPayment") {
    if (!selected) return 0;
    const paidFrom = String(row.accountId);
    const settlesSelected =
      selectedAccount?.type === "credit" &&
      paymentSettlesCreditAccount(row, selectedAccount, credits);

    if (paidFrom === selected && settlesSelected) return amount;
    if (paidFrom === selected) return -Math.abs(amount);
    if (settlesSelected) return amount;
    return 0;
  }

  return 0;
}

/** Oldest first, running balance after each row, starting from month opening. */
export function withStatementBalances(rows, monthStartOpening, accountFilter, accounts = []) {
  const oldestFirst = sortTransactionsNewestFirst(rows, { oldestFirst: true });
  const selected = selectedId(accountFilter);
  const credits = accounts.filter((account) => account.type === "credit");
  const selectedAccount = selected
    ? accounts.find((account) => String(account.id) === selected)
    : null;
  let running = Number(monthStartOpening) || 0;
  return oldestFirst.map((row) => {
    const delta = statementDelta(row, selected, selectedAccount, credits);
    running += delta;
    return { ...row, _statementDelta: delta, _balanceAfter: running };
  });
}
