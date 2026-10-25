import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { createAccount, deleteAccount, updateAccount } from "../api/accounts";
import { formatCurrency } from "../utils/formatCurrency";
import { sanitizeAmountInput, roundMoney } from "../utils/sanitizeAmount";
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

function AccountsModal({ open, onClose, accounts, onChanged }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [opening, setOpening] = useState("");
  const [statementDay, setStatementDay] = useState("");
  const [dueDay, setDueDay] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setType("bank");
      setOpening("");
      setStatementDay("");
      setDueDay("");
    }
  }, [open]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await createAccount({
        name,
        type,
        openingBalance: opening === "" ? 0 : roundMoney(opening),
        ...(type === "credit"
          ? { statementDay: Number(statementDay), dueDay: Number(dueDay) }
          : {}),
      });
      toast.success("Account added", { position: "top-center" });
      setName("");
      setOpening("");
      setStatementDay("");
      setDueDay("");
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not add account");
    } finally {
      setSaving(false);
    }
  };

  const saveCycle = async (account, nextStatementDay, nextDueDay) => {
    try {
      await updateAccount(account.id, {
        statementDay: Number(nextStatementDay),
        dueDay: Number(nextDueDay),
      });
      await onChanged?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not update card cycle");
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
          {accounts.map((account) => {
            const cycle = creditCycleForAccount(account);
            return (
            <li
              key={account.id}
              className="flex items-start justify-between gap-3 rounded-xl ring-1 ring-ink/5 px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-ink truncate">
                  {account.name}
                  {account.isDefault && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-sage-700">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted capitalize">
                  {account.type === "credit" ? (
                    <>
                      credit ·{" "}
                      {(account.balance || 0) < 0
                        ? `Due ${formatCurrency(-(account.balance || 0))}`
                        : `Credit ${formatCurrency(account.balance || 0)}`}
                      {cycle && (
                        <>
                          {" "}
                          · Statement {formatMonthDayOrdinal(cycle.statementDay)} · due{" "}
                          {formatMonthDayOrdinal(cycle.dueDay)} next month
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      {account.type} · Opening {formatCurrency(account.openingBalance || 0)} ·
                      Balance {formatCurrency(account.balance)}
                    </>
                  )}
                </p>
                {account.type === "credit" && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <DaySelect
                      label="Statement day"
                      value={cycle ? String(cycle.statementDay) : ""}
                      onChange={(day) => cycle && saveCycle(account, day, cycle.dueDay)}
                      required
                    />
                    <DaySelect
                      label="Due day"
                      value={cycle ? String(cycle.dueDay) : ""}
                      onChange={(day) => cycle && saveCycle(account, cycle.statementDay, day)}
                      required
                    />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!account.isDefault && (
                  <>
                    <button
                      type="button"
                      className="text-xs font-medium text-sage-700 px-2 py-1"
                      onClick={() => setDefault(account.id)}
                    >
                      Make default
                    </button>
                    <button
                      type="button"
                      className="text-xs font-medium text-rose-700 px-2 py-1"
                      onClick={() => remove(account)}
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </li>
            );
          })}
        </ul>

        <form onSubmit={handleCreate} className="space-y-3 pt-2 border-t border-ink/5">
          <p className="text-sm font-semibold text-ink">Add account</p>
          <input
            className="sw-input"
            placeholder="Name (e.g. HDFC, Cash)"
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
                  label="Due day (next month)"
                  value={dueDay}
                  onChange={setDueDay}
                  required
                />
              </div>
              <p className="text-[11px] text-ink-muted">
                Statement is generated on the bill day. Pay by the due day of the next month.
              </p>
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
