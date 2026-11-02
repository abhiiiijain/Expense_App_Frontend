import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { createAccount, deleteAccount, updateAccount } from "../api/accounts";
import { formatCurrency } from "../utils/formatCurrency";
import { formatAmountInput, sanitizeAmountInput, roundMoney } from "../utils/sanitizeAmount";
import { creditCycleForAccount, formatMonthDayOrdinal } from "../utils/dateHelpers";
import { toast } from "react-toastify";

const MONTH_DAYS = Array.from({ length: 28 }, (_, index) => index + 1);

function DaySelect({ label, value, onChange, required = false }) {
  return (
    <label className="block min-w-0">
      <span className="sw-label">{label}</span>
      <select
        className="sw-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      >
        <option value="">{required ? "Select day" : "—"}</option>
        {MONTH_DAYS.map((day) => (
          <option key={day} value={day}>
            {formatMonthDayOrdinal(day)}
          </option>
        ))}
      </select>
    </label>
  );
}

function dueDayHint(statementDay, dueDay) {
  const statement = Number(statementDay);
  const due = Number(dueDay);
  if (!statement || !due) return "Due is the same month as the statement if it falls after the bill day; otherwise the next month.";
  if (due > statement) return "Due is the same calendar month as the statement.";
  return "Due is the next calendar month after the statement.";
}

