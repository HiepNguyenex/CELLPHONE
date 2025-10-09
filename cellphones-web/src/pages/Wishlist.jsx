import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWishlist, removeWishlist } from "../services/api";
import useToast from "../components/Toast";

const fVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " đ";

// CHUẨN HÓA dữ liệu item wishlist về dạng thống nhất
const normalize = (raw) => {
  const p = raw?.product ?? raw;
  const id = Number(p?.id ?? raw?.product_id);
  if (!id) return null;
  return {
    id,
    name: p?.name ?? raw?.name ?? "Sản phẩm",
    price: Number(p?.price ?? raw?.price ?? 0),
    image_url: p?.image_url ?? raw?.image_url ?? "",
  };
};

export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  // Load danh sách yêu thích
  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchWishlist();
        const list = Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
          ? data
          : [];
        setItems(list.map(normalize).filter(Boolean));
      } catch (e) {
        // fallback localStorage (nếu có dữ liệu offline)
        const raw = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setItems(raw.map(normalize).filter(Boolean));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Xóa sản phẩm khỏi yêu thích
  const onRemove = (productId) => {
    const id = Number(productId);
    if (!id) return;

    // Hiển thị toast xác nhận
    toast.info("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?", {
      action: {
        label: "Xóa",
        onClick: async () => {
          try {
            await removeWishlist(id);
            setItems((prev) => prev.filter((x) => Number(x.id) !== id));
            toast.success("Đã xóa khỏi danh sách yêu thích 💔");
          } catch (e) {
            if (e?.response?.status === 401) {
              navigate("/login?next=/wishlist");
            } else {
              toast.error("Không thể xóa sản phẩm này, vui lòng thử lại!");
            }
          }
        },
      },
    });
  };

  // Trạng thái tải
  if (loading)
    return <div className="p-6 text-center text-gray-600">Đang tải…</div>;

  // Trạng thái rỗng
  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center bg-white rounded-2xl p-12 shadow">
          <div className="text-2xl font-semibold mb-2">
            Danh sách yêu thích trống
          </div>
          <div className="text-gray-600">
            Hãy thêm một vài sản phẩm bạn thích nhé 💖
          </div>
        </div>
      </div>
    );
  }

  // Danh sách yêu thích
  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Yêu thích</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((p) => (
          <div
            key={p.id}
            className="relative border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
          >
            <button
              className="absolute right-2 top-2 rounded-full w-8 h-8 grid place-items-center bg-white/90 hover:bg-red-50 border"
              onClick={() => onRemove(p.id)}
              title="Xóa khỏi yêu thích"
            >
              ✕
            </button>

            <Link to={`/product/${p.id}`} className="block">
              <img
                src={
                  p.image_url ||
                  "https://dummyimage.com/300x200/cccccc/000&text=No+Image"
                }
                alt={p.name}
                className="w-full h-40 object-cover rounded"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://dummyimage.com/300x200/cccccc/000&text=No+Image";
                }}
              />
              <div className="mt-2 font-medium line-clamp-2">{p.name}</div>
              <div className="text-red-600 font-semibold">{fVND(p.price)}</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
