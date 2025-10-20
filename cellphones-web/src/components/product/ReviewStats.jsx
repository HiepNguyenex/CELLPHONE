// src/components/product/ReviewStats.jsx
import RatingStars from "../RatingStars";

export default function ReviewStats({ avg = 0, count = 0, breakdown = {}, onFilter }) {
  const renderBar = (rating) => {
    const total = count || 0;
    const value = breakdown[rating] || 0;
    const percent = total ? Math.round((value / total) * 100) : 0;
    return (
      <div key={rating} className="flex items-center gap-3">
        <button
          onClick={() => onFilter?.(rating)}
          className="text-sm text-blue-600 hover:underline w-16 text-left"
        >
          {rating} sao
        </button>
        <div className="flex-1 bg-gray-200 h-2 rounded">
          <div
            className="bg-yellow-400 h-2 rounded"
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-sm text-gray-600 w-10 text-right">{value}</span>
      </div>
    );
  };

  return (
    <div className="border-b pb-4 mb-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4">
        <div className="text-center sm:text-left">
          <h3 className="text-xl font-semibold text-gray-800">Đánh giá & Nhận xét</h3>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-1">
            <span className="text-3xl font-bold text-yellow-500">{avg || 0}</span>
            <RatingStars value={avg} readOnly />
            <span className="text-gray-600 text-sm">({count} đánh giá)</span>
          </div>
        </div>

        {count > 0 && (
          <div className="flex-1 sm:ml-8 w-full max-w-md">
            <div className="space-y-1">
              {[5, 4, 3, 2, 1].map(renderBar)}
            </div>
          </div>
        )}
      </div>

      {count > 0 && (
        <div className="text-center sm:text-left mt-3">
          <button
            onClick={() => onFilter?.(null)}
            className="text-sm text-gray-600 hover:text-red-600 underline"
          >
            Xem tất cả đánh giá
          </button>
        </div>
      )}
    </div>
  );
}
