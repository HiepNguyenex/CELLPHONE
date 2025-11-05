// === FILE: src/components/Sidebar.jsx (ĐÃ NÂNG CẤP) ===

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { resolveImg } from "../utils/img";

// ... (IconPhone, IconLaptop, IconAccessory, toVNName, pickIcon giữ nguyên - nếu có) ...


// ✅ TĂNG KÍCH THƯỚC TRONG COMPONENT CON NÀY
function BrandRow({ brand }) {
  const [imgOk, setImgOk] = useState(Boolean(brand.logo));
  const letter = (brand.name || "?").slice(0, 1).toUpperCase();
  const src = brand.logo ? resolveImg(brand.logo) : "";

  return (
    <li>
      <Link
        to={`/search?brand_id=${brand.id}`}
        className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition"
        title={`Xem sản phẩm ${brand.name}`}
      >
        <div className="flex items-center gap-3">
          
          {/* ✅ TĂNG TỪ w-8 h-8 LÊN w-10 h-10 */}
          <div className="w-10 h-10 rounded-full bg-gray-50 ring-1 ring-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
            {imgOk ? (
              <img
                src={src}
                alt={brand.name}
                // ✅ TĂNG TỪ w-6 h-6 LÊN w-7 h-7
                className="w-7 h-7 object-contain" 
                loading="lazy"
                onError={() => setImgOk(false)} // 👈 Khi lỗi, đổi state
              />
            ) : (
              // Fallback
              // ✅ TĂNG TỪ text-sm LÊN text-base
              <span className="inline-flex items-center justify-center font-semibold text-gray-600 text-base">
                {letter}
              </span>
            )}
          </div>
          {/* ✅ TĂNG TỪ text-sm LÊN text-base */}
          <span className="font-medium text-gray-900 group-hover:text-red-600 text-base">{brand.name}</span>
        </div>
      </Link>
    </li>
  );
}


export default function Sidebar({ showBrands = true }) {
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingBrand, setLoadingBrand] = useState(true);

  useEffect(() => {
    // ... (Logic fetch categories không đổi) ...
    api.get("/v1/categories")
      .then(res => setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .finally(() => setLoadingCat(false));

    // ... (Logic fetch brands không đổi) ...
    api.get("/v1/brands")
      .then(res => setBrands(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .finally(() => setLoadingBrand(false));
  }, []);

  return (
    <aside className="w-64 bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-3 text-sm text-black">
      {/* Danh mục ... (GIỮ NGUYÊN) */}

      {/* ── Thương hiệu (ẩn/hiện theo prop) */}
      {showBrands && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h3 className="px-2 pb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Thương hiệu
          </h3>

          {loadingBrand ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (
              // ✅ TĂNG CHIỀU CAO SKELETON
              <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
            ))}</div>
          ) : (
            <ul className="space-y-1">
              {/* Gọi component con trong vòng lặp */}
              {brands.map((b) => (
                <BrandRow key={b.id} brand={b} />
              ))}
              {brands.length === 0 && <li className="px-3 py-2 text-gray-500">Chưa có thương hiệu.</li>}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}