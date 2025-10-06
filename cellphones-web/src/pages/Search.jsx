import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

function formatVND(n) {
  return `${(Number(n) || 0).toLocaleString("vi-VN")} ₫`;
}

export default function Search() {
  const location = useLocation();
  const navigate = useNavigate();

  // ── đọc params
  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const keyword = (params.get("keyword") || "").trim();
  const categoryId = params.get("category_id") ? Number(params.get("category_id")) : null;
  const sort = params.get("sort") || "default"; // default|newest|price_asc|price_desc
  const page = Number(params.get("page") || 1);

  // ── state
  const [products, setProducts] = useState([]);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");

  // ── helper cập nhật query (giữ tham số khác)
  const updateParam = (name, value) => {
    const p = new URLSearchParams(location.search);
    if (value === "" || value === null || value === undefined) p.delete(name);
    else p.set(name, value);
    if (name !== "page") p.delete("page");           // đổi filter => quay về trang 1
    navigate(`/search?${p.toString()}`);
  };

  // ── gọi API product
  useEffect(() => {
    if (!keyword && !categoryId) {
      setProducts([]);
      setMeta({ current_page: 1, last_page: 1, total: 0 });
      setLoading(false);
      return;
    }

    const q = { per_page: 24, page, sort };
    if (keyword) q.search = keyword;
    if (categoryId) q.category_id = categoryId;

    setLoading(true);
    api.get("/v1/products", { params: q })
      .then((res) => {
        const body = res.data;
        const list = Array.isArray(body?.data) ? body.data : (Array.isArray(body) ? body : []);
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
  }, [keyword, categoryId, sort, page]);

  // ── lấy tên danh mục (để hiển thị đẹp, không hiện id)
  useEffect(() => {
    if (!categoryId) { setCategoryName(""); return; }
    api.get("/v1/categories")
      .then((res) => {
        const arr = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        const found = arr.find((c) => Number(c.id) === Number(categoryId));
        setCategoryName(found?.name || "");
      })
      .catch(() => setCategoryName(""));
  }, [categoryId]);

  // ── tiêu đề trang
  const title = keyword
    ? `Kết quả cho “${keyword}”`
    : categoryName
      ? `Danh mục: ${categoryName}`
      : "Kết quả tìm kiếm";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header: tiêu đề + tổng số + sort */}
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <span className="text-sm text-gray-500">• {meta.total} sản phẩm</span>

        <div className="ml-auto">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="border rounded-md px-3 py-2 bg-white text-sm text-black"
            title="Sắp xếp"
          >
            <option value="default">Mặc định</option>
            <option value="newest">Mới nhất</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>
        </div>
      </div>

      {/* Trạng thái */}
      {!keyword && !categoryId ? (
        <div className="bg-white rounded-xl p-6 text-gray-600 mt-4 shadow-sm">
          Hãy nhập từ khóa ở thanh tìm kiếm hoặc chọn một danh mục.
        </div>
      ) : loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-600 mt-5 shadow-sm">
          Không tìm thấy sản phẩm phù hợp.
        </div>
      ) : (
        <>
          {/* Grid sản phẩm */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-5">
            {products.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="group rounded-xl border bg-white p-3 shadow-sm hover:shadow-md transition"
              >
                <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
                  <img
                    src={p.image_url || "https://via.placeholder.com/400x400?text=No+Image"}
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

          {/* Phân trang */}
          {meta.last_page > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => updateParam("page", Math.max(1, meta.current_page - 1))}
                disabled={meta.current_page <= 1}
                className="px-3 py-1.5 border rounded-md bg-white disabled:opacity-50"
              >
                ← Trước
              </button>
              <span className="text-sm text-gray-600">
                Trang {meta.current_page}/{meta.last_page}
              </span>
              <button
                onClick={() => updateParam("page", Math.min(meta.last_page, meta.current_page + 1))}
                disabled={meta.current_page >= meta.last_page}
                className="px-3 py-1.5 border rounded-md bg-white disabled:opacity-50"
              >
                Sau →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
