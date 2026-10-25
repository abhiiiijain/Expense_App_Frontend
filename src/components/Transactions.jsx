import { memo, useEffect, useMemo, useState } from "react";
import { searchTransactions } from "../api/transactions";
import { useAppConfig } from "../config/AppConfigContext";
import {
  formatRelativeDateLabel,
  groupTransactionsByDate,
  isTransactionEditable,
  transactionDate,
} from "../utils/dateHelpers";
import { formatCurrency, formatLedgerAmount } from "../utils/formatCurrency";
import ConfirmModal from "./ConfirmModal";
import EmptyState from "./EmptyState";
import {
  AccountBadge,
  AccountTotalsBar,
} from "./AccountBreakdown";
import { useAccountExpenseTotals } from "../hooks/useAccountExpenseTotals";
import { filterByCategory } from "../utils/filterTransactions";
import { cardPaymentRoute, isCardPaymentExpense } from "../utils/creditCardPayments";
import { withStatementBalances } from "../utils/statementActivity";

function FilterChips({ options, selected, onSelect, onClear, activeClass, inactiveClass }) {
  return (
    <div className="mb-3 flex flex-wrap gap-1.5">
      {onClear ? (
        <button
          type="button"
          className="text-xs font-medium px-2.5 py-1 rounded-lg transition border bg-[var(--sw-panel)] text-ink-muted border-ink/10 hover:text-ink hover:bg-[var(--sw-muted-bg)]"
          onClick={onClear}
        >
          Clear
        </button>
      ) : null}
      {options.map((option) => {
        const active = selected === option;
        return (
          <button
            key={option}
            type="button"
            className={`${active ? activeClass : inactiveClass} text-xs font-medium px-2.5 py-1 rounded-lg transition border`}
            onClick={() => onSelect(active && option !== "All" ? "All" : option)}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function amountTone(amount, signed, fallback = "text-sage-700 dark:text-blue-300") {
  if (!signed || amount === 0) return fallback;
  return amount > 0
    ? "text-emerald-700 dark:text-emerald-400"
    : "text-rose-700 dark:text-rose-400";
}

function AmountStack({ amount, signed, ledger, balanceAfter }) {
  const showLedger = ledger && signed;
  return (
    <>
      <div className={`font-bold tabular-nums text-sm whitespace-nowrap ${amountTone(amount, signed)}`}>
        {showLedger ? formatLedgerAmount(amount) : formatCurrency(amount, { signed })}
      </div>
      {typeof balanceAfter === "number" && (
        <div className="text-[10px] text-ink-muted tabular-nums leading-none">
          Bal {ledger ? formatLedgerAmount(balanceAfter) : formatCurrency(balanceAfter)}
        </div>
      )}
    </>
  );
}

function RowShell({ icon, title, subtitle, extra, amount, signed, ledger, balanceAfter, actions }) {
  return (
    <div className="group relative flex items-start gap-3 rounded-xl px-2.5 py-2.5 transition hover:bg-[var(--sw-muted-bg)]">
      <div
        className="flex items-center justify-center w-10 h-10 rounded-xl text-base shrink-0 mt-0.5"
        style={{
          background: "var(--sw-muted-bg)",
          border: "1px solid var(--sw-border)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1 pr-1">
        <div className="font-semibold text-ink text-sm leading-snug line-clamp-2">{title}</div>
        {subtitle ? <div className="text-ink-muted text-xs mt-0.5 truncate">{subtitle}</div> : null}
        {extra}
      </div>
      <div className="shrink-0 flex flex-col items-end gap-1 pt-0.5">
        <AmountStack amount={amount} signed={signed} ledger={ledger} balanceAfter={balanceAfter} />
        {actions}
      </div>
    </div>
  );
}

function RowActions({ canModify, onEdit, onDelete, editLabel, deleteLabel }) {
  if (!canModify) return null;
  return (
    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 focus-within:opacity-100 transition">
      {onEdit && (
        <button
          type="button"
          title={editLabel}
          aria-label={editLabel}
          className="w-7 h-7 rounded-md text-ink-muted hover:text-sage-700 hover:bg-[var(--sw-muted-bg)] dark:hover:text-blue-200 text-xs transition"
          onClick={onEdit}
        >
          ✎
        </button>
      )}
      {onDelete && (
        <button
          type="button"
          title={deleteLabel}
          aria-label={deleteLabel}
          className="w-7 h-7 rounded-md text-ink-muted hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-500/15 dark:hover:text-rose-300 text-xs transition"
          onClick={onDelete}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function TransactionRow({
  transaction,
  type,
  onEdit,
  onDelete,
  editWindowMs,
  accountName,
  showAccountBadge,
  balanceAfter,
  ledger = false,
}) {
  const isIncome = type === "income";
  const canModify = isTransactionEditable(transaction.createdAt, editWindowMs);
  const subtitle =
    transaction.title === transaction.subcategory
      ? transaction.category
      : transaction.subcategory;
  const showSubtitle = subtitle && subtitle !== transaction.title;
  const signedAmount = isIncome ? transaction.amount : -Math.abs(transaction.amount);

  return (
    <RowShell
      icon={transaction.icon}
      title={transaction.title}
      subtitle={showSubtitle ? subtitle : null}
      extra={
        showAccountBadge && accountName ? (
          <div className="mt-1">
            <AccountBadge name={accountName} />
          </div>
        ) : null
      }
      amount={signedAmount}
      signed
      ledger={ledger}
      balanceAfter={balanceAfter}
      actions={
        <RowActions
          canModify={canModify}
          onEdit={onEdit ? () => onEdit(transaction) : undefined}
          onDelete={onDelete ? () => onDelete(transaction) : undefined}
          editLabel={`Edit ${type}`}
          deleteLabel={`Delete ${type}`}
        />
      }
    />
  );
}

function TransferRow({
  transfer,
  accountNameById,
  onDelete,
  onEdit,
  editWindowMs,
  fromName,
  toName,
  note,
  icon = "🔁",
  hint = "Account transfer · not income or spending",
  deleteLabel = "Delete transfer",
  editLabel = "Edit card payment",
  signedAmount,
  balanceAfter,
  ledger = false,
}) {
  const canModify = isTransactionEditable(transfer.createdAt, editWindowMs);
  const from = fromName || accountNameById[String(transfer.fromAccountId)] || "Account";
  const to = toName || accountNameById[String(transfer.toAccountId)] || "Account";
  const signed = typeof signedAmount === "number" && signedAmount !== 0;
  const displayAmount = signed ? signedAmount : transfer.amount;

  return (
    <RowShell
      icon={icon}
      title={`${from} → ${to}`}
      subtitle={note || transfer.note?.trim() || hint}
      amount={displayAmount}
      signed={signed}
      ledger={ledger}
      balanceAfter={balanceAfter}
      actions={
        <RowActions
          canModify={canModify}
          onEdit={onEdit ? () => onEdit(transfer) : undefined}
          onDelete={onDelete ? () => onDelete(transfer) : undefined}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
        />
      }
    />
  );
}

function CardPaymentRow({
  payment,
  accounts,
  accountNameById,
  onDelete,
  onEdit,
  editWindowMs,
  signedAmount,
  balanceAfter,
  ledger = false,
}) {
  const route = cardPaymentRoute(payment, accounts);
  return (
    <TransferRow
      transfer={payment}
      accountNameById={accountNameById}
      fromName={route.fromName}
      toName={route.toName}
      note={payment.title}
      icon={payment.icon || "💳"}
      hint="Card bill payment · not extra spending"
      deleteLabel="Delete card payment"
      editWindowMs={editWindowMs}
      signedAmount={signedAmount}
      balanceAfter={balanceAfter}
      ledger={ledger}
      onEdit={onEdit}
      onDelete={onDelete}
    />
  );
}

function withKind(rows, kind) {
  return rows.map((tx) => ({ ...tx, _activityKind: kind }));
}

function ActivityRow({
  row,
  accounts,
  accountNameById,
  editWindowMs,
  showAccountBadge,
  onEditExpense,
  onEditIncome,
  onRequestDelete,
  ledger = false,
}) {
  const kind = row._activityKind;
  if (kind === "transfer") {
    return (
      <TransferRow
        transfer={row}
        accountNameById={accountNameById}
        editWindowMs={editWindowMs}
        signedAmount={ledger ? row._statementDelta : undefined}
        balanceAfter={row._balanceAfter}
        ledger={ledger}
        onDelete={(item) => onRequestDelete(item, "transfer")}
      />
    );
  }
  if (kind === "cardPayment") {
    return (
      <CardPaymentRow
        payment={row}
        accounts={accounts}
        accountNameById={accountNameById}
        editWindowMs={editWindowMs}
        signedAmount={ledger ? row._statementDelta : undefined}
        balanceAfter={row._balanceAfter}
        ledger={ledger}
        onEdit={onEditExpense}
        onDelete={(item) => onRequestDelete(item, "cardPayment")}
      />
    );
  }
  return (
    <TransactionRow
      transaction={row}
      type={kind}
      onEdit={kind === "income" ? onEditIncome : onEditExpense}
      onDelete={(item) => onRequestDelete(item, kind)}
      editWindowMs={editWindowMs}
      showAccountBadge={showAccountBadge}
      accountName={accountNameById[String(row.accountId)]}
      balanceAfter={row._balanceAfter}
      ledger={ledger}
    />
  );
}

function LedgerLine({ label, amount, hide = false }) {
  if (hide) return null;
  return (
    <div className="flex items-center justify-between gap-2 px-2.5 py-2 shrink-0">
      <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        {label}
      </span>
      <span className={`text-sm font-semibold tabular-nums ${amountTone(amount, true)}`}>
        {formatLedgerAmount(amount)}
      </span>
    </div>
  );
}

function DateGroups({ grouped, emptyTitle, emptyDescription, renderRow, dateMeta }) {
  const dates = Object.keys(grouped);
  if (dates.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} compact />;
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto space-y-4">
      {dates.map((date) => {
        const rows = grouped[date];
        const meta = dateMeta?.(date, rows);
        return (
        <section key={date}>
          <h4
              className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted mb-1.5 px-2.5 sticky top-0 z-[1] py-1.5 backdrop-blur-sm"
            style={{ background: "color-mix(in srgb, var(--sw-panel) 92%, transparent)" }}
          >
              <span>{formatRelativeDateLabel(transactionDate(rows[0]))}</span>
              {meta ? <span className="font-medium normal-case tracking-normal">{meta}</span> : null}
          </h4>
            <div className="space-y-0.5">{rows.map(renderRow)}</div>
        </section>
        );
      })}
    </div>
  );
}

const Transactions = ({
  expenses = [],
  incomes = [],
  transfers = [],
  cardPayments = [],
  accounts = [],
  accountFilter = "all",
  expenseCategory = "All",
  expenseSubcategory = "All",
  onExpenseCategoryChange,
  onExpenseSubcategoryChange,
  onEditExpense,
  onEditIncome,
  onDeleteExpense,
  onDeleteIncome,
  onDeleteTransfer,
  monthStartOpening,
  statementOpening,
  monthEndBalance,
  isCredit = false,
}) => {
  const [tab, setTab] = useState("statement");
  const [search, setSearch] = useState("");
  const [searchHits, setSearchHits] = useState(null);
  const [selectedIncomeMainCategory, setSelectedIncomeMainCategory] = useState("All");
  const [selectedIncomeSubcategory, setSelectedIncomeSubcategory] = useState("All");
  const [pendingDelete, setPendingDelete] = useState(null);
  const {
    editWindowMs,
    expenseFilterCategories,
    expenseSubcategories,
    incomeFilterCategories,
    incomeSubcategories,
  } = useAppConfig();

  const accountNameById = useMemo(
    () => Object.fromEntries(accounts.map((a) => [String(a.id), a.name])),
    [accounts]
  );

  const showAccountBreakdown = accountFilter === "all" && accounts.length > 1;
  const searching = Boolean(search.trim());

  useEffect(() => {
    const query = search.trim();
    if (!query) {
      setSearchHits(null);
      return undefined;
    }
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await searchTransactions(query);
        if (!cancelled) setSearchHits(data);
      } catch (_error) {
        if (!cancelled) setSearchHits({ expenses: [], incomes: [], transfers: [] });
      }
    }, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [search]);

  const filteredExpenses = useMemo(() => {
    if (searching) {
      return withKind(
        (searchHits?.expenses || []).filter((tx) => !isCardPaymentExpense(tx)),
        "expense"
      );
    }
    if (tab === "statement") return withKind(expenses, "expense");
    if (tab !== "expense") return [];
    return withKind(filterByCategory(expenses, expenseCategory, expenseSubcategory), "expense");
  }, [searching, tab, expenses, searchHits, expenseCategory, expenseSubcategory]);

  const filteredIncomes = useMemo(() => {
    if (searching) {
      return withKind(searchHits?.incomes || [], "income");
    }
    if (tab === "statement") return withKind(incomes, "income");
    if (tab !== "income") return [];
    return withKind(
      filterByCategory(incomes, selectedIncomeMainCategory, selectedIncomeSubcategory),
      "income"
    );
  }, [searching, tab, incomes, searchHits, selectedIncomeMainCategory, selectedIncomeSubcategory]);

  const filteredTransfers = useMemo(() => {
    if (searching) return withKind(searchHits?.transfers || [], "transfer");
    if (tab !== "transfer" && tab !== "statement") return [];
    return withKind(transfers, "transfer");
  }, [searching, tab, transfers, searchHits]);

  const filteredCardPayments = useMemo(() => {
    if (searching) {
      return withKind((searchHits?.expenses || []).filter(isCardPaymentExpense), "cardPayment");
    }
    if (tab !== "transfer" && tab !== "statement") return [];
    return withKind(cardPayments, "cardPayment");
  }, [searching, tab, cardPayments, searchHits]);

  const searchResults = useMemo(() => {
    if (!searching) return [];
    return [
      ...filteredExpenses,
      ...filteredIncomes,
      ...filteredTransfers,
      ...filteredCardPayments,
    ];
  }, [
    searching,
    filteredExpenses,
    filteredIncomes,
    filteredTransfers,
    filteredCardPayments,
  ]);

  const moveRows = useMemo(
    () => [...filteredTransfers, ...filteredCardPayments],
    [filteredCardPayments, filteredTransfers]
  );

  const statementRows = useMemo(() => {
    if (searching || tab !== "statement") return [];
    return withStatementBalances(
      [...filteredExpenses, ...filteredIncomes, ...filteredTransfers, ...filteredCardPayments],
      statementOpening ?? monthStartOpening,
      accountFilter,
      accounts
    );
  }, [
    accountFilter,
    accounts,
    filteredCardPayments,
    filteredExpenses,
    filteredIncomes,
    filteredTransfers,
    monthStartOpening,
    searching,
    statementOpening,
    tab,
  ]);

  const expenseTotalsByAccount = useAccountExpenseTotals(
    filteredExpenses,
    accounts,
    accountFilter,
    showAccountBreakdown && !searching && tab === "expense"
  );

  const incomeTotalsByAccount = useAccountExpenseTotals(
    filteredIncomes,
    accounts,
    accountFilter,
    showAccountBreakdown && !searching && tab === "income"
  );

  const groupedExpenses = useMemo(
    () => (!searching && tab === "expense" ? groupTransactionsByDate(filteredExpenses) : {}),
    [searching, tab, filteredExpenses]
  );

  const groupedIncomes = useMemo(
    () => (!searching && tab === "income" ? groupTransactionsByDate(filteredIncomes) : {}),
    [searching, tab, filteredIncomes]
  );

  const groupedTransfers = useMemo(
    () => (!searching && tab === "transfer" ? groupTransactionsByDate(moveRows) : {}),
    [searching, tab, moveRows]
  );

  const groupedStatement = useMemo(
    () =>
      !searching && tab === "statement"
        ? groupTransactionsByDate(statementRows, { oldestFirst: true })
        : {},
    [searching, tab, statementRows]
  );

  const groupedSearchResults = useMemo(
    () => (searching ? groupTransactionsByDate(searchResults) : {}),
    [searching, searchResults]
  );

  const isStatement = tab === "statement";
  const isExpense = tab === "expense";
  const isIncome = tab === "income";
  const isTransfer = tab === "transfer";
  const statementCount =
    expenses.length + incomes.length + transfers.length + cardPayments.length;
  const selectedMain = isExpense ? expenseCategory : selectedIncomeMainCategory;
  const selectedSub = isExpense ? expenseSubcategory : selectedIncomeSubcategory;
  const filterCategories = isExpense ? expenseFilterCategories : incomeFilterCategories;
  const subOptions = isExpense
    ? ["All", ...(expenseSubcategories[expenseCategory] || [])]
    : ["All", ...(incomeSubcategories[selectedIncomeMainCategory] || [])];
  const categoryFiltered = selectedMain !== "All";

  const clearCategoryFilter = () => {
    if (isExpense) {
      onExpenseCategoryChange?.("All");
      return;
    }
    setSelectedIncomeMainCategory("All");
    setSelectedIncomeSubcategory("All");
  };

  const requestDelete = (transaction, type) => {
    let title = transaction.title;
    if (type === "transfer") {
      title = `${accountNameById[String(transaction.fromAccountId)] || "From"} → ${
              accountNameById[String(transaction.toAccountId)] || "To"
      }`;
    } else if (type === "cardPayment") {
      const route = cardPaymentRoute(transaction, accounts);
      title = `${route.fromName} → ${route.toName}`;
    }
    setPendingDelete({ id: transaction._id, type, title });
  };

  const renderActivity = (row, { showBadge, ledger } = {}) => (
    <ActivityRow
      key={`${row._activityKind}-${row._id}`}
      row={row}
      accounts={accounts}
      accountNameById={accountNameById}
      editWindowMs={editWindowMs}
      showAccountBadge={showBadge}
      onEditExpense={onEditExpense}
      onEditIncome={onEditIncome}
      onRequestDelete={requestDelete}
      ledger={ledger}
    />
  );

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return;
    const { id, type } = pendingDelete;
    if (type === "income") await onDeleteIncome?.(id);
    else if (type === "transfer") await onDeleteTransfer?.(id);
    else await onDeleteExpense?.(id);
    setPendingDelete(null);
  };

  return (
    <div className="sw-panel p-5 sm:p-6 w-full h-full min-h-[28rem] xl:min-h-0 flex flex-col overflow-hidden">
      <div className="mb-3 shrink-0">
        <h3 className="font-display text-lg font-semibold text-ink">Activity</h3>
      </div>

      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-1 p-1 rounded-xl mb-3 shrink-0"
        style={{ background: "var(--sw-muted-bg)" }}
        role="tablist"
      >
        <button
          type="button"
          role="tab"
          aria-selected={isStatement}
          onClick={() => setTab("statement")}
          className={`sw-segment-btn px-2 text-[13px] sm:text-sm ${
            isStatement ? "is-active text-ink" : ""
          }`}
        >
          Statement
          <span className="ml-1 hidden sm:inline text-xs font-medium opacity-70">{statementCount}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isExpense}
          onClick={() => setTab("expense")}
          className={`sw-segment-btn px-2 text-[13px] sm:text-sm ${isExpense ? "is-active text-rose-700 dark:text-rose-300" : ""}`}
        >
          Expenses
          <span className="ml-1 hidden sm:inline text-xs font-medium opacity-70">{expenses.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isIncome}
          onClick={() => setTab("income")}
          className={`sw-segment-btn px-2 text-[13px] sm:text-sm ${isIncome ? "is-active text-emerald-700 dark:text-emerald-300" : ""}`}
        >
          Income
          <span className="ml-1 hidden sm:inline text-xs font-medium opacity-70">{incomes.length}</span>
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={isTransfer}
          onClick={() => setTab("transfer")}
          className={`sw-segment-btn px-2 text-[13px] sm:text-sm ${isTransfer ? "is-active text-sage-700 dark:text-blue-300" : ""}`}
        >
          Transfers
          <span className="ml-1 hidden sm:inline text-xs font-medium opacity-70">
            {transfers.length + cardPayments.length}
          </span>
        </button>
      </div>

      <div className="mb-3 shrink-0">
        <label className="sr-only" htmlFor="activity-search">
          Search transactions
        </label>
        <input
          id="activity-search"
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search title, category, account, or amount…"
          className="sw-input py-2 text-sm mb-2"
        />
        {searching ? (
          <p className="text-xs text-ink-muted px-0.5">
            Searching expenses, income, transfers, and card payments across all accounts
          </p>
        ) : isStatement ? null : !isTransfer ? (
          <>
            <label className="sr-only" htmlFor="activity-category-filter">
              Filter by category
            </label>
            <div className="relative">
            <select
              id="activity-category-filter"
              value={selectedMain}
              onChange={(e) => {
                const value = e.target.value;
                if (isExpense) {
                    onExpenseCategoryChange?.(value);
                } else {
                  setSelectedIncomeMainCategory(value);
                  setSelectedIncomeSubcategory("All");
                }
              }}
                className={`sw-input py-2 text-sm appearance-none bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat ${
                  categoryFiltered ? "pr-16" : "pr-9"
                } ${
                isExpense
                  ? "border-rose-200 text-rose-800 focus:ring-rose-500/25 focus:border-rose-500 dark:border-rose-500/30 dark:text-rose-300"
                  : "border-emerald-200 text-emerald-800 focus:ring-emerald-500/25 focus:border-emerald-500 dark:border-emerald-500/30 dark:text-emerald-300"
              }`}
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E\")",
              }}
            >
              {filterCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
              {categoryFiltered ? (
                <button
                  type="button"
                  className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-md text-ink-muted hover:text-ink hover:bg-[var(--sw-muted-bg)] text-sm leading-none"
                  aria-label="Clear category filter"
                  title="Clear filter"
                  onClick={clearCategoryFilter}
                >
                  ✕
                </button>
              ) : null}
            </div>
          </>
        ) : null}
      </div>

      {!searching && !isTransfer && !isStatement && selectedMain !== "All" && (
        <div className="shrink-0">
          <FilterChips
            options={subOptions}
            selected={selectedSub}
            onSelect={isExpense ? onExpenseSubcategoryChange : setSelectedIncomeSubcategory}
            onClear={clearCategoryFilter}
            activeClass={
              isExpense
                ? "bg-rose-700 text-white border-rose-700"
                : "bg-emerald-700 text-white border-emerald-700"
            }
            inactiveClass={
              isExpense
                ? "bg-white text-rose-700 border-rose-200 hover:bg-rose-50 dark:bg-transparent dark:text-rose-300 dark:border-rose-500/30 dark:hover:bg-rose-500/10"
                : "bg-white text-emerald-700 border-emerald-200 hover:bg-emerald-50 dark:bg-transparent dark:text-emerald-300 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10"
            }
          />
        </div>
      )}

      {!searching && showAccountBreakdown && isExpense && (
        <AccountTotalsBar totals={expenseTotalsByAccount} tone="expense" />
      )}
      {!searching && showAccountBreakdown && isIncome && (
        <AccountTotalsBar totals={incomeTotalsByAccount} tone="income" />
      )}

      {searching ? (
        <DateGroups
          grouped={groupedSearchResults}
          emptyTitle="No matching activity"
          emptyDescription="Try a title, category, account, or amount"
          renderRow={(row) => renderActivity(row, { showBadge: accounts.length > 1 })}
        />
      ) : isStatement ? (
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
          <LedgerLine
            label="Opening"
            amount={monthStartOpening}
            hide={isCredit && Math.abs(monthStartOpening || 0) < 0.005}
          />
          <DateGroups
            grouped={groupedStatement}
            emptyTitle="No activity this month"
            emptyDescription="Expenses, income, transfers, and card payments will appear here together"
            dateMeta={(_date, rows) => {
              if (rows.length < 2) return null;
              const net = rows.reduce((sum, row) => sum + (row._statementDelta || 0), 0);
              if (net === 0) return null;
              return (
                <span className={amountTone(net, true)}>{formatLedgerAmount(net)}</span>
              );
            }}
            renderRow={(row) =>
              renderActivity(row, { showBadge: showAccountBreakdown, ledger: true })
            }
          />
          {statementRows.length > 0 && (
            <LedgerLine
              label={isCredit && monthEndBalance < 0 ? "Closing due" : "Closing"}
              amount={monthEndBalance}
            />
          )}
                </div>
      ) : isTransfer ? (
        <DateGroups
          grouped={groupedTransfers}
          emptyTitle="No transfers or card payments yet"
          emptyDescription="Transfers move money between accounts. Card bill payments settle Flipkart CC without extra spending."
          renderRow={(row) => renderActivity(row, { showBadge: false })}
        />
      ) : (
        <DateGroups
          grouped={isExpense ? groupedExpenses : groupedIncomes}
          emptyTitle={isExpense ? "No expenses yet" : "No income yet"}
          emptyDescription={
            isExpense
              ? "Tap + to record your first expense"
              : "Tap + to record your first income"
          }
          renderRow={(row) => renderActivity(row, { showBadge: showAccountBreakdown })}
        />
      )}

      <ConfirmModal
        open={Boolean(pendingDelete)}
        title={`Delete this ${
          pendingDelete?.type === "cardPayment" ? "card payment" : pendingDelete?.type || "item"
        }?`}
        description={
          pendingDelete?.title
            ? `"${pendingDelete.title}" will be removed permanently.`
            : "This will be removed permanently."
        }
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onCancel={() => setPendingDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

export default memo(Transactions);
