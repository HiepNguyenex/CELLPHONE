import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { blogs } from "../data/blogs";

export default function Blog() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    // Reset 24h: dùng localStorage để cache
    const cacheKey = "blog_cache_json_v1";
    const cache = localStorage.getItem(cacheKey);

    if (cache) {
      const { data, timestamp } = JSON.parse(cache);
      const expired = Date.now() - timestamp > 24 * 60 * 60 * 1000; // 24h
      if (!expired) {
        setArticles(data);
        return;
      }
    }

    // Lấy dữ liệu từ JSON tĩnh
    setArticles(blogs);
    localStorage.setItem(
      cacheKey,
      JSON.stringify({ data: blogs, timestamp: Date.now() })
    );
  }, []);

  if (!articles.length) {
    return <p className="text-center mt-10">❌ Không có bài báo nào</p>;
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">📰 Tin tức công nghệ</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {articles.map((a) => (
          <div key={a.id} className="bg-white shadow rounded overflow-hidden">
            {a.image && (
              <img src={a.image} alt={a.title} className="w-full h-40 object-cover" />
            )}
            <div className="p-4">
              <h2 className="font-semibold text-lg mb-2 line-clamp-2">{a.title}</h2>
              <p className="text-sm text-gray-600 line-clamp-3">{a.excerpt}</p>
              <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
                <span>{a.source}</span>
                <Link
                  to={`/article/${a.id}`}
                  className="text-red-600 font-medium hover:underline"
                >
                  Đọc chi tiết →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-gray-500 text-xs mt-6">
        Nguồn: VnExpress, GenK, Tinhte (demo JSON). Dữ liệu tự reset mỗi 24h.
      </p>
    </div>
  );
}
