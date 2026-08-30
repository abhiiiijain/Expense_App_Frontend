import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { createAccount, deleteAccount, updateAccount } from "../api/accounts";
import { formatCurrency } from "../utils/formatCurrency";
import { sanitizeAmountInput, roundMoney } from "../utils/sanitizeAmount";
import { toast } from "react-toastify";

function AccountsModal({ open, onClose, accounts, onChanged }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("bank");
  const [opening, setOpening] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setName("");
      setType("bank");
      setOpening("");
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
      });
      toast.success("Account added", { position: "top-center" });
      setName("");
      setOpening("");
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
          Track bank, cash, or other wallets. New transactions use the default account.
        </p>
      </div>

      <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
        <ul className="space-y-2">
          {accounts.map((account) => (
            <li
              key={account.id}
              className="flex items-center justify-between gap-3 rounded-xl ring-1 ring-ink/5 px-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink truncate">
                  {account.name}
                  {account.isDefault && (
                    <span className="ml-2 text-[10px] uppercase tracking-wide text-sage-700">
                      Default
                    </span>
                  )}
                </p>
                <p className="text-xs text-ink-muted capitalize">
                  {account.type} · Balance {formatCurrency(account.balance)}
                </p>
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
          ))}
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
            <option value="other">Other</option>
          </select>
          <input
            className="sw-input"
            placeholder="Opening balance"
            inputMode="decimal"
            value={opening}
            onChange={(e) => setOpening(sanitizeAmountInput(e.target.value))}
          />
          <button type="submit" disabled={saving} className="sw-btn-primary">
            {saving ? "Saving…" : "Add account"}
          </button>
        </form>
      </div>
    </ModalShell>
  );
}

export default AccountsModal;
