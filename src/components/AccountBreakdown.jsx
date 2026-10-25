import { formatCurrency } from "../utils/formatCurrency";

export function AccountBadge({ name, className = "max-w-[7rem]" }) {
  if (!name) return null;
  return (
    <span
      title={name}
      className={`inline-flex truncate rounded-md bg-sage-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sage-800 dark:bg-sage-600/20 dark:text-sage-200 ${className}`}
    >
      {name}
    </span>
  );
}

export function AccountTotalsBar({ totals, tone = "expense", className = "mb-3" }) {
  if (!totals.length) return null;

  const amountClass =
    tone === "income"
      ? "text-emerald-700 dark:text-emerald-400"
      : "text-rose-700 dark:text-rose-400";

  return (
    <div
      className={`shrink-0 rounded-xl border px-3 py-2.5 ${className}`}
      style={{
        borderColor: "var(--sw-border)",
        background: "var(--sw-muted-bg)",
      }}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
        By account
      </p>
      <div className="grid grid-cols-2 gap-2">
        {totals.map(({ id, name, total }) => (
          <div
            key={id}
            className="min-w-0 rounded-lg bg-[var(--sw-panel)] px-2.5 py-2"
            style={{ border: "1px solid var(--sw-border)" }}
          >
            <AccountBadge name={name} className="max-w-full" />
            <p className={`mt-1 text-xs font-bold tabular-nums leading-tight ${amountClass}`}>
              {formatCurrency(tone === "expense" ? -total : total, { signed: tone === "expense" })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
