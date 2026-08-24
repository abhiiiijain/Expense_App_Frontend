import { useState, useEffect } from "react";
import { APP_NAME } from "../constants/app";
import { formatCurrency } from "../utils/formatCurrency";
import { sanitizeAmountInput } from "../utils/sanitizeAmount";

function OpeningBalanceModal({ open, initialValue = "", onSave, onSkip, required = false }) {
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setAmount(
        initialValue === 0 || initialValue === "0" || initialValue
          ? String(initialValue)
          : ""
      );
      setSaving(false);
    }
  }, [open, initialValue]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsed = Number(amount);
    if (!Number.isFinite(parsed) || parsed < 0) return;

    try {
      setSaving(true);
      await onSave(parsed);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-ink/40 backdrop-blur-sm p-0 sm:p-4 animate-fade-in">
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden shadow-panel w-full max-w-md ring-1 ring-ink/5 animate-fade-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="opening-balance-title"
      >
        <div className="px-6 py-5 border-b border-ink/5 bg-sand-50/80">
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

          {!required && onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="w-full text-sm font-medium text-ink-muted hover:text-ink py-2"
            >
              Not now
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default OpeningBalanceModal;
