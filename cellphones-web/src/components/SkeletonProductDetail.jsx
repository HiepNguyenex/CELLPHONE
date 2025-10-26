// src/components/SkeletonProductDetail.jsx
export default function SkeletonProductDetail() {
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Hình ảnh */}
        <div className="aspect-square rounded-lg bg-gray-200 animate-pulse relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" />
        </div>

        {/* Thông tin */}
        <div className="space-y-4">
          <div className="h-7 w-3/4 bg-gray-200 rounded animate-pulse" />
          <div className="h-5 w-1/3 bg-gray-200 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-10 w-20 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* Bảng thông số */}
      <div className="mt-8 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-5 w-40 bg-gray-200 rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Đánh giá */}
      <div className="mt-10 space-y-3">
        <div className="h-6 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
        <div className="h-16 w-full bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
