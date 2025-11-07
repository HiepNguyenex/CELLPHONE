import { useState } from "react";
import RatingStars from "../RatingStars";
import { useAuth } from "../../context/AuthContext";

const MIN_LEN = 5; // tối thiểu 5 ký tự

export default function ReviewForm({ onSubmit, submitting = false }) {
  const { user } = useAuth();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [err, setErr] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!user) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm.");
      return;
    }

    if (!rating || Number(rating) < 1) {
      setErr("Vui lòng chọn số sao.");
      return;
    }

    const text = content.trim();
    if (text.length < MIN_LEN) {
      setErr(`Nội dung quá ngắn (≥ ${MIN_LEN} ký tự).`);
      return;
    }

    try {
      // onSubmit có thể trả Promise từ ProductDetail.jsx
      await onSubmit?.({ rating: Number(rating), content: text });
      // reset khi gửi thành công
      setRating(5);
      setContent("");
    } catch (e2) {
      const msg =
        e2?.response?.data?.message ||
        e2?.message ||
        "Gửi đánh giá thất bại. Thử lại sau.";
      setErr(msg);
    }
  };

  // Chưa đăng nhập → nhắc đăng nhập
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
          <div className="mt-1 flex items-center justify-between text-xs text-gray-500">
            <span>Tối thiểu {MIN_LEN} ký tự</span>
            <span>{content.trim().length} ký tự</span>
          </div>

          {err && (
            <div className="mt-2 text-sm text-red-600">
              {err}
            </div>
          )}
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
