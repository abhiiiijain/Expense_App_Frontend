function CardHeader({ eyebrow, title, children, className = "mb-5" }) {
  return (
    <div className={`${className}${children ? " flex flex-wrap items-start justify-between gap-2" : ""}`}>
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
          {eyebrow}
        </div>
        <div className="font-display text-lg sm:text-xl font-semibold text-ink mt-0.5">{title}</div>
      </div>
      {children}
    </div>
  );
}

export default CardHeader;
