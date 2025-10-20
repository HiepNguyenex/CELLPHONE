// src/pages/Blog.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";

// ===== Helpers =====
const CACHE_KEY = "blog_cache_json_v2"; // bump version when changing shape
const ONE_DAY = 24 * 60 * 60 * 1000;

const FEEDS = [
  { source: "VnExpress", url: "https://vnexpress.net/rss/so-hoa.rss" },
  { source: "GenK", url: "https://genk.vn/trang-chu.rss" },
  { source: "Tinhte", url: "https://tinhte.vn/rss" },
];

const PROXIES = [
  (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
  (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
  (u) => `https://thingproxy.freeboard.io/fetch/${u}`,
  (u) => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, "")}`,
];

function stripHtml(html = "") {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function firstImg(html = "") {
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  return m ? m[1] : "";
}

async function fetchViaProxies(url) {
  for (const build of PROXIES) {
    const proxied = build(url);
    try {
      const res = await fetch(proxied);
      if (!res.ok) continue;
      // allorigins/get returns {contents}
      const ct = res.headers.get("content-type") || "";
      if (ct.includes("application/json")) {
        const j = await res.json();
        return typeof j.contents === "string" ? j.contents : JSON.stringify(j);
      }
      return await res.text();
    } catch (_) {
      // try next proxy
    }
  }
  throw new Error("All proxies failed");
}

function parseRSS(xmlText, fallbackSource = "") {
  const out = [];
  try {
    const doc = new DOMParser().parseFromString(xmlText, "text/xml");
    const items = Array.from(doc.querySelectorAll("item"));
    for (const it of items) {
      const title = it.querySelector("title")?.textContent?.trim() || "";
      const link = it.querySelector("link")?.textContent?.trim() || "";
      const pubDate = it.querySelector("pubDate, published, updated")?.textContent?.trim() || "";
      const guid = it.querySelector("guid")?.textContent?.trim() || link;
      const desc = it.querySelector("description")?.textContent || "";
      const content = it.querySelector("content\\:encoded")?.textContent || desc;

      // image candidates
      const enclosure = it.querySelector("enclosure")?.getAttribute("url") || "";
      const media = it.querySelector("media\\:content, media\\:thumbnail")?.getAttribute("url") || "";
      const inline = firstImg(content || desc);
      const image = enclosure || media || inline || "";

      // skip if no image (per user request)
      if (!image) continue;

      out.push({
        id: guid || link || title,
        title: title.replace(/\s+/g, " ").trim(),
        excerpt: stripHtml(content).slice(0, 180) + (content.length > 180 ? "…" : ""),
        link,
        image,
        source: fallbackSource,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : null,
      });
    }
  } catch (e) {
    console.error("Parse RSS error", e);
  }
  return out;
}

export default function Blog() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Read cache first
  useEffect(() => {
    const cacheRaw = localStorage.getItem(CACHE_KEY);
    if (cacheRaw) {
      try {
        const cache = JSON.parse(cacheRaw);
        const expired = Date.now() - (cache.timestamp || 0) > ONE_DAY;
        if (!expired && Array.isArray(cache.data)) {
          setArticles(cache.data);
          setLoading(false);
          return;
        }
      } catch (_) {}
    }

    (async () => {
      try {
        const results = await Promise.all(
          FEEDS.map(async (f) => {
            const xml = await fetchViaProxies(f.url);
            return parseRSS(xml, f.source);
          })
        );

        // flatten + dedupe by link
        const flat = results.flat();
        const map = new Map();
        for (const a of flat) {
          if (!a.link) continue;
          if (!map.has(a.link)) map.set(a.link, a);
        }
        const merged = Array.from(map.values())
          .sort((a, b) => (new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0)))
          .slice(0, 30);

        setArticles(merged);
        localStorage.setItem(CACHE_KEY, JSON.stringify({ data: merged, timestamp: Date.now() }));
      } catch (e) {
        console.error(e);
        setError("Không tải được tin tức trực tuyến. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const Empty = useMemo(() => (
    <div className="rounded-2xl bg-white p-10 text-center text-gray-600 ring-1 ring-gray-100 shadow-sm">
      Không có bài viết nào.
    </div>
  ), []);

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-6 py-10">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight">📰 Tin tức công nghệ</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              localStorage.removeItem(CACHE_KEY);
              window.location.reload();
            }}
            className="rounded-lg border bg-white px-3 py-1.5 text-sm hover:bg-gray-50"
            title="Lấy tin mới (xoá cache 24h)"
          >
            Lấy tin mới
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm">
              <div className="aspect-[16/10] w-full rounded-xl bg-gray-100 animate-pulse" />
              <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
              <div className="mt-2 h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {!loading && error && (
        <div className="rounded-2xl bg-red-50 p-4 text-red-700 ring-1 ring-red-200">
          {error}
        </div>
      )}

      {!loading && !error && (
        articles.length === 0 ? (
          Empty
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {articles.map((a) => (
              <article key={a.id} className="group overflow-hidden rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm hover:shadow-md">
                <a href={a.link} target="_blank" rel="noopener noreferrer" className="block">
                  <div className="aspect-[16/10] w-full overflow-hidden bg-gray-50">
                    <img src={a.image} alt={a.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 text-lg font-semibold text-gray-900">{a.title}</h2>
                    <p className="mt-1 line-clamp-3 text-sm text-gray-600">{a.excerpt}</p>
                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-medium">{a.source}</span>
                      <span>{a.publishedAt ? new Date(a.publishedAt).toLocaleDateString("vi-VN") : ""}</span>
                    </div>
                  </div>
                </a>
              </article>
            ))}
          </div>
        )
      )}

      <p className="text-gray-500 text-xs mt-6">Nguồn: {FEEDS.map(f => f.source).join(", ")}. Dữ liệu tự reset 24h một lần (có nút "Lấy tin mới" để làm mới ngay).</p>
    </div>
  );
}
