import { useEffect, useMemo, useState } from "react";
import { fetchBudgets, upsertBudget } from "../api/budgets";
import { useCategories } from "../config/AppConfigContext";
import { formatCurrency, formatPercent } from "../utils/formatCurrency";
import { toast } from "react-toastify";
import CardHeader from "./charts/CardHeader";

function BudgetPanel({ monthKey, categorySums, embedded = false }) {
  const { expenseCategories } = useCategories();
  const [budgets, setBudgets] = useState([]);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchBudgets(monthKey)
      .then((rows) => {
        if (!cancelled) setBudgets(rows);
      })
      .catch(() => {
        if (!cancelled) toast.error("Could not load budgets");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [monthKey]);

  const byCategory = useMemo(
    () => Object.fromEntries(budgets.map((b) => [b.category, b.amount])),
    [budgets]
  );

  const rows = expenseCategories.map((category) => {
    const spent = categorySums[category.name] || 0;
    const budget = byCategory[category.name] || 0;
    const pct = budget > 0 ? Math.min(100, (spent / budget) * 100) : null;
    return { category, spent, budget, pct };
  });

  const withBudget = rows.filter((r) => r.budget > 0 || r.spent > 0);

  const startEdit = (categoryName, amount) => {
    setEditing(categoryName);
    setDraft(amount ? String(amount) : "");
  };

  const save = async (categoryName) => {
    const amount = Number(draft);
    try {
      const result = await upsertBudget({
        monthKey,
        category: categoryName,
        amount: Number.isFinite(amount) ? amount : 0,
      });
      setBudgets((prev) => {
        const next = prev.filter((b) => b.category !== categoryName);
        if (!result.removed) next.push(result);
        return next;
      });
      setEditing(null);
      toast.success("Budget saved", { position: "top-center" });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Could not save budget");
    }
  };

  const body = (
    <>
      {!embedded && <CardHeader eyebrow="Plan" title="Category budgets" className="mb-3" />}
      {loading ? (
        <div className="h-24 animate-pulse rounded-xl bg-[var(--sw-muted-bg)]" />
      ) : withBudget.length === 0 ? (
        <p className="text-sm text-ink-muted">
          Set a budget for any category below. Tap a row to edit.
        </p>
      ) : null}

      <ul className={`space-y-2 overflow-y-auto ${embedded ? "max-h-[min(52vh,24rem)] flex-1 min-h-0" : "mt-2 max-h-72"}`}>
        {(withBudget.length ? withBudget : rows.slice(0, 6)).map(
          ({ category, spent, budget, pct }) => (
            <li key={category.name} className="rounded-xl px-2 py-2 hover:bg-[var(--sw-muted-bg)]">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 min-w-0 text-left"
                  onClick={() => startEdit(category.name, budget)}
                >
                  <span
                    className="w-2 h-2 rounded-sm shrink-0"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-ink truncate">{category.name}</span>
                </button>
                {editing === category.name ? (
                  <div className="flex items-center gap-1">
                    <input
                      className="sw-input !py-1 !px-2 w-24 text-sm"
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      inputMode="decimal"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") save(category.name);
                        if (e.key === "Escape") setEditing(null);
                      }}
                    />
                    <button
                      type="button"
                      className="text-xs font-semibold text-sage-700 px-2"
                      onClick={() => save(category.name)}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="text-xs tabular-nums text-ink-muted"
                    onClick={() => startEdit(category.name, budget)}
                  >
                    {budget > 0
                      ? `${formatCurrency(spent)} / ${formatCurrency(budget)}`
                      : `Spent ${formatCurrency(spent)} · set budget`}
                  </button>
                )}
              </div>
              {budget > 0 && (
                <div className="mt-1.5 ml-4 h-1 rounded-full overflow-hidden bg-[var(--sw-muted-bg)]">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct >= 100 ? "#DC2626" : category.color,
                    }}
                  />
                </div>
              )}
              {budget > 0 && pct != null && (
                <p className="ml-4 mt-0.5 text-[10px] text-ink-muted tabular-nums">
                  {formatPercent(pct)} of budget
                </p>
              )}
            </li>
          )
        )}
      </ul>

      {withBudget.length > 0 && withBudget.length < rows.length && (
        <button
          type="button"
          className="mt-3 text-xs font-medium text-sage-700 dark:text-sage-200"
          onClick={() => startEdit(rows.find((r) => !r.budget)?.category.name, 0)}
        >
          + Add another category budget
        </button>
      )}
    </>
  );

  if (embedded) return body;

  return <div className="sw-panel p-4 sm:p-5 w-full">{body}</div>;
}

export default BudgetPanel;
