function EmptyState({ title, description, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-8 px-3" : "py-12 px-4"
      }`}
    >
      <div
        className={`rounded-2xl bg-sage-50 ring-1 ring-sage-100 flex items-center justify-center text-sage-600 ${
          compact ? "h-12 w-12 mb-3" : "h-14 w-14 mb-4"
        }`}
        aria-hidden="true"
      >
        <svg
          className={compact ? "h-5 w-5" : "h-6 w-6"}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 13.5l3.75-7.5h10.5L21 13.5M3 13.5h18M6.75 18h10.5"
          />
        </svg>
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && (
        <p className="text-xs text-ink-muted mt-1 max-w-[240px] leading-relaxed">{description}</p>
      )}
    </div>
  );
}

export default EmptyState;
