import {
  formatCreditCycleRange,
  formatMonthLabel,
  getPeriodMonthKey,
  isCreditCycle,
  shiftMonthKey,
} from "../utils/dateHelpers";

function MonthSwitcher({ monthKey, onChange, cycle = "calendar" }) {
  const currentKey = getPeriodMonthKey(new Date(), cycle);
  const isCurrent = monthKey === currentKey;

  return (
    <div className="flex items-center gap-2 w-fit max-w-full">
      <div className="sw-chip gap-0.5 shrink-0">
        <button
          type="button"
          aria-label="Previous month"
          className="w-7 h-7 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition"
          onClick={() => onChange(shiftMonthKey(monthKey, -1))}
        >
          ‹
        </button>
        <div className="px-1.5 text-center">
          <p className="text-sm font-semibold text-ink tabular-nums leading-tight whitespace-nowrap">
            <span className="sm:hidden">{formatMonthLabel(monthKey, { short: true })}</span>
            <span className="hidden sm:inline">{formatMonthLabel(monthKey)}</span>
          </p>
          {isCreditCycle(cycle) && (
            <p className="text-[10px] text-ink-muted leading-tight whitespace-nowrap">
              {formatCreditCycleRange(monthKey, cycle)}
            </p>
          )}
        </div>
        <button
          type="button"
          aria-label="Next month"
          disabled={isCurrent}
          className="w-7 h-7 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition disabled:opacity-30"
          onClick={() => onChange(shiftMonthKey(monthKey, 1))}
        >
          ›
        </button>
      </div>
      {!isCurrent && (
        <button
          type="button"
          className="text-xs font-medium text-sage-700 dark:text-blue-300 hover:underline shrink-0"
          onClick={() => onChange(currentKey)}
        >
          This month
        </button>
      )}
    </div>
  );
}

export default MonthSwitcher;
