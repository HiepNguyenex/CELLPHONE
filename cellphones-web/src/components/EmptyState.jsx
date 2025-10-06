export default function EmptyState({
  title = "Chưa có nội dung",
  desc = "Hãy thử thao tác khác.",
  action,
}) {
  return (
    <div className="text-center py-16 bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl">
      <div className="text-5xl mb-3">🫶</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-600 mt-1">{desc}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
