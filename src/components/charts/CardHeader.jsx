function CardHeader({ eyebrow, title }) {
  return (
    <div className="mb-5">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {eyebrow}
      </div>
      <div className="font-display text-xl font-semibold text-ink mt-0.5">{title}</div>
    </div>
  );
}

export default CardHeader;
