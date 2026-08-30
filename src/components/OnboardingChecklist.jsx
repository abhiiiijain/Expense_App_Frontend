function OnboardingChecklist({
  hasOpeningBalance,
  hasAccount,
  hasTransaction,
  hasBudget,
  onOpenAccounts,
  onAddTransaction,
}) {
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
    {
      id: "budget",
      label: "Set a category budget",
      done: hasBudget,
    },
  ];

  const remaining = steps.filter((s) => !s.done);
  if (remaining.length === 0) return null;

  return (
    <div className="sw-panel p-4 sm:p-5 animate-fade-up ring-1 ring-leaf-600/10">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-leaf-700 dark:text-leaf-500">
        Getting started
      </p>
      <h3 className="font-display text-lg font-semibold text-ink mt-1">
        {remaining.length} step{remaining.length > 1 ? "s" : ""} to go
      </h3>
      <ul className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-center justify-between gap-3 text-sm">
            <span className={step.done ? "text-ink-muted line-through" : "text-ink font-medium"}>
              <span className={step.done ? "text-leaf-600 dark:text-leaf-500" : "text-ink-muted"}>
                {step.done ? "✓ " : "○ "}
              </span>
              {step.label}
            </span>
            {!step.done && step.action && (
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
      <p className="mt-3 text-[11px] text-ink-muted">Tip: press N anytime to add a transaction.</p>
    </div>
  );
}

export default OnboardingChecklist;
