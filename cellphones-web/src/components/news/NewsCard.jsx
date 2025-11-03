// === FILE: src/components/news/NewsCard.jsx ===
import { Link } from "react-router-dom";

export default function NewsCard({ item }) {
  return (
    <article className="rounded-xl border p-3 hover:shadow transition">
      <Link to={`/news/${item.slug}`} className="block">
        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.title}
            className="mb-3 h-48 w-full object-cover rounded-lg"
            loading="lazy"
          />
        )}
        <h3 className="font-semibold text-lg line-clamp-2">{item.title}</h3>
        {item.excerpt && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{item.excerpt}</p>
        )}
        <div className="text-xs text-gray-500 mt-2">
          {item.source_name ? `${item.source_name} • ` : ""}
          {item.published_at ? new Date(item.published_at).toLocaleString() : ""}
        </div>
      </Link>
    </article>
  );
}
// === KẾT FILE: src/components/news/NewsCard.jsx ===
