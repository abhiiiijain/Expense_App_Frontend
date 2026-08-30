import { useState, useEffect } from "react";
import ModalShell from "./ModalShell";
import { APP_NAME } from "../constants/app";
import { formatCurrency } from "../utils/formatCurrency";
import { formatAmountInput, roundMoney, sanitizeAmountInput } from "../utils/sanitizeAmount";

function OpeningBalanceModal({ open, initialValue = "", onSave, onSkip, required = false }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const canDismiss = !required && Boolean(onSkip);

  useEffect(() => {
    if (open) {
      setAmount(
        initialValue != null && initialValue !== ""
          ? formatAmountInput(initialValue)
          : ""
      );
      setSaving(false);
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = roundMoney(amount);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    try {
      setSaving(true);
      await onSave(parsed);
    } finally {
      setSaving(false);
    }
  };

  const handleDismiss = () => {
    if (canDismiss && !saving) onSkip?.();
  };

  return (
    <ModalShell
      open={open}
      onClose={handleDismiss}
      closeOnEscape={canDismiss && !saving}
      closeOnBackdrop={canDismiss}
      variant="sheet"
      maxWidth="md"
      zIndex={60}
      labelledBy="opening-balance-title"
      portal={false}
    >
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
          Account setup
        </p>
        <h2 id="opening-balance-title" className="font-display text-xl font-semibold text-ink mt-1">
          Opening balance
        </h2>
        <p className="text-sm text-ink-muted mt-2 leading-relaxed">
          Enter your current bank balance when you start using {APP_NAME}. New income and
          expenses will be added on top of this so your app balance matches your account.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div>
          <label className="sw-label" htmlFor="opening-balance">
            Amount in bank (₹)
          </label>
          <input
            id="opening-balance"
            type="text"
            inputMode="decimal"
            className="sw-input text-lg font-semibold tabular-nums"
            placeholder="e.g. 121583.51"
            value={amount}
            onChange={(e) => {
              setAmount(sanitizeAmountInput(e.target.value));
            }}
            required
            autoFocus
          />
          {amount !== "" && Number.isFinite(Number(amount)) && (
            <p className="mt-1.5 text-xs text-ink-muted">
              Preview: {formatCurrency(Number(amount))}
            </p>
          )}
        </div>

        <button type="submit" disabled={saving} className="sw-btn-primary">
          {saving ? "Saving…" : "Save opening balance"}
        </button>

        {canDismiss && (
          <button
            type="button"
            onClick={onSkip}
            className="w-full text-sm font-medium text-ink-muted hover:text-ink py-2"
          >
            Not now
          </button>
        )}
      </form>
    </ModalShell>
  );
}

export default OpeningBalanceModal;