function AccountEditor({ account, onChanged, onSetDefault, onRemove }) {
  const cycle = creditCycleForAccount(account);
  const isCredit = account.type === "credit";
  const [name, setName] = useState(account.name);
  const [opening, setOpening] = useState(
    formatAmountInput(isCredit ? 0 : account.openingBalance || 0)
  );
  const [due, setDue] = useState(
    isCredit && (account.openingBalance || 0) < 0
      ? formatAmountInput(-(account.openingBalance || 0))
      : ""
  );
  const [limit, setLimit] = useState(
    account.creditLimit != null ? formatAmountInput(account.creditLimit) : ""
  );
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(account.name);
    setOpening(formatAmountInput(isCredit ? 0 : account.openingBalance || 0));
    setDue(
      isCredit && (account.openingBalance || 0) < 0
        ? formatAmountInput(-(account.openingBalance || 0))
        : ""
    );
    setLimit(account.creditLimit != null ? formatAmountInput(account.creditLimit) : "");
  }, [account, isCredit]);

  const saveDetails = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Account name is required");
      return;
    }
    try {
      setSaving(true);
      const payload = { name: trimmed };
      if (isCredit) {
        payload.openingBalance = due === "" ? 0 : -Math.abs(roundMoney(due) || 0);
        payload.creditLimit = limit === "" ? null : roundMoney(limit);
      } else {
        payload.openingBalance = opening === "" ? 0 : roundMoney(opening);
      }
      await updateAccount(account.id, payload);
      toast.success("Account updated", { position: "top-center" });
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update account");
    } finally {
      setSaving(false);
    }
  };

  return (
    <li className="rounded-xl ring-1 ring-ink/5 px-3 py-2.5 space-y-2">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          <input
            className="sw-input"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-label="Account name"
          />
          <p className="text-xs text-ink-muted capitalize">
            {isCredit ? (
              <>
                credit ·{" "}
                {(account.balance || 0) < 0
                  ? `Due ${formatCurrency(-(account.balance || 0))}`
                  : `Credit ${formatCurrency(account.balance || 0)}`}
                {account.creditLimit ? ` · Limit ${formatCurrency(account.creditLimit)}` : ""}
                {cycle && (
                  <>
                    {" "}
                    · Statement {formatMonthDayOrdinal(cycle.statementDay)} · due{" "}
                    {formatMonthDayOrdinal(cycle.dueDay)}
                  </>
                )}
              </>
            ) : (
              <>
                {account.type} · Opening {formatCurrency(account.openingBalance || 0)} · Balance{" "}
                {formatCurrency(account.balance)}
              </>
            )}
            {account.isDefault && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-sage-700">
                Default
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!account.isDefault && (
            <>
              <button
                type="button"
                className="text-xs font-medium text-sage-700 px-2 py-1"
                onClick={() => onSetDefault(account.id)}
              >
                Make default
              </button>
              <button
                type="button"
                className="text-xs font-medium text-rose-700 px-2 py-1"
                onClick={() => onRemove(account)}
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {isCredit ? (
        <div className="grid grid-cols-2 gap-2">
          <label className="block min-w-0">
            <span className="sw-label">Current due</span>
            <input
              className="sw-input"
              inputMode="decimal"
              placeholder="0.00"
              value={due}
              onChange={(event) => setDue(sanitizeAmountInput(event.target.value))}
            />
          </label>
          <label className="block min-w-0">
            <span className="sw-label">Credit limit</span>
            <input
              className="sw-input"
              inputMode="decimal"
              placeholder="Optional"
              value={limit}
              onChange={(event) => setLimit(sanitizeAmountInput(event.target.value))}
            />
          </label>
          <DaySelect
            label="Statement day"
            value={cycle ? String(cycle.statementDay) : ""}
            onChange={(day) => cycle && onChanged && saveCycle(account, day, cycle.dueDay, onChanged)}
            required
          />
          <DaySelect
            label="Due day"
            value={cycle ? String(cycle.dueDay) : ""}
            onChange={(day) => cycle && saveCycle(account, cycle.statementDay, day, onChanged)}
            required
          />
        </div>
      ) : (
        <label className="block min-w-0">
          <span className="sw-label">Opening balance</span>
          <input
            className="sw-input"
            inputMode="decimal"
            value={opening}
            onChange={(event) => setOpening(sanitizeAmountInput(event.target.value))}
          />
        </label>
      )}

      <button
        type="button"
        className="text-xs font-semibold text-sage-700"
        disabled={saving}
        onClick={saveDetails}
      >
        {saving ? "Saving…" : "Save details"}
      </button>
    </li>
  );
}

async function saveCycle(account, nextStatementDay, nextDueDay, onChanged) {
  try {
    await updateAccount(account.id, {
      statementDay: Number(nextStatementDay),
      dueDay: Number(nextDueDay),
    });
    await onChanged?.();
  } catch (error) {
    toast.error(error?.response?.data?.message || "Could not update card cycle");
  }
}

function AccountsModal({ open, onClose, accounts, onChanged }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [opening, setOpening] = useState("");
  const [currentDue, setCurrentDue] = useState("");
  const [creditLimit, setCreditLimit] = useState("");
  const [statementDay, setStatementDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setType("bank");
      setOpening("");
      setCurrentDue("");
      setCreditLimit("");
      setStatementDay("");
      setDueDay("");
    }
  }, [open]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const isCredit = type === "credit";
      await createAccount({
        name,
        type,
        openingBalance: isCredit
          ? currentDue === ""
            ? 0
            : -Math.abs(roundMoney(currentDue) || 0)
          : opening === ""
            ? 0
            : roundMoney(opening),
        ...(isCredit
          ? {
              statementDay: Number(statementDay),
              dueDay: Number(dueDay),
              ...(creditLimit ? { creditLimit: roundMoney(creditLimit) } : {}),
            }
          : {}),
      });
      toast.success("Account added", { position: "top-center" });
      setName("");
      setOpening("");
      setCurrentDue("");
      setCreditLimit("");
      setStatementDay("");
      setDueDay("");
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not add account");
    } finally {
      setSaving(false);
    }
  };

  const setDefault = async (id) => {
    try {
      await updateAccount(id, { isDefault: true });
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update account");
    }
  };

  const remove = async (account) => {
    if (
      !window.confirm(
        `Delete ${account.name}? Transactions on this account stay, but you cannot add new ones here.`
      )
    ) {
      return;
    }
    try {
      await deleteAccount(account.id);
      toast.success("Account removed", { position: "top-center" });
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not delete account");
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={onClose}
      labelledBy="accounts-title"
      maxWidth="md"
      variant="sheet"
    >
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <h2 id="accounts-title" className="font-display text-lg font-semibold text-ink">
          Accounts
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          Track bank, cash, and credit cards. Credit limit is not available cash. New
          transactions use the default account.
        </p>
      </div>

      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <ul className="space-y-2">
          {accounts.map((account) => (
            <AccountEditor
              key={account.id}
              account={account}
              onChanged={onChanged}
              onSetDefault={setDefault}
              onRemove={remove}
            />
          ))}
        </ul>

        <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-ink/5">
          <p className="text-sm font-semibold text-ink">Add account</p>
          <input
            className="sw-input"
            placeholder="Name (e.g. Savings, Cash)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <select className="sw-input" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="bank">Bank</option>
            <option value="cash">Cash</option>
            <option value="credit">Credit card</option>
            <option value="other">Other</option>
          </select>
          {type === "credit" ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <DaySelect
                  label="Statement / bill day"
                  value={statementDay}
                  onChange={setStatementDay}
                  required
                />
                <DaySelect
                  label="Due day"
                  value={dueDay}
                  onChange={setDueDay}
                  required
                />
              </div>
              <p className="text-[11px] text-ink-muted">{dueDayHint(statementDay, dueDay)}</p>
              <input
                className="sw-input"
                placeholder="Current due (optional)"
                inputMode="decimal"
                value={currentDue}
                onChange={(e) => setCurrentDue(sanitizeAmountInput(e.target.value))}
              />
              <input
                className="sw-input"
                placeholder="Credit limit (optional, not cash)"
                inputMode="decimal"
                value={creditLimit}
                onChange={(e) => setCreditLimit(sanitizeAmountInput(e.target.value))}
              />
            </div>
          ) : (
            <input
              className="sw-input"
              placeholder="Opening balance"
              inputMode="decimal"
              value={opening}
              onChange={(e) => setOpening(sanitizeAmountInput(e.target.value))}
            />
          )}
          <button type="submit" disabled={saving} className="sw-btn-primary">
            {saving ? "Saving…" : "Add account"}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}

export default AccountsModal;
