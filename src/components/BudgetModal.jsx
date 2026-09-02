import ModalShell from "./ModalShell";
import BudgetPanel from "./BudgetPanel";
import { formatMonthLabel } from "../utils/dateHelpers";

function BudgetModal({ open, onClose, monthKey, categorySums }) {
  return (
    <ModalShell
      open={open}
      onClose={onClose}
      labelledBy="budget-modal-title"
      maxWidth="md"
      variant="sheet"
      panelClassName="max-h-[min(88vh,36rem)] flex flex-col"
    >
      <div className="flex flex-col min-h-0 flex-1 px-5 pt-5 pb-6">
        <div className="mb-4 flex items-start justify-between gap-3 shrink-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
              Plan
            </p>
            <h2 id="budget-modal-title" className="font-display text-lg font-semibold text-ink">
              Category budgets
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{formatMonthLabel(monthKey)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg text-ink-muted hover:text-ink hover:bg-[var(--sw-muted-bg)] flex items-center justify-center shrink-0"
            aria-label="Close budgets"
          >
            ✕
          </button>
        </div>

        {open && (
          <BudgetPanel monthKey={monthKey} categorySums={categorySums} embedded />
        )}
      </div>
    </ModalShell>
  );
}

export default BudgetModal;
