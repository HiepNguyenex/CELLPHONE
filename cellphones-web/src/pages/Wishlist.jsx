// src/pages/Wishlist.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { fetchWishlist, removeWishlist } from "../services/api";
import useToast from "../components/Toast";

// ========================= UTILITIES =========================
const fVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " đ";

const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
};

// CHUẨN HÓA dữ liệu item wishlist về dạng thống nhất
const normalize = (raw) => {
  const p = raw?.product ?? raw;
  const id = Number(p?.id ?? raw?.product_id);
  if (!id) return null;
  return {
    id,
    name: p?.name ?? raw?.name ?? "Sản phẩm",
    price: Number(p?.price ?? raw?.price ?? 0),
    image_url: resolveImg(p?.image_url ?? raw?.image_url ?? ""),
  };
};

// ========================= SKELETON =========================
function WishlistSkeleton() {
  const Item = () => (
    <div className="relative rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm">
      <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100 animate-pulse" />
      <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
      <div className="absolute right-3 top-3 h-8 w-8 rounded-full bg-gray-100 animate-pulse" />
    </div>
  );
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <Item key={i} />
      ))}
    </div>
  );
}

// ========================= PAGE =========================
export default function Wishlist() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState("name_asc"); // ✅ THÊM: sắp xếp
  const navigate = useNavigate();
  const toast = useToast();

  // Load danh sách yêu thích
  useEffect(() => {
    (async () => {
      try {
        const { data } = await fetchWishlist();
        const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
        const normalized = list.map(normalize).filter(Boolean);
        setItems(normalized);
        localStorage.setItem("wishlist", JSON.stringify(normalized)); // ✅ đồng bộ offline
      } catch (e) {
        // fallback localStorage (nếu có dữ liệu offline)
        const raw = JSON.parse(localStorage.getItem("wishlist") || "[]");
        setItems(raw.map(normalize).filter(Boolean));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Đồng bộ localStorage mỗi khi items đổi (giúp offline)
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("wishlist", JSON.stringify(items));
    }
  }, [items, loading]);

  // ✅ THÊM: tính toán danh sách đã sắp xếp
  const sortedItems = useMemo(() => {
    const copy = [...items];
    switch (sortKey) {
      case "price_asc":
        return copy.sort((a, b) => a.price - b.price);
      case "price_desc":
        return copy.sort((a, b) => b.price - a.price);
      case "name_desc":
        return copy.sort((a, b) => (a.name || "").localeCompare(b.name || "")).reverse();
      case "name_asc":
      default:
        return copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }
  }, [items, sortKey]);

  // Xóa 1 sản phẩm khỏi yêu thích
  const onRemove = (productId) => {
    const id = Number(productId);
    if (!id) return;

    // Hiển thị toast xác nhận
    toast.info("Bạn có chắc muốn xóa sản phẩm này khỏi danh sách yêu thích?", {
      action: {
        label: "Xóa",
        onClick: async () => {
          try {
            // Optimistic update trước
            setItems((prev) => prev.filter((x) => Number(x.id) !== id));
            await removeWishlist(id);
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

  // ✅ THÊM: Xóa tất cả
  const onClearAll = () => {
    if (!items.length) return;
    toast.info(`Xóa tất cả ${items.length} sản phẩm khỏi yêu thích?`, {
      action: {
        label: "Xóa hết",
        onClick: async () => {
          try {
            // Gọi API từng cái (nếu BE có endpoint batch, thay bằng 1 call)
            const ids = items.map((i) => i.id);
            setItems([]); // optimistic
            await Promise.allSettled(ids.map((id) => removeWishlist(id)));
            localStorage.setItem("wishlist", JSON.stringify([]));
            toast.success("Đã xóa toàn bộ danh sách yêu thích");
          } catch (e) {
            toast.error("Có lỗi khi xóa hàng loạt, hãy thử lại!");
          }
        },
      },
    });
  };

  // ========================= RENDER =========================
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Yêu thích</h1>
          <div className="h-10 w-40 rounded bg-gray-100 animate-pulse" />
        </div>
        <WishlistSkeleton />
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center bg-white rounded-3xl p-12 shadow-sm ring-1 ring-gray-100">
          <div className="text-2xl font-semibold mb-2">Danh sách yêu thích trống</div>
          <div className="text-gray-600 mb-6">Hãy thêm một vài sản phẩm bạn thích nhé 💖</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white shadow-sm hover:bg-red-700"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header + Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Yêu thích</h1>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
            {items.length} sản phẩm
          </span>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-red-400 focus:ring-red-400"
            title="Sắp xếp"
          >
            <option value="name_asc">Tên A → Z</option>
            <option value="name_desc">Tên Z → A</option>
            <option value="price_asc">Giá tăng dần</option>
            <option value="price_desc">Giá giảm dần</option>
          </select>

          <button
            onClick={onClearAll}
            className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
            title="Xóa tất cả"
          >
            Xóa tất cả
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {sortedItems.map((p) => (
          <div
            key={p.id}
            className="group relative rounded-2xl bg-white p-4 ring-1 ring-gray-100 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5"
          >
            {/* Remove button */}
            <button
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 ring-1 ring-gray-200 text-gray-600 hover:text-red-600 hover:ring-red-200"
              onClick={() => onRemove(p.id)}
              aria-label="Xóa khỏi yêu thích"
              title="Xóa khỏi yêu thích"
            >
              {/* icon X */}
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path fillRule="evenodd" d="M6.225 4.811a1 1 0 0 1 1.414 0L12 9.172l4.361-4.361a1 1 0 1 1 1.414 1.414L13.414 10.586l4.361 4.361a1 1 0 0 1-1.414 1.414L12 12l-4.361 4.361a1 1 0 0 1-1.414-1.414l4.361-4.361-4.361-4.361a1 1 0 0 1 0-1.414Z" clipRule="evenodd" />
              </svg>
            </button>

            <Link to={`/product/${p.id}`} className="block">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-xl ring-1 ring-gray-100">
                <img
                  src={p.image_url || "https://dummyimage.com/600x450/cccccc/000&text=No+Image"}
                  alt={p.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = "https://dummyimage.com/600x450/cccccc/000&text=No+Image";
                  }}
                />
              </div>
              <div className="mt-3 min-h-[44px] font-medium leading-snug line-clamp-2">{p.name}</div>
              <div className="mt-1 text-red-600 font-semibold">{fVND(p.price)}</div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
