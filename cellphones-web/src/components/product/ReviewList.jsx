import React, { useState } from "react";
import RatingStars from "../RatingStars";
import { useAuth } from "../../context/AuthContext";
import { updateReview, deleteReview } from "../../services/api";

export default function ReviewList({
  reviews = [],
  onLoadMore,
  hasMore,
  onRefresh,
}) {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id) => {
    if (!window.confirm("Xóa đánh giá này?")) return;
    try {
      setLoading(true);
      await deleteReview(id);
      onRefresh && onRefresh();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    if (!editRating) return alert("Chọn số sao!");
    setLoading(true);
    await updateReview(id, { rating: editRating, content: editContent });
    setEditingId(null);
    setLoading(false);
    onRefresh && onRefresh();
  };

  // ⚡ Nếu không có review nào
  if (!reviews || reviews.length === 0) {
    return (
      <p className="text-gray-500 text-sm mt-4">Chưa có đánh giá nào.</p>
    );
  }

  return (
    <div className="space-y-4 mt-4">
      {reviews.map((r) => {
        const isOwner = user?.id === (r.user_id || r.user?.id);

        return (
          <div key={r.id} className="border-b pb-3">
            <div className="flex items-center justify-between">
              <div>
                <RatingStars value={r.rating} readOnly />
                <p className="font-semibold text-gray-800 flex items-center gap-2">
                  {r.user?.name || "Ẩn danh"}

                  {r.verified_purchase && (
                    <span className="text-xs text-green-600 font-medium">
                      ✅ Đã mua hàng
                    </span>
                  )}

                  {r.status === "pending" && (
                    <span className="text-xs text-orange-500 font-medium">
                      (Chờ duyệt)
                    </span>
                  )}
                </p>

                {/* ⏰ Nếu chưa có created_at (review mới thêm tạm) thì dùng "Vừa xong" */}
                <span className="text-xs text-gray-400">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleString("vi-VN")
                    : "Vừa xong"}
                </span>
              </div>

              {isOwner && (
                <div className="flex gap-2 text-sm">
                  <button
                    onClick={() => {
                      setEditingId(r.id);
                      setEditContent(r.content || "");
                      setEditRating(r.rating);
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="text-red-600 hover:underline"
                    disabled={loading}
                  >
                    Xóa
                  </button>
                </div>
              )}
            </div>

            {editingId === r.id ? (
              <div className="mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                  className="w-full border rounded p-2 text-sm"
                />
                <div className="flex items-center gap-3 mt-2">
                  <select
                    value={editRating}
                    onChange={(e) => setEditRating(Number(e.target.value))}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>
                        {n} sao
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleSave(r.id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="text-gray-500 text-sm"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-gray-700">{r.content}</p>
            )}
          </div>
        );
      })}

      {hasMore && (
        <button
          onClick={onLoadMore}
          className="mt-4 text-sm text-blue-600 hover:underline"
        >
          Xem thêm đánh giá
        </button>
      )}
    </div>
  );
}
