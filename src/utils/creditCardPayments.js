export const CARD_PAYMENT_SUBCATEGORY = "Credit Card Payment";
export const EXTERNAL_PAY_FROM = "__external__";

export function accountIdOf(account) {
  return String(account?.id || account?._id || "");
}

export function isCardPaymentExpense(expense) {
  return expense?.subcategory === CARD_PAYMENT_SUBCATEGORY;
}

export function suggestedCardPaymentTitle(creditAccount) {
  const name = String(creditAccount?.name || "").trim();
  if (/flipkart/i.test(name)) return "Flipkart CC payment";
  if (/sbi/i.test(name)) return "SBI CC payment";
  if (name) return `${name} payment`.slice(0, 50);
  return CARD_PAYMENT_SUBCATEGORY;
}

export function isCardPaymentOnCreditAccount(expense, accounts = []) {
  if (!isCardPaymentExpense(expense)) return false;
  const id = String(expense.accountId);
  return accounts.some((account) => account.type === "credit" && accountIdOf(account) === id);
}

export function filterCardPaymentsForAccount(expenses, accountFilter, accounts = []) {
  const payments = (expenses || []).filter(isCardPaymentExpense);
  if (accountFilter === "all") return payments;
  const selected = accounts.find((account) => String(account.id) === String(accountFilter));
  const credits = accounts.filter((account) => account.type === "credit");
  return payments.filter((tx) => {
    if (String(tx.accountId) === String(accountFilter)) return true;
    if (selected?.type === "credit") {
      return paymentSettlesCreditAccount(tx, selected, credits);
    }
    return false;
  });
}

export function cardPaymentRoute(expense, accounts = []) {
  const credits = accounts.filter((account) => account.type === "credit");
  const from = accounts.find((account) => String(account.id) === String(expense.accountId));
  const toward = credits.find((credit) =>
    paymentSettlesCreditAccount(expense, credit, credits)
  );
  const fromOutside = isCardPaymentOnCreditAccount(expense, accounts);
  return {
    fromName: fromOutside ? "Outside SpendWise" : from?.name || "Account",
    toName: toward?.name || "Credit card",
  };
}

/** All-accounts: outside settlements raise cash, unmatched bank card pays lower it, neither is Spent. */
export function cardPaymentSpendAdjustments(payments, accounts = []) {
  const credits = accounts.filter((account) => account.type === "credit");
  let outside = 0;
  let unmatched = 0;
  for (const tx of payments || []) {
    if (!isCardPaymentExpense(tx)) continue;
    const amount = Number(tx.amount) || 0;
    if (isCardPaymentOnCreditAccount(tx, accounts)) {
      outside += amount;
      continue;
    }
    const settlesTracked = credits.some((credit) =>
      paymentSettlesCreditAccount(tx, credit, credits)
    );
    if (!settlesTracked) unmatched += amount;
  }
  return { outside, unmatched };
}

function creditAccountMatchingTitle(expense, creditAccounts) {
  const title = String(expense?.title || "");
  if (/flipkart/i.test(title)) {
    return creditAccounts.find((account) => /flipkart/i.test(account?.name || ""));
  }
  if (/sbi\s*cc/i.test(title)) {
    return creditAccounts.find(
      (account) => account?.type === "credit" && /sbi/i.test(account?.name || "")
    );
  }
  return null;
}

export function paymentSettlesCreditAccount(expense, creditAccount, creditAccounts) {
  if (!isCardPaymentExpense(expense)) return false;
  const creditAccountId = accountIdOf(creditAccount);

  if (expense.settlesAccountId) {
    return String(expense.settlesAccountId) === creditAccountId;
  }

  if (String(expense.accountId) === creditAccountId) return true;

  const fromTitle = creditAccountMatchingTitle(expense, creditAccounts);
  if (fromTitle) return accountIdOf(fromTitle) === creditAccountId;

  return (
    creditAccounts.length === 1 &&
    accountIdOf(creditAccounts[0]) === creditAccountId &&
    String(expense.accountId) !== creditAccountId
  );
}
