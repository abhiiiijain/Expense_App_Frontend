import { useCallback, useState } from "react";

const DISMISS_KEY = "sw-onboarding-dismissed";

function OnboardingChecklist({
  hasOpeningBalance,
  hasAccount,
  hasTransaction,
  onOpenAccounts,
  onAddTransaction,
}) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return localStorage.getItem(DISMISS_KEY) === "1";
    } catch {
      return false;
    }
  });

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }, []);

  const steps = [
    {
      id: "opening",
      label: "Set opening balance",
      done: hasOpeningBalance,
    },
    {
      id: "account",
      label: "Review your accounts",
      done: hasAccount,
      action: onOpenAccounts,
      actionLabel: "Accounts",
    },
    {
      id: "txn",
      label: "Add your first transaction",
      done: hasTransaction,
      action: onAddTransaction,
      actionLabel: "Add",
    },
  ];

  const remaining = steps.filter((s) => !s.done);
  if (dismissed || remaining.length === 0) return null;

  return (
    <div className="sw-panel p-4 sm:p-5 animate-fade-up ring-1 ring-leaf-600/10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-leaf-700 dark:text-leaf-500">
            Getting started
          </p>
          <h3 className="font-display text-lg font-semibold text-ink mt-1">
            {remaining.length} step{remaining.length > 1 ? "s" : ""} left
          </h3>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="shrink-0 rounded-lg px-2 py-1 text-xs font-medium text-ink-muted hover:bg-[var(--sw-muted-bg)] hover:text-ink"
          aria-label="Dismiss getting started"
        >
          Dismiss
        </button>
      </div>
      <ul className="mt-3 space-y-2">
        {remaining.map((step) => (
          <li key={step.id} className="flex items-center justify-between gap-3 text-sm">
            <span className="text-ink font-medium">{step.label}</span>
            {step.action && (
              <button
                type="button"
                onClick={step.action}
                className="text-xs font-semibold text-sage-700 dark:text-sage-200 hover:underline"
              >
                {step.actionLabel}
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default OnboardingChecklist;
