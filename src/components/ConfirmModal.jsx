import { useEffect, useState } from "react";
import ModalShell from "./ModalShell";

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  onConfirm,
  onCancel,
}) {
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setBusy(false);
  }, [open]);

  if (!open) return null;

  const confirmClass =
    tone === "danger"
      ? "bg-rose-600 hover:bg-rose-700 disabled:bg-rose-200"
      : "bg-sage-600 hover:bg-sage-700 disabled:bg-sage-200";

  const handleConfirm = async () => {
    if (busy) return;
    try {
      setBusy(true);
      await onConfirm?.();
    } finally {
      setBusy(false);
    }
  };

  return (
    <ModalShell
      open={open}
      onClose={() => {
        if (!busy) onCancel?.();
      }}
      closeOnEscape={!busy}
      labelledBy="confirm-modal-title"
    >
      <div
        className="px-6 py-5"
        style={{
          borderBottom: "1px solid var(--sw-border)",
          background: "var(--sw-muted-bg)",
        }}
      >
        <h2 id="confirm-modal-title" className="font-display text-lg font-semibold text-ink">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-ink-muted mt-2 leading-relaxed">{description}</p>
        )}
      </div>

      <div className="p-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={onCancel}
          className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl font-semibold disabled:opacity-60 transition"
          style={{
            background: "var(--sw-elevated)",
            color: "var(--sw-ink)",
            border: "1px solid var(--sw-border)",
          }}
        >
          {cancelLabel}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={handleConfirm}
          className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-semibold disabled:text-ink-muted transition active:scale-[0.98] ${confirmClass}`}
        >
          {busy ? "Working…" : confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

export default ConfirmModal;
