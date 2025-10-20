import { useEffect, useState } from "react";
import { getRecommendations } from "../services/api";
import { Link } from "react-router-dom";

/**
 * 🧠 Component gợi ý thông minh
 * Gợi ý sản phẩm dựa trên thương hiệu, danh mục và hành vi người dùng.
 * - Ưu tiên cùng brand/category
 * - Bỏ qua sản phẩm đang xem (param exclude)
 * - Random 8 sản phẩm
 */
export default function RecommendationSection({ brandId, categoryId }) {
  const [recs, setRecs] = useState([]);

  useEffect(() => {
    // 🔸 Chưa có brand/category => không gọi API
    if (!brandId && !categoryId) return;

    // 🔸 Lấy danh sách sản phẩm đã xem từ localStorage
    const viewed = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");

    const params = {
      brand_id: brandId,
      category_id: categoryId,
      exclude: viewed.join(","),
    };

    // 🔹 Gọi API
    getRecommendations(params)
      .then((res) => setRecs(res.data?.data || [])) // ✅ fix: đọc đúng `data.data`
      .catch((err) => console.error("Lỗi khi tải gợi ý:", err));
  }, [brandId, categoryId]);

  // Không có dữ liệu => không hiển thị
  if (!recs.length) return null;

  return (
    <section className="mt-10 px-2 md:px-0">
      <h2 className="text-lg font-semibold mb-3">🧠 Gợi ý cho bạn</h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {recs.map((p) => (
          <Link
            to={`/product/${p.id}`}
            key={p.id}
            className="border rounded-xl overflow-hidden hover:shadow-md transition bg-white"
          >
            {/* Ảnh sản phẩm */}
            <img
              src={
                p.image_url ||
                "https://via.placeholder.com/400x400?text=No+Image"
              }
              alt={p.name}
              className="w-full h-48 object-cover"
              onError={(e) => {
                e.currentTarget.src =
                  "https://via.placeholder.com/400x400?text=No+Image";
              }}
            />

            {/* Thông tin sản phẩm */}
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-2">{p.name}</h3>
              <p className="text-red-600 font-semibold mt-1">
                {Number(p.sale_price || p.price).toLocaleString("vi-VN")} ₫
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
