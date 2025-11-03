// src/components/ProductCard.jsx
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import WishlistButton from "./WishlistButton";
import { toVND } from "../utils/money";
import { useCompare } from "../context/CompareContext";
import { useMemo, useState } from "react";

// ===== ORIGIN helper (chuẩn với mọi kiểu VITE_API_URL)
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const ORIGIN = (() => {
  try { return new URL(API_BASE, window.location.origin).origin; }
  catch { return API_BASE.replace(/\/api(?:\/v\d+)?\/?$/i, "").replace(/\/+$/, ""); }
})();

// Resolve absolute/relative image -> absolute URL
const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const path = String(u).replace(/^\/+/, "");
  const rel  = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ORIGIN}/${rel}`;
};

const Icon = ({ name, className = "size-4" }) => {
  switch (name) {
    case "cart":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M3 3.75a.75.75 0 01.75-.75h1.8a1 1 0 01.97.76L7.3 6h12.41a1 1 0 01.96 1.27l-1.8 6a1 1 0 01-.96.73H8.52l-.3 1.2a1 1 0 00.97 1.25H19.5a.75.75 0 010 1.5H9.2a2.5 2.5 0 11-4.7 0H3.75a.75.75 0 110-1.5h.75a1 1 0 00.97-.76L7.2 7.5 6.25 4.5H3.75a.75.75 0 01-.75-.75zm4.5 15.75a1 1 0 100 2 1 1 0 000-2zm9.75 0a1 1 0 100 2 1 1 0 000-2z"/>
        </svg>
      );
    case "scale":
      return (
        <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
          <path d="M11.25 2.25a.75.75 0 011.5 0v1.5H21a.75.75 0 010 1.5h-8.25v1.39l5.7 3.01c.25.13.4.38.4.66V10.5c0 2.27-2.23 4.13-5.1 4.13S8.6 12.77 8.6 10.5v-.26c0-.28.15-.53.4-.66l3.1-1.63V18H6a.75.75 0 010-1.5h6.75V7.42L10.2 8.77a.75.75 0 01-.7 0L6.9 7.42v8.08c0 2.27-2.23 4.13-5.1 4.13S-3 17.77-3 15.5v-.26c0-.28.15-.53.4-.66l5.7-3.01V5.25H.75a.75.75 0 010-1.5h10.5v-1.5z" transform="scale(.75) translate(8 5)"/>
        </svg>
      );
    case "star":
      return (
        <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
          <path d="M9.05 2.93a1 1 0 011.9 0l1.1 3.38a1 1 0 00.95.69h3.54a1 1 0 01.59 1.8l-2.86 2.08a1 1 0 00-.36 1.12l1.1 3.38a1 1 0 01-1.54 1.12L10 14.7l-2.98 2.1a1 1 0 01-1.54-1.12l1.1-3.38a1 1 0 00-.36-1.12L3.36 8.8a1 1 0 01.6-1.8H7.5a1 1 0 00.95-.69l1.1-3.38z"/>
        </svg>
      );
    default:
      return null;
  }
};

// ✅ Chuẩn hoá điều kiện hết hàng
function isSoldOut(p) {
  // 1) Nếu BE đã trả boolean
  if (typeof p?.in_stock === "boolean") return !p.in_stock;

  // 2) Dựa vào các trường tổng tồn có thể có
  const nums = [p?.stock_total, p?.stock_sum, p?.stock]
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v));
  if (nums.length) return Math.max(...nums) <= 0;

  // 3) Cuối cùng mới dựa vào status
  const status = String(p?.status || "").toLowerCase();
  const OUT = ["out_of_stock", "out-of-stock", "sold_out", "sold-out"];
  if (OUT.includes(status)) return true;

  // 4) Không đủ dữ liệu → không hiện “hết hàng”
  return false;
}

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { addToCompare } = useCompare();

  const price = Number(product?.price || 0);
  const sale = product?.sale_price != null ? Number(product.sale_price) : null;
  const finalPrice = sale != null && sale < price ? sale : price;
  const hasSale = sale != null && sale < price && price > 0;
  const discountPct = useMemo(
    () => (hasSale ? Math.round(((price - sale) / price) * 100) : 0),
    [hasSale, price, sale]
  );
  const rating = Number(product?.rating_avg || 0);
  const ratingCount = Number(product?.rating_count || 0);

  const soldOut = isSoldOut(product); // ✅ dùng hàm mới

  const [imgSrc, setImgSrc] = useState(
    resolveImg(product?.image_url || product?.image)
  );

  const handleAdd = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    addToCart({
      id: product.id,
      name: product.name,
      price: finalPrice,
      image_url: imgSrc,
    });
  };

  const handleCompare = (e) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();
    addToCompare({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: imgSrc,
      ram: product.ram,
      storage: product.storage,
      chip: product.chip,
      battery: product.battery,
      camera: product.camera,
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm transition hover:shadow-md">
      {/* Wishlist */}
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton productId={product.id} label="" className="!bg-white/90 hover:!bg-white" />
      </div>

      {/* Image */}
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
          <div className="aspect-square w-full">
            <img
              src={imgSrc || "https://via.placeholder.com/600x600?text=No+Image"}
              alt={product?.name || "Sản phẩm"}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              onError={(e) => {
                if (e.currentTarget.dataset.fallbacked) return;
                e.currentTarget.dataset.fallbacked = "1";
                const fallback = "https://via.placeholder.com/600x600?text=No+Image";
                setImgSrc(fallback);
                e.currentTarget.src = fallback;
              }}
            />
          </div>

          {/* Badges */}
          {hasSale && (
            <span className="absolute left-2 top-2 rounded-full bg-red-600 px-2 py-1 text-[11px] font-semibold text-white">
              -{discountPct}%
            </span>
          )}
          {product?.is_new && (
            <span className="absolute right-2 top-2 rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white">
              New
            </span>
          )}
          {soldOut && (
            <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-red-600">
              Tạm hết hàng
            </span>
          )}
        </div>
      </Link>

      {/* Title */}
      <Link to={`/product/${product.id}`} className="mt-3 line-clamp-2 min-h-[2.5rem] font-medium text-gray-900">
        {product?.name || "Tên sản phẩm"}
      </Link>

      {/* Rating */}
      {(rating > 0 || ratingCount > 0) && (
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
          <Icon name="star" className="size-3.5" />
          <span className="font-medium">{rating.toFixed(1)}</span>
          <span className="text-gray-500">({ratingCount})</span>
        </div>
      )}

      {/* Price */}
      <div className="mt-2">
        {hasSale ? (
          <>
            <div className="text-lg font-bold text-red-600">{toVND(finalPrice)}</div>
            <div className="text-xs text-gray-500 line-through">{toVND(price)}</div>
          </>
        ) : (
          <div className="text-lg font-bold text-red-600">{toVND(finalPrice)}</div>
        )}
        {product?.installment_0 && (
          <div className="mt-0.5 text-xs text-emerald-700">Trả góp 0%</div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          onClick={handleAdd}
          disabled={soldOut}
          className={`inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white shadow-sm transition ${
            !soldOut ? "bg-red-600 hover:bg-red-700" : "bg-red-300 cursor-not-allowed"
          }`}
          aria-disabled={soldOut}
        >
          <Icon name="cart" /> Mua ngay
        </button>
        <button
          onClick={handleCompare}
          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          title="Thêm vào so sánh"
        >
          <Icon name="scale" /> So sánh
        </button>
      </div>

      {/* Meta bottom row */}
      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-500">
        {product?.brand?.name && <span className="truncate">{product.brand.name}</span>}
        {product?.sku && <span className="truncate">SKU: {product.sku}</span>}
      </div>
    </div>
  );
}
