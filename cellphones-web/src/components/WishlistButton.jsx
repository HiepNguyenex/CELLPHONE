import { useWishlist } from "../context/WishlistContext";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";

export default function WishlistButton({ productId, className = "", label = "Yêu thích" }) {
  const { user } = useAuth();
  const { has, toggle } = useWishlist();
  const liked = has(productId);
  const navigate = useNavigate();
  const location = useLocation();

  const onClick = async () => {
    if (!user) {
      const next = encodeURIComponent(location.pathname + location.search);
      navigate(`/login?next=${next}`);
      return;
    }
    try {
      await toggle(productId);
    } catch (e) {
      const msg = e?.response?.data?.message || "Không thể cập nhật yêu thích.";
      alert(msg);
    }
  };

  return (
    <button
      onClick={onClick}
      title={liked ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-red-600 hover:bg-red-50 ${className}`}
    >
      <span style={{ fontSize: 18 }}>{liked ? "❤️" : "🤍"}</span>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
