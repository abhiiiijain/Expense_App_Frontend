import { formatMonthLabel, getMonthKey, shiftMonthKey } from "../utils/dateHelpers";

function MonthSwitcher({ monthKey, onChange }) {
  const currentKey = getMonthKey();
  const isCurrent = monthKey === currentKey;

  return (
    <div className="sw-chip gap-1">
      <button
        type="button"
        aria-label="Previous month"
        className="w-8 h-8 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition"
        onClick={() => onChange(shiftMonthKey(monthKey, -1))}
      >
        ‹
      </button>
      <div className="min-w-[9.5rem] text-center px-2">
        <p className="text-sm font-semibold text-ink tabular-nums">{formatMonthLabel(monthKey)}</p>
        {!isCurrent && (
          <button
            type="button"
            className="text-[10px] font-medium text-sage-700 dark:text-blue-300 hover:underline"
            onClick={() => onChange(currentKey)}
          >
            Jump to this month
          </button>
        )}
      </div>
      <button
        type="button"
        aria-label="Next month"
        disabled={isCurrent}
        className="w-8 h-8 rounded-lg text-ink-muted hover:text-sage-700 hover:bg-sage-50 dark:hover:bg-white/10 dark:hover:text-blue-200 transition disabled:opacity-30"
        onClick={() => onChange(shiftMonthKey(monthKey, 1))}
      >
        ›
      </button>
    </div>
  );
}

export default MonthSwitcher;
