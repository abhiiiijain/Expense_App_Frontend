import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { formatCurrency } from "../utils/formatCurrency";
import { formatMonthDayOrdinal, toDateInputValue } from "../utils/dateHelpers";
import { recurringKindLabel } from "../utils/recurring";

function RecurringDueModal({
  open,
  item,
  remainingCount = 0,
  onAdd,
  onSkip,
  onDeactivate,
  onClose,
}) {
  const [date, setDate] = useState(toDateInputValue());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDate(toDateInputValue());
    setBusy(false);
  }, [open, item?.id]);

  if (!open || !item) return null;

  const kind = recurringKindLabel(item.subcategory);

  const run = async (fn) => {
    if (busy) return;
    try {
      setBusy(true);
      await fn?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={() => {
        if (!busy) onClose?.();
      }}
      closeOnEscape={!busy}
      labelledBy="recurring-due-title"
      zIndex={80}
    >
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
          {kind} due
          {remainingCount > 1 ? ` · ${remainingCount} waiting` : ""}
        </p>
        <h2 id="recurring-due-title" className="font-display text-lg font-semibold text-ink mt-1">
          {item.title}
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          {formatCurrency(item.amount)} · due {formatMonthDayOrdinal(item.dueDay)} each month
        </p>
      </div>

      <div className="px-6 py-5 space-y-4">
        <div>
          <label className="sw-label" htmlFor="recurring-add-date">
            Expense date
          </label>
          <input
            id="recurring-add-date"
            type="date"
            className="sw-input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="sw-btn-primary w-full"
            disabled={busy || !date}
            onClick={() => run(() => onAdd?.(date))}
          >
            {busy ? "Adding…" : "Add expense"}
          </button>
          <button
            type="button"
            className="sw-btn-secondary w-full"
            disabled={busy}
            onClick={() => run(() => onSkip?.())}
          >
            Skip this month
          </button>
          <button
            type="button"
            className="text-[12px] text-ink-muted hover:text-ink py-1"
            disabled={busy}
            onClick={() => run(() => onDeactivate?.())}
          >
            Not monthly anymore
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export default RecurringDueModal;
