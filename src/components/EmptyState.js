function EmptyState({ icon = "📊", title, description, compact = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center ${
        compact ? "py-6 px-3" : "py-10 px-4"
      }`}
    >
      <div className={`${compact ? "text-3xl mb-2" : "text-4xl mb-3"} opacity-60`}>
        {icon}
      </div>
      <p className="text-sm font-semibold text-gray-700">{title}</p>
      {description && (
        <p className="text-xs text-gray-500 mt-1 max-w-[220px]">{description}</p>
      )}
    </div>
  );
}

export default EmptyState;
