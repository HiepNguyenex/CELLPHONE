// src/components/product/ReviewForm.jsx
import { useState } from "react";
import RatingStars from "../RatingStars";
import { useAuth } from "../../context/AuthContext";

export default function ReviewForm({ onSubmit, submitting = false }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm."); // ✅ kiểm tra đăng nhập
      return;
    }
    if (!rating) return alert("Vui lòng chọn số sao.");
    onSubmit?.({ rating, content }); // ✅ gọi hàm từ ProductDetail.jsx
    setRating(5);
    setContent("");
  };

  // ✅ Nếu chưa login -> hiển thị gợi ý thay vì form
  if (!user)
    return (
      <div className="mt-8 border-t pt-6 text-center">
        <p className="text-gray-700 text-sm">
          Bạn cần{" "}
          <span className="text-red-600 font-medium">đăng nhập</span> để viết
          đánh giá sản phẩm này.
        </p>
      </div>
    );

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-3">Viết đánh giá của bạn</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Đánh giá
          </label>
          <div className="flex items-center gap-2">
            <RatingStars value={rating} onChange={setRating} />
            <span className="text-sm text-gray-600">{rating} sao</span>
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nội dung đánh giá
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            className="w-full border rounded p-2 text-sm focus:ring-red-500 focus:border-red-500"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting}
          className={`px-5 py-2 text-white rounded ${
            submitting
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {submitting ? "Đang gửi..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
}
