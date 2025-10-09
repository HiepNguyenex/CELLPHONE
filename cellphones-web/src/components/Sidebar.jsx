// src/components/Sidebar.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

// ── Icon SVG (không cần cài thư viện)
const IconPhone = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm0 2v16h8V4H8zm4 14a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5z"/>
  </svg>
);

const IconLaptop = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8H4V6zm-3 10h22a1 1 0 0 1 0 2H1a1 1 0 1 1 0-2z"/>
  </svg>
);

const IconAccessory = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M7 2a3 3 0 0 0-3 3v7a5 5 0 0 0 5 5h2v3a2 2 0 1 0 4 0v-3h1a5 5 0 0 0 5-5V8a2 2 0 1 0-4 0v4a1 1 0 0 1-1 1h-1V5a3 3 0 0 0-3-3H7zm5 2a1 1 0 0 1 1 1v9h-3a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1h4z"/>
  </svg>
);

// ── map tên EN → VN + icon theo tên/slug
function toVNName(cat) {
  const n = (cat?.name || "").toLowerCase();
  const s = (cat?.slug || "").toLowerCase();
  if (n.includes("smart") || s.includes("phone")) return "Điện thoại";
  if (n.includes("laptop") || s.includes("laptop")) return "Laptop";
  if (n.includes("accessor") || s.includes("accessor")) return "Phụ kiện";
  return cat?.name || ""; // fallback
}
function pickIcon(cat) {
  const n = (cat?.name || "").toLowerCase();
  const s = (cat?.slug || "").toLowerCase();
  if (n.includes("smart") || s.includes("phone")) return <IconPhone className="w-5 h-5" />;
  if (n.includes("laptop") || s.includes("laptop")) return <IconLaptop className="w-5 h-5" />;
  return <IconAccessory className="w-5 h-5" />;
}

// Chuẩn hoá URL logo brand (storage → absolute)
function logoUrl(logo = "") {
  if (!logo) return "";
  if (/^https?:\/\//i.test(logo)) return logo;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(/\/api$/, "");
  return `${base}/${logo.startsWith("storage/") ? logo : `storage/${logo}`}`;
}

export default function Sidebar() {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingBrand, setLoadingBrand] = useState(true);

  useEffect(() => {
    api
      .get("/v1/categories")
      .then((res) => setCategories(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch((err) => console.error("Lỗi tải categories:", err))
      .finally(() => setLoadingCat(false));

    api
      .get("/v1/brands")
      .then((res) => setBrands(Array.isArray(res.data) ? res.data : res.data?.data || []))
      .catch((err) => console.error("Lỗi tải brands:", err))
      .finally(() => setLoadingBrand(false));
  }, []);

  return (
    <aside className="w-64 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 text-sm text-black">
      {/* ── Danh mục */}
      <div>
        <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Danh mục
        </h3>
        {loadingCat ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {categories.map((cat) => {
              const vn = toVNName(cat);
              const count = typeof cat.products_count === "number" ? cat.products_count : 0;
              return (
                <li key={cat.id}>
                  <Link
                    to={`/search?category_id=${cat.id}`}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                    title={`Xem ${vn}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
                        {pickIcon(cat)}
                      </span>
                      <span className="font-medium text-gray-900 group-hover:text-red-600">
                        {vn}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 tabular-nums">{count}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* ── Thương hiệu */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Thương hiệu
        </h3>

        {loadingBrand ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <ul className="space-y-1">
            {brands.map((b) => {
              const url = logoUrl(b.logo);
              return (
                <li key={b.id}>
                  <Link
                    to={`/search?brand_id=${b.id}`}
                    className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                    title={`Xem sản phẩm ${b.name}`}
                  >
                    <div className="flex items-center gap-3">
                      {url ? (
                        <img
                          src={url}
                          alt={b.name}
                          className="w-8 h-8 rounded-xl object-contain bg-gray-50 ring-1 ring-gray-100"
                          loading="lazy"
                        />
                      ) : (
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                          {b.name?.[0] || "?"}
                        </span>
                      )}
                      <span className="font-medium text-gray-900 group-hover:text-red-600">
                        {b.name}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
            {brands.length === 0 && (
              <li className="px-3 py-2 text-gray-500">Chưa có thương hiệu.</li>
            )}
          </ul>
        )}
      </div>
    </aside>
  );
}
