// src/pages/Search.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getProducts, getBrands } from "../services/api";

const formatVND = (n) => `${(Number(n) || 0).toLocaleString("vi-VN")} ₫`;

const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
};

function useQueryParams() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

function GridSkeleton({ count = 12 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm">
          <div className="aspect-square w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
          <div className="mt-2 h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

export default function Search() {
  const params = useQueryParams();
  const navigate = useNavigate();

  // Read params
  const keyword = (params.get("keyword") || "").trim();
  const categoryId = params.get("category_id") ? Number(params.get("category_id")) : null;
  const sort = params.get("sort") || "default";
  const page = Number(params.get("page") || 1);
  const brandId = params.get("brand_id") || "";
  const priceMinParam = params.get("price_min") || "";
  const priceMaxParam = params.get("price_max") || "";
  const ratingMin = params.get("rating") || ""; // 4 = từ 4 sao trở lên
  const inStock = params.get("in_stock") === "1";
  const view = params.get("view") || "grid"; // grid | list
  const perPage = Number(params.get("per_page") || 24);

  // Local state
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [brands, setBrands] = useState([]);

  // Fetch brands once
  useEffect(() => {
    getBrands()
      .then(({ data }) => setBrands(Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []))
      .catch(() => setBrands([]));
  }, []);

  // Helper: update URL params
  const updateParams = (updates) => {
    const p = new URLSearchParams(params.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v === null || v === undefined || (Array.isArray(v) && v.length === 0)) p.delete(k);
      else p.set(k, String(v));
    });
    // Reset page when filters change (unless updating page itself)
    if (updates.page === undefined) p.delete("page");
    navigate(`/search?${p.toString()}`);
  };

  // Fetch products
  useEffect(() => {
    // Cho phép tìm nếu có keyword/category/brand hoặc có filters khác
    const hasBase = !!(keyword || categoryId || brandId || priceMinParam || priceMaxParam || ratingMin || inStock);
    if (!hasBase) {
      setProducts([]);
      setMeta({ current_page: 1, last_page: 1, total: 0 });
      setLoading(false);
      return;
    }

    const q = { per_page: perPage, page, sort };
    if (keyword) q.search = keyword;
    if (categoryId) q.category_id = categoryId;
    if (brandId) q.brand_id = brandId;
    if (priceMinParam) q.price_min = Number(priceMinParam);
    if (priceMaxParam) q.price_max = Number(priceMaxParam);
    if (ratingMin) q.rating = Number(ratingMin); // Backend: hiểu là >= rating
    if (inStock) q.in_stock = 1;

    setLoading(true);
    getProducts(q)
      .then(({ data: body }) => {
        const list = Array.isArray(body?.data) ? body.data : Array.isArray(body) ? body : [];
        setProducts(list);
        setMeta({
          current_page: body?.current_page ?? 1,
          last_page: body?.last_page ?? 1,
          total: body?.total ?? list.length,
        });
      })
      .catch((err) => {
        console.error("Lỗi search:", err);
        setProducts([]);
        setMeta({ current_page: 1, last_page: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [keyword, categoryId, brandId, sort, page, priceMinParam, priceMaxParam, ratingMin, inStock, perPage]);

  // Fetch category name (lazy)
  useEffect(() => {
    if (!categoryId) { setCategoryName(""); return; }
    import("../services/api").then(({ getCategories }) => {
      getCategories()
        .then((res) => {
          const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
          const found = arr.find((c) => Number(c.id) === Number(categoryId));
          setCategoryName(found?.name || "");
        })
        .catch(() => setCategoryName(""));
    });
  }, [categoryId]);

  // Title
  const title = keyword ? `Kết quả cho “${keyword}”` : categoryName ? `Danh mục: ${categoryName}` : "Kết quả tìm kiếm";

  // Derived for chips
  const brandName = useMemo(() => brands.find((b) => String(b.id) === String(brandId))?.name || "", [brands, brandId]);

  // ===== UI helpers =====
  const PageControls = () => (
    meta.last_page > 1 && (
      <div className="mt-6 flex items-center justify-center gap-1">
        {Array.from({ length: meta.last_page }).slice(0, 7).map((_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => updateParams({ page: p })}
              className={`px-3 py-1.5 rounded-lg border text-sm ${meta.current_page === p ? "bg-red-600 text-white border-red-600" : "bg-white hover:bg-gray-50"}`}
            >
              {p}
            </button>
          );
        })}
        {meta.last_page > 7 && <span className="px-2 text-gray-500">…</span>}
        {meta.last_page > 7 && (
          <button onClick={() => updateParams({ page: meta.last_page })} className="px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50">
            {meta.last_page}
          </button>
        )}
      </div>
    )
  );

  const RatingPill = ({ v }) => (
    <button
      onClick={() => updateParams({ rating: v })}
      className={`px-2.5 py-1 rounded-full text-xs ring-1 ${Number(ratingMin) === v ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
    >
      {"★".repeat(v)} {v}+
    </button>
  );

  const AppliedChips = () => {
    const chips = [];
    if (keyword) chips.push({ k: "keyword", label: `Từ khóa: \"${keyword}\"` });
    if (categoryName) chips.push({ k: "category_id", label: `Danh mục: ${categoryName}` });
    if (brandName) chips.push({ k: "brand_id", label: `Thương hiệu: ${brandName}` });
    if (priceMinParam) chips.push({ k: "price_min", label: `Giá từ ${formatVND(priceMinParam)}` });
    if (priceMaxParam) chips.push({ k: "price_max", label: `Giá đến ${formatVND(priceMaxParam)}` });
    if (ratingMin) chips.push({ k: "rating", label: `${ratingMin}★ trở lên` });
    if (inStock) chips.push({ k: "in_stock", label: `Còn hàng` });

    if (!chips.length) return null;
    return (
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {chips.map((c, i) => (
          <button
            key={i}
            onClick={() => updateParams({ [c.k]: "" })}
            className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-800 hover:bg-gray-200"
            title="Xóa bộ lọc"
          >
            {c.label}
            <span className="text-gray-500">✕</span>
          </button>
        ))}
        <button onClick={() => navigate("/search")} className="ml-1 text-xs text-blue-600 hover:underline">
          Xóa tất cả
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-6">
      {/* ===== Header row ===== */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <span className="text-sm text-gray-500">• {meta.total} sản phẩm</span>

        <div className="ml-auto flex items-center gap-2">
          {/* View toggle */}
          <div className="hidden sm:flex rounded-lg border bg-white p-1">
            <button
              onClick={() => updateParams({ view: "grid" })}
              className={`px-2.5 py-1 rounded-md text-xs ${view !== "list" ? "bg-red-600 text-white" : "text-gray-700"}`}
            >
              Lưới
            </button>
            <button
              onClick={() => updateParams({ view: "list" })}
              className={`px-2.5 py-1 rounded-md text-xs ${view === "list" ? "bg-red-600 text-white" : "text-gray-700"}`}
            >
              Danh sách
            </button>
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => updateParams({ sort: e.target.value })}
            className="border rounded-md px-3 py-2 bg-white text-sm text-black"
            title="Sắp xếp"
          >
            <option value="default">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>

          {/* Per page */}
          <select
            value={perPage}
            onChange={(e) => updateParams({ per_page: Number(e.target.value) })}
            className="border rounded-md px-3 py-2 bg-white text-sm text-black"
            title="Số lượng/Trang"
          >
            {[12, 24, 36, 48].map((n) => (
              <option key={n} value={n}>{n}/trang</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chips áp dụng */}
      <AppliedChips />

      {/* ===== Layout: sidebar + content ===== */}
      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
        {/* Sidebar filters */}
        <aside className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-4 h-max sticky top-24">
          {/* Brand filter */}
          <div>
            <div className="text-sm font-semibold mb-2">Thương hiệu</div>
            <select
              value={brandId}
              onChange={(e) => updateParams({ brand_id: e.target.value })}
              className="w-full border rounded-md px-3 py-2 bg-white text-sm text-black"
            >
              <option value="">Tất cả</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {/* Top brands as quick chips */}
            {brands.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {brands.slice(0, 8).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => updateParams({ brand_id: b.id })}
                    className={`px-2.5 py-1 rounded-full text-xs ring-1 ${String(brandId) === String(b.id) ? "bg-red-50 text-red-700 ring-red-200" : "bg-white text-gray-700 ring-gray-200 hover:bg-gray-50"}`}
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Price filter */}
          <div>
            <div className="text-sm font-semibold mb-2">Khoảng giá</div>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                inputMode="numeric"
                placeholder="Từ"
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={priceMinParam}
                onBlur={(e) => updateParams({ price_min: e.target.value })}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder="Đến"
                className="w-full rounded-md border px-3 py-2 text-sm"
                defaultValue={priceMaxParam}
                onBlur={(e) => updateParams({ price_max: e.target.value })}
              />
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Rating */}
          <div>
            <div className="text-sm font-semibold mb-2">Đánh giá</div>
            <div className="flex flex-wrap gap-2">
              {[4, 3, 2].map((v) => (
                <RatingPill key={v} v={v} />
              ))}
              {ratingMin && (
                <button onClick={() => updateParams({ rating: "" })} className="text-xs text-blue-600 hover:underline">
                  Xóa
                </button>
              )}
            </div>
          </div>

          <hr className="my-4 border-gray-100" />

          {/* Stock */}
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">Chỉ hiển thị còn hàng</div>
            <label className="relative inline-flex cursor-pointer items-center">
              <input
                type="checkbox"
                className="peer sr-only"
                checked={inStock}
                onChange={(e) => updateParams({ in_stock: e.target.checked ? 1 : "" })}
              />
              <div className="h-5 w-9 rounded-full bg-gray-200 peer-checked:bg-red-600 transition-all after:absolute after:h-4 after:w-4 after:translate-x-0 after:rounded-full after:bg-white after:shadow after:transition-all after:content-[''] peer-checked:after:translate-x-4"></div>
            </label>
          </div>

          <button
            onClick={() => navigate("/search")}
            className="mt-4 w-full rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Xóa tất cả bộ lọc
          </button>
        </aside>

        {/* Content */}
        <section>
          {/* States */}
          {!keyword && !categoryId && !brandId && !priceMinParam && !priceMaxParam && !ratingMin && !inStock ? (
            <div className="rounded-2xl bg-white p-6 text-gray-600 ring-1 ring-gray-100 shadow-sm">
              Hãy nhập từ khóa, chọn danh mục hoặc dùng bộ lọc ở bên trái để bắt đầu tìm kiếm.
            </div>
          ) : loading ? (
            <GridSkeleton />
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-white p-10 text-center text-gray-600 ring-1 ring-gray-100 shadow-sm">
              Không tìm thấy sản phẩm phù hợp.
              <div className="mt-3 text-sm">
                Thử bỏ bớt bộ lọc hoặc tìm khóa khác.
              </div>
            </div>
          ) : (
            <>
              {/* Grid / List */}
              {view === "list" ? (
                <div className="space-y-3">
                  {products.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="block rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm hover:shadow-md">
                      <div className="flex gap-3">
                        <div className="size-24 shrink-0 overflow-hidden rounded-xl ring-1 ring-gray-100">
                          <img
                            src={resolveImg(p.image_url) || "https://via.placeholder.com/400x400?text=No+Image"}
                            alt={p.name}
                            className="h-full w-full object-cover"
                            onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium line-clamp-2">{p.name}</div>
                          <div className="mt-1 text-red-600 font-semibold">{formatVND(p.price)}</div>
                          {p.short_desc && (
                            <div className="mt-1 text-sm text-gray-600 line-clamp-2">{p.short_desc}</div>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map((p) => (
                    <Link key={p.id} to={`/product/${p.id}`} className="group rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm hover:shadow-md">
                      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-50 ring-1 ring-gray-100">
                        <img
                          src={resolveImg(p.image_url) || "https://via.placeholder.com/400x400?text=No+Image"}
                          alt={p.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                          onError={(e) => { e.currentTarget.src = "https://via.placeholder.com/400x400?text=No+Image"; }}
                        />
                      </div>
                      <div className="mt-3 line-clamp-2 font-medium text-gray-900">{p.name}</div>
                      <div className="mt-1 text-red-600 font-semibold">{formatVND(p.price)}</div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Pagination */}
              <PageControls />
            </>
          )}
        </section>
      </div>
    </div>
  );
}
