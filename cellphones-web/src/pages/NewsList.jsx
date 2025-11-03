// === FILE: src/pages/NewsList.jsx ===
import { useEffect, useMemo, useState } from "react";
import { getNews } from "../services/api";
import NewsCard from "../components/news/NewsCard";

export default function NewsList() {
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ page: 1, limit: 10, total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const hasPrev = useMemo(() => (meta.page || 1) > 1, [meta.page]);
  const hasNext = useMemo(() => {
    const page = meta.page || 1;
    const limit = meta.limit || 10;
    if (Number.isFinite(meta.total) && meta.total > 0) {
      return page * limit < meta.total;
    }
    // fallback khi BE không trả total
    return items.length === limit;
  }, [meta.page, meta.limit, meta.total, items.length]);

  async function load(page = 1) {
    setLoading(true);
    setErr("");
    try {
      const payload = await getNews({ page, limit: meta.limit || 10 });
      const list = Array.isArray(payload?.data) ? payload.data : [];
      setItems(list);
      setMeta({
        page,
        limit: payload?.meta?.limit ?? meta.limit ?? 10,
        total: payload?.meta?.total ?? 0,
      });
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "Lỗi tải tin");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // tải lần đầu
  useEffect(() => {
    load(1); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // tự cập nhật mỗi 30 phút
  useEffect(() => {
    const t = setInterval(() => load(meta.page || 1), 30 * 60 * 1000);
    return () => clearInterval(t);
  }, [meta.page]); // đổi trang thì reset timer

  return (
    <div className="container mx-auto px-3 py-6">
      <h1 className="text-2xl font-bold mb-4">Tin tức</h1>

      {err && <div className="text-red-600 mb-3">⚠ {err}</div>}

      {loading ? (
        <div>Đang tải…</div>
      ) : (
        <>
          {items.length === 0 ? (
            <div className="text-gray-500">Chưa có bài viết.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((it) => (
                <NewsCard key={it.id ?? it.slug} item={it} />
              ))}
            </div>
          )}

          {/* Phân trang cơ bản */}
          <div className="flex gap-2 mt-6">
            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              disabled={!hasPrev}
              onClick={() => load((meta.page || 1) - 1)}
            >
              ← Trước
            </button>
            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              disabled={!hasNext}
              onClick={() => load((meta.page || 1) + 1)}
            >
              Sau →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
// === KẾT FILE: src/pages/NewsList.jsx ===
