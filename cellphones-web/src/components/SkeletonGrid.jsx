export default function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-3 rounded-2xl bg-white shadow-sm ring-1 ring-gray-100 animate-pulse">
          <div className="w-full h-36 bg-gray-200 rounded-xl" />
          <div className="mt-3 h-4 bg-gray-200 rounded" />
          <div className="mt-2 h-4 w-1/2 bg-gray-200 rounded" />
          <div className="mt-4 h-9 bg-gray-200 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
