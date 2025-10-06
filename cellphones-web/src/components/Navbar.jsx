// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useState, useRef, useEffect } from "react";
import CategoryDropdown from "./CategoryDropdown";
import api from "../services/api"; // dùng để thử lấy public settings (nếu có)

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { count: wishCount } = useWishlist();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // ---- Store settings (public) ----
  const [settings, setSettings] = useState({
    store_name: "cellphoneS",
    logo_url: "",
    hotline: "",
  });

  useEffect(() => {
    // nếu BE chưa có /v1/settings thì khối này fail silently -> vẫn dùng mặc định
    (async () => {
      try {
        const res = await api.get("/v1/settings");
        const d = res?.data || {};
        setSettings((s) => ({
          ...s,
          store_name: d.store_name || s.store_name,
          logo_url: d.logo_url || "",
          hotline: d.hotline || "",
        }));
      } catch (_) {
        /* bỏ qua */
      }
    })();
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    navigate(`/search?keyword=${encodeURIComponent(q)}`);
    setQuery("");
  };

  return (
    <header className="sticky top-0 z-50 bg-red-600 text-white border-b border-red-700/40">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-6">
        {/* Logo / Brand */}
        <Link to="/" className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.store_name || "Logo"}
              className="h-8 w-auto object-contain rounded"
            />
          ) : (
            <span className="text-2xl font-extrabold tracking-tight">
              cellphone<span className="bg-white text-red-600 px-1 rounded">S</span>
            </span>
          )}
        </Link>

        {/* Danh mục */}
        <div className="hidden md:block">
          <CategoryDropdown />
        </div>

        {/* Hotline (nếu có) */}
        {settings.hotline && (
          <a
            href={`tel:${settings.hotline}`}
            className="hidden lg:inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 transition px-3 py-1.5 rounded-lg"
            title="Gọi hotline"
          >
            📞 <span className="font-semibold">{settings.hotline}</span>
          </a>
        )}

        {/* Chọn khu vực */}
        <select
          aria-label="Chọn khu vực"
          className="text-black px-2 py-1 rounded hidden md:block"
          defaultValue="Hồ Chí Minh"
        >
          <option>Hồ Chí Minh</option>
          <option>Hà Nội</option>
          <option>Đà Nẵng</option>
        </select>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 relative">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Bạn muốn mua gì hôm nay?"
            className="w-full rounded-lg px-4 py-2 text-black focus:ring-2 focus:ring-yellow-400 outline-none"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-black hover:text-red-600"
          >
            🔍
          </button>
        </form>

        {/* Actions */}
        <nav className="flex gap-6 text-sm items-center">
          <Link to="/wishlist" className="relative hover:underline">
            ❤️ Yêu thích
            {wishCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-white text-red-600 text-xs font-bold px-1.5 py-0.5 rounded-full">
                {wishCount}
              </span>
            )}
          </Link>

          <Link to="/cart" className="relative hover:underline">
            🛒 Giỏ hàng
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-3 bg-yellow-400 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                {cartCount}
              </span>
            )}
          </Link>

          {!user ? (
            <Link to="/login" className="hover:underline">
              Đăng nhập
            </Link>
          ) : (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setOpen((prev) => !prev)}
                className="font-semibold hover:underline flex items-center gap-1"
                aria-haspopup="menu"
                aria-expanded={open}
              >
                👤 {user.name}
                <span className="text-xs">{open ? "▲" : "▼"}</span>
              </button>

              {open && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-44 bg-white text-black rounded shadow-lg z-50 overflow-hidden"
                >
                  <Link
                    to="/my-account"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Tài khoản
                  </Link>
                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100"
                    onClick={() => setOpen(false)}
                  >
                    Đơn hàng
                  </Link>
                  <button
                    onClick={() => {
                      if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
                        logout();
                        setOpen(false);
                      }
                    }}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Mobile: danh mục hiện dưới khi màn nhỏ */}
      <div className="md:hidden px-4 pb-3">
        <CategoryDropdown />
      </div>
    </header>
  );
}
