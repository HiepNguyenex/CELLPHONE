import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { resolveImg } from "../utils/img"; // đã có file utils/img.js trước đó

// ... (IconPhone, IconLaptop, IconAccessory, toVNName, pickIcon giữ nguyên)

export default function Sidebar({ showBrands = true }) {   // 👈 thêm prop
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loadingCat, setLoadingCat] = useState(true);
  const [loadingBrand, setLoadingBrand] = useState(true);

  useEffect(() => {
    api.get("/v1/categories")
      .then(res => setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || [])))
      .finally(() => setLoadingCat(false));

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
              <div key={i} className="h-9 rounded-xl bg-gray-100 animate-pulse" />
            ))}</div>
          ) : (
            <ul className="space-y-1">
              {brands.map((b) => {
                const url = resolveImg(b.logo);
                return (
                  <li key={b.id}>
                    <Link
                      to={`/search?brand_id=${b.id}`}
                      className="group flex items-center justify-between rounded-xl px-3 py-2 hover:bg-gray-50 transition"
                      title={`Xem sản phẩm ${b.name}`}
                    >
                      <div className="flex items-center gap-3">
                        {b.logo ? (
                          <img
                            src={url}
                            alt={b.name}
                            className="w-8 h-8 rounded-xl object-contain bg-gray-50 ring-1 ring-gray-100"
                            loading="lazy"
                            onError={(e)=>{ e.currentTarget.style.display='none'; }}
                          />
                        ) : (
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-600 ring-1 ring-gray-200">
                            {(b.name||'?')[0]}
                          </span>
                        )}
                        <span className="font-medium text-gray-900 group-hover:text-red-600">{b.name}</span>
                      </div>
                    </Link>
                  </li>
                );
              })}
              {brands.length === 0 && <li className="px-3 py-2 text-gray-500">Chưa có thương hiệu.</li>}
            </ul>
          )}
        </div>
      )}
    </aside>
  );
}
  