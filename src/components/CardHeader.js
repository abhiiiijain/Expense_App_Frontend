function CardHeader({ eyebrow, title, action }) {
  return (
    <div className="flex items-center justify-between mb-4 gap-3">
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {eyebrow}
        </div>
        <div className="font-extrabold text-gray-900 text-lg">{title}</div>
      </div>
      {action}
    </div>
  );
}

export default CardHeader;
