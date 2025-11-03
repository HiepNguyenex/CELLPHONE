// === FILE: src/pages/NewsDetail.jsx ===
import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getNewsDetail } from "../services/api";

function fmtDate(s) {
  if (!s) return "";
  try {
    return new Date(s).toLocaleString("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return s;
  }
}

export default function NewsDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const title = useMemo(() => item?.title || "Tin tức", [item?.title]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setErr("");
      try {
        const data = await getNewsDetail(slug);
        if (!alive) return;
        setItem(data);
        document.title = data?.title ? `${data.title} – Cellphones` : "Tin tức – Cellphones";
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "Lỗi tải chi tiết tin");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-8">
        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
        <div className="mt-3 h-8 w-3/4 rounded bg-gray-200 animate-pulse" />
        <div className="mt-6 h-64 w-full rounded-xl bg-gray-200 animate-pulse" />
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-11/12 rounded bg-gray-200 animate-pulse" />
          <div className="h-4 w-10/12 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    );
  }

  if (err) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-8">
        <div className="mb-3 text-red-600">⚠ {err}</div>
        <button
          className="text-sm underline text-gray-600 hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-3 py-8 text-gray-600">
        Không tìm thấy bài viết.
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-8">
      {/* Breadcrumb nhỏ, tối giản */}
      <nav className="mb-4 text-sm text-gray-500">
        <Link to="/news" className="hover:underline">
          Tin tức
        </Link>
        <span className="mx-1">/</span>
        <span className="line-clamp-1">{title}</span>
      </nav>

      {/* Tiêu đề + meta */}
      <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
        {title}
      </h1>
      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500">
        {item.source_name && <span>{item.source_name}</span>}
        {item.published_at && (
          <>
            <span>•</span>
            <time dateTime={item.published_at}>{fmtDate(item.published_at)}</time>
          </>
        )}
      </div>

      {/* Ảnh đại diện */}
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={item.title}
          className="mt-6 w-full rounded-xl border object-cover"
        />
      ) : null}

      {/* Nội dung – tối giản, dễ đọc */}
      <article className="prose prose-neutral prose-lg max-w-none mt-6 prose-img:rounded-xl prose-a:text-blue-600">
        <div dangerouslySetInnerHTML={{ __html: item.content_html }} />
      </article>

      {/* Hành động cuối bài: nguồn & quay lại */}
      <div className="mt-8 flex items-center justify-between">
        {item.source_url ? (
          <a
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            href={item.source_url}
            target="_blank"
            rel="noreferrer"
          >
            Nguồn: {item.source_name || "Xem gốc"}
          </a>
        ) : <span />}
        <button
          className="text-sm text-gray-600 underline hover:text-gray-900"
          onClick={() => navigate(-1)}
        >
          ← Quay lại
        </button>
      </div>
    </div>
  );
}
// === KẾT FILE: src/pages/NewsDetail.jsx ===
