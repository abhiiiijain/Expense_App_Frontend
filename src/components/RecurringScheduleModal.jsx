import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";
import { formatCurrency } from "../utils/formatCurrency";
import { recurringKindLabel } from "../utils/recurring";

const DUE_DAYS = Array.from({ length: 28 }, (_, i) => i + 1);

function RecurringScheduleModal({ open, draft, onOneTime, onMonthly, onClose }) {
  const [step, setStep] = useState("choose");
  const [dueDay, setDueDay] = useState("1");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("choose");
    setDueDay(String(Math.min(28, Math.max(1, new Date().getDate()))));
    setSaving(false);
  }, [open, draft]);

  if (!open || !draft) return null;

  const label = recurringKindLabel(draft.subcategory, { short: true });

  const handleMonthly = async () => {
    if (saving) return;
    try {
      setSaving(true);
      await onMonthly?.(Number(dueDay));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={() => {
        if (!saving) onClose?.();
      }}
      closeOnEscape={!saving}
      labelledBy="recurring-schedule-title"
      zIndex={80}
    >
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <h2 id="recurring-schedule-title" className="font-display text-lg font-semibold text-ink">
          {step === "choose" ? "Is this monthly?" : "Which day each month?"}
        </h2>
        <p className="text-sm text-ink-muted mt-1">
          {draft.title} · {formatCurrency(draft.amount)} · {label}
        </p>
      </div>

      <div className="px-6 py-5 space-y-4">
        {step === "choose" ? (
          <>
            <p className="text-sm text-ink-muted">
              Reminds you on the due day so you can add it in one tap. One-time spends are left alone.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="sw-btn-primary w-full"
                disabled={saving}
                onClick={() => setStep("dueDay")}
              >
                Monthly
              </button>
              <button
                type="button"
                className="sw-btn-secondary w-full"
                disabled={saving}
                onClick={() => onOneTime?.()}
              >
                One-time
              </button>
            </div>
          </>
        ) : (
          <>
            <label className="sw-label" htmlFor="recurring-due-day">
              Due day
            </label>
            <select
              id="recurring-due-day"
              className="sw-input"
              value={dueDay}
              onChange={(e) => setDueDay(e.target.value)}
            >
              {DUE_DAYS.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-ink-muted">
              We’ll nudge you on this day (or later if you open the app after).
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="sw-btn-secondary flex-1"
                disabled={saving}
                onClick={() => setStep("choose")}
              >
                Back
              </button>
              <button
                type="button"
                className="sw-btn-primary flex-1"
                disabled={saving}
                onClick={handleMonthly}
              >
                {saving ? "Saving…" : "Save reminder"}
              </button>
            </div>
          </>
        )}
      </div>
    </ModalShell>
  );
}

export default RecurringScheduleModal;
