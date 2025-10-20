import { useViewed } from "../context/ViewedContext";
import { Link } from "react-router-dom";
import { toVND } from "../utils/money";

export default function RecentlyViewed() {
  const { viewed } = useViewed();

  if (!viewed || viewed.length === 0) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">👀 Sản phẩm bạn đã xem gần đây</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {viewed.map((p) => (
          <Link
            to={`/product/${p.id}`}
            key={p.id}
            className="border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
          >
            <img
              src={p.image_url || "https://via.placeholder.com/300x300?text=No+Image"}
              alt={p.name}
              className="rounded mb-2 w-full h-40 object-cover"
              onError={(e) =>
                (e.currentTarget.src = "https://via.placeholder.com/300x300?text=No+Image")
              }
            />
            <div className="text-sm font-medium line-clamp-2">{p.name}</div>
            <div className="text-red-600 font-semibold">{toVND(p.price)}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
