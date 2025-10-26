import { useParams } from "react-router-dom";
import { blogs } from "../data/blogs";

export default function Article() {
  const { id } = useParams();
  const article = blogs.find((a) => a.id === parseInt(id));

  if (!article) {
    return <p className="text-center mt-10">❌ Bài báo không tồn tại</p>;
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 bg-white shadow rounded">
      <h1 className="text-3xl font-bold mb-4">{article.title}</h1>
      {article.image && (
        <img src={article.image} alt={article.title} className="w-full rounded mb-6" />
      )}
      <p className="text-gray-600 mb-4">📅 {article.pubDate} | 📰 {article.source}</p>
      <p className="text-lg leading-relaxed">{article.excerpt}</p>
    </div>
  );
}
