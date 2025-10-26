// src/components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useCompare } from "../context/CompareContext";
import { useEffect, useRef, useState } from "react";
import CategoryDropdown from "./CategoryDropdown";
import api from "../services/api";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const { count: wishCount } = useWishlist();
  const { compare } = useCompare();

  const [openUser, setOpenUser] = useState(false);
  const userRef = useRef(null);

  const [query, setQuery] = useState("");
  const [suggests, setSuggests] = useState([]);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [showSuggest, setShowSuggest] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  const cartCount = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  const compareCount = compare.length;

  const [settings, setSettings] = useState({
    store_name: "cellphoneS",
    logo_url: "",
    hotline: "",
  });

  // ===== Fetch settings once =====
  useEffect(() => {
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
      } catch (_) {}
    })();
  }, []);

  // ===== Click outside for user dropdown & search suggest =====
  useEffect(() => {
    const handler = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) setOpenUser(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggest(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ===== Suggestion (debounced) =====
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setSuggests([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const t = setTimeout(async () => {
      try {
        // Ưu tiên endpoint BE (tùy bạn map sang router có sẵn)
        const res = await api.get("/v1/search/suggestions", { params: { q } });
        const arr = Array.isArray(res?.data) ? res.data : res?.data?.data || [];
        setSuggests(arr.slice(0, 8));
      } catch {
        // Fallback: gợi ý từ lịch sử local
        const recent = JSON.parse(localStorage.getItem("recent_searches") || "[]");
        const filtered = recent.filter((s) => s.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
        setSuggests(filtered.map((x) => ({ id: x, name: x })));
      } finally {
        setSuggestLoading(false);
        setShowSuggest(true);
      }
    }, 220);
    return () => clearTimeout(t);
  }, [query]);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const q = query.trim();
    if (!q) return;
    // Lưu lịch sử local
    const recent = JSON.parse(localStorage.getItem("recent_searches") || "[]");
    if (!recent.includes(q)) localStorage.setItem("recent_searches", JSON.stringify([q, ...recent].slice(0, 12)));
    navigate(`/search?keyword=${encodeURIComponent(q)}`);
    setShowSuggest(false);
  };

  // ===== Icons (inline SVG, no deps) =====
  const Icon = ({ name, className = "size-5" }) => {
    switch (name) {
      case "heart":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-1.078-.63 25.18 25.18 0 01-4.43-3.317C3.322 15.04 1.5 12.706 1.5 9.954 1.5 7.753 3.27 6 5.44 6c1.37 0 2.678.666 3.56 1.776C9.882 6.666 11.19 6 12.56 6c2.17 0 3.94 1.753 3.94 3.954 0 2.752-1.822 5.086-4.608 6.994a25.175 25.175 0 01-4.43 3.317 15.27 15.27 0 01-1.078.63l-.022.012-.007.003a.75.75 0 01-.614-1.368l.014-.008.01-.006.033-.018a13.77 13.77 0 001.001-.586 23.68 23.68 0 004.175-3.126C12.9 14.86 14.25 12.86 14.25 9.954c0-1.332-1.06-2.454-2.69-2.454-1.01 0-2.01.54-2.56 1.424a.75.75 0 01-1.28 0C7.17 8.04 6.17 7.5 5.16 7.5c-1.63 0-2.69 1.122-2.69 2.454 0 2.905 1.35 4.905 3.576 6.234a23.68 23.68 0 004.176 3.126 13.77 13.77 0 001.001.586l.033.018.01.006.014.008a.75.75 0 01-.614 1.368z" />
          </svg>
        );
      case "scale":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M12.75 2.25a.75.75 0 00-1.5 0v1.5H6a.75.75 0 000 1.5h5.25v1.39l-5.7 3.005a.75.75 0 00-.4.66v.255c0 2.27 2.23 4.125 5.1 4.125s5.1-1.855 5.1-4.125v-.255a.75.75 0 00-.4-.66l-3.1-1.633v8.788H18a.75.75 0 000-1.5h-3.75v-9.08l2.55 1.344a.75.75 0 00.7 0l2.55-1.344v8.08c0 2.27 2.23 4.125 5.1 4.125S30 18.27 30 16v-.255a.75.75 0 00-.4-.66l-5.7-3.005V5.25H33a.75.75 0 000-1.5H12.75v-1.5z" transform="scale(0.7) translate(-4 -2)" />
          </svg>
        );
      case "cart":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M3 3.75A.75.75 0 013.75 3h1.77a1 1 0 01.97.757L7.3 6h12.41a1 1 0 01.96 1.274l-1.8 6a1 1 0 01-.96.726H8.52l-.3 1.2a1 1 0 00.97 1.25H19.5a.75.75 0 010 1.5H9.19a2.5 2.5 0 11-4.69 0H3.75a.75.75 0 110-1.5h.75a1 1 0 00.97-.757L7.2 7.5 6.25 4.5H3.75a.75.75 0 01-.75-.75zm4.5 15.75a1 1 0 100 2 1 1 0 000-2zm9.75 0a1 1 0 100 2 1 1 0 000-2z" />
          </svg>
        );
      case "user":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-9 9a9 9 0 1118 0H3z" />
          </svg>
        );
      case "search":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M10.5 3a7.5 7.5 0 015.95 12.1l3.23 3.22a1 1 0 01-1.42 1.42l-3.22-3.23A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
          </svg>
        );
      default:
        return null;
    }
  };

  // ===== Render =====
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70 border-b border-gray-200">
      <div className="mx-auto max-w-[1280px] px-4">
        <div className="flex h-16 items-center gap-4">
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            {settings.logo_url ? (
              <img src={settings.logo_url} alt={settings.store_name || "Logo"} className="h-8 w-auto object-contain rounded" />
            ) : (
              <span className="text-2xl font-extrabold tracking-tight text-red-600">
                cellphone<span className="bg-red-600 text-white px-1 rounded">S</span>
              </span>
            )}
          </Link>

          {/* Category trigger (desktop) */}
          <div className="hidden lg:block">
            <CategoryDropdown />
          </div>

          {/* Search */}
          <div ref={searchRef} className="relative flex-1">
            <form onSubmit={handleSearch} className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Bạn muốn mua gì hôm nay?"
                className="w-full rounded-xl border border-gray-200 bg-white px-10 py-2.5 text-sm text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400"
                aria-label="Tìm kiếm sản phẩm"
                onFocus={() => query.trim().length >= 2 && setShowSuggest(true)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Icon name="search" className="size-4" />
              </span>
              <button
                type="submit"
                aria-label="Tìm kiếm"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-red-600 px-3 py-1.5 text-white text-sm font-medium hover:bg-red-700"
              >
                Tìm
              </button>
            </form>

            {/* Suggest box */}
            {showSuggest && (
              <div className="absolute left-0 right-0 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                {suggestLoading && (
                  <div className="p-4 text-sm text-gray-500">Đang gợi ý…</div>
                )}
                {!suggestLoading && suggests.length === 0 && (
                  <div className="p-4 text-sm text-gray-500">Không có gợi ý phù hợp</div>
                )}
                {!suggestLoading && suggests.length > 0 && (
                  <ul className="max-h-80 overflow-auto">
                    {suggests.map((s, idx) => (
                      <li key={s.id || idx}>
                        <button
                          onClick={() => {
                            const q = s.name || s.title || s;
                            setQuery(q);
                            handleSearch();
                          }}
                          className="group flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          <span className="line-clamp-1">{s.name || s.title || String(s)}</span>
                          {s.price != null && (
                            <span className="shrink-0 text-red-600 font-medium">
                              {new Intl.NumberFormat("vi-VN").format(Number(s.price))} ₫
                            </span>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Hotline (desktop) */}
          {settings.hotline && (
            <a
              href={`tel:${settings.hotline}`}
              className="hidden xl:inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-red-700 hover:bg-red-100"
            >
              <span className="text-xs font-semibold">Hotline</span>
              <span className="font-bold">{settings.hotline}</span>
            </a>
          )}

          {/* Actions */}
          <nav className="flex items-center gap-4">
            <Link to="/wishlist" className="relative inline-flex items-center gap-1 text-gray-700 hover:text-red-600">
              <Icon name="heart" />
              <span className="hidden md:inline text-sm">Yêu thích</span>
              {wishCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {wishCount}
                </span>
              )}
            </Link>

            <Link to="/compare" className="relative inline-flex items-center gap-1 text-gray-700 hover:text-red-600">
              <Icon name="scale" />
              <span className="hidden md:inline text-sm">So sánh</span>
              {compareCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {compareCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="relative inline-flex items-center gap-1 text-gray-700 hover:text-red-600">
              <Icon name="cart" />
              <span className="hidden md:inline text-sm">Giỏ hàng</span>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[10px] font-extrabold text-black">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User */}
            {!user ? (
              <Link to="/login" className="inline-flex items-center gap-1 text-gray-700 hover:text-red-600">
                <Icon name="user" /> <span className="hidden md:inline text-sm">Đăng nhập</span>
              </Link>
            ) : (
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setOpenUser((v) => !v)}
                  className="inline-flex items-center gap-1 font-medium text-gray-700 hover:text-red-600"
                  aria-haspopup="menu"
                  aria-expanded={openUser}
                >
                  <Icon name="user" /> <span className="hidden md:inline">{user.name}</span>
                  <span className="ml-0.5 text-[10px]">{openUser ? "▲" : "▼"}</span>
                </button>
                {openUser && (
                  <div role="menu" className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    <Link to="/my-account" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpenUser(false)}>
                      Tài khoản
                    </Link>
                    <Link to="/orders" className="block px-4 py-2 text-sm hover:bg-gray-50" onClick={() => setOpenUser(false)}>
                      Đơn hàng
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm("Bạn có chắc muốn đăng xuất?")) {
                          logout();
                          setOpenUser(false);
                        }
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Category (mobile) */}
      <div className="border-t border-gray-200 lg:hidden">
        <div className="mx-auto max-w-[1280px] px-4 py-2">
          <CategoryDropdown />
        </div>
      </div>
    </header>
  );
}
