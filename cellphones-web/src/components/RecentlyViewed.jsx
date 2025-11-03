// src/components/RecentlyViewed.jsx
import { useViewed } from "../context/ViewedContext";
import { Link } from "react-router-dom";
import { toVND } from "../utils/money";

// Đồng bộ với ProductCard: resolve ảnh tương đối -> tuyệt đối
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ORIGIN = (() => {
  try {
    return new URL(API_BASE, window.location.origin).origin;
  } catch {
    return API_BASE.replace(/\/api(?:\/v\d+)?\/?$/i, "").replace(/\/+$/, "");
  }
})();
const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const path = String(u).replace(/^\/+/, "");
  const rel = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ORIGIN}/${rel}`;
};

const finalPriceOf = (p) => {
  const price = Number(p?.price ?? 0);
  const sale =
    p?.sale_price != null && p?.sale_price !== ""
      ? Number(p.sale_price)
      : null;
  const final =
    p?.final_price != null && p?.final_price !== ""
      ? Number(p.final_price)
      : sale != null && sale < price
      ? sale
      : price;
  return Number.isFinite(final) ? final : 0;
};

export default function RecentlyViewed() {
  const { viewed } = useViewed();

  if (!Array.isArray(viewed) || viewed.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">Sản phẩm bạn đã xem gần đây</h2> 
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {viewed.map((p) => {
          const img = resolveImg(p.image_url);
          const f = finalPriceOf(p);

          return (
            <Link
              to={`/product/${p.id}`}
              key={p.id}
              className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
            >
              <img
                src={img || "https://via.placeholder.com/300x300?text=No+Image"}
                alt={p.name}
                className="rounded mb-2 w-full h-40 object-cover"
                onError={(e) =>
                  (e.currentTarget.src =
                    "https://via.placeholder.com/300x300?text=No+Image")
                }
                loading="lazy"
              />
              <div className="text-sm font-medium line-clamp-2">{p.name}</div>
              <div className="text-red-600 font-semibold">{toVND(f)}</div>
              {p.brand && (
                <div className="text-[11px] text-gray-500 mt-0.5">{p.brand}</div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
