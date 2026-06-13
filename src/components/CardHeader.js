function CardHeader({ eyebrow, title }) {
  return (
    <div className="mb-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
        {eyebrow}
      </div>
      <div className="font-extrabold text-gray-900 text-lg">{title}</div>
    </div>
  );
}

export default CardHeader;
