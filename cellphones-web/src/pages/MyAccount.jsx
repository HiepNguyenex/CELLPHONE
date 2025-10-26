// src/pages/MyAccount.jsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ===== Helpers =====
const fDate = (d) => {
  try {
    if (!d) return "—";
    const dt = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
    return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return "—";
  }
};

const initials = (name = "?") => {
  const parts = String(name).trim().split(/\s+/);
  const first = parts[0]?.[0] || "?";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
};

export default function MyAccount() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // client-only metrics
  const [wishlistCount, setWishlistCount] = useState(0);
  const [ua, setUa] = useState("");

  useEffect(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("wishlist") || "[]");
      setWishlistCount(Array.isArray(raw) ? raw.length : 0);
    } catch {
      setWishlistCount(0);
    }
    setUa(window?.navigator?.userAgent || "");
  }, []);

  const roleBadge = useMemo(() => {
    const role = user?.role || "user";
    const palette = role === "admin"
      ? { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-200" }
      : { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200" };
    return (
      <span className={`inline-flex items-center gap-1 rounded-full ${palette.bg} ${palette.text} ring-1 ${palette.ring} px-2 py-0.5 text-xs font-medium`}>
        <span className={`inline-block size-1.5 rounded-full ${role === "admin" ? "bg-purple-600" : "bg-emerald-600"}`} />
        {role}
      </span>
    );
  }, [user?.role]);

  const onLogout = async () => {
    if (confirm("Bạn chắc chắn muốn đăng xuất?")) {
      await logout();
      navigate("/");
    }
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-10">
        <div className="rounded-3xl overflow-hidden ring-1 ring-gray-100 shadow-sm bg-white">
          <div className="bg-gradient-to-r from-red-600 to-red-400 p-8 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">👤 Tài khoản của tôi</h1>
            <p className="mt-2 text-white/90">Đăng nhập để xem đơn hàng, địa chỉ, và ưu đãi dành riêng cho bạn.</p>
          </div>
          <div className="p-8 flex items-center gap-3">
            <Link to="/login" className="rounded-xl bg-red-600 px-5 py-3 text-white font-medium shadow-sm hover:bg-red-700">Đăng nhập</Link>
            <Link to="/register" className="rounded-xl border border-red-200 bg-red-50 px-5 py-3 text-red-700 font-medium hover:bg-red-100">Tạo tài khoản</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      {/* Header */}
      <div className="rounded-3xl overflow-hidden ring-1 ring-gray-100 shadow-sm bg-white">
        <div className="bg-gradient-to-r from-red-600 to-red-400 p-8 text-white">
          <div className="flex items-center gap-4">
            <div className="size-16 md:size-20 rounded-2xl bg-white/20 grid place-items-center font-bold text-xl md:text-2xl">
              {initials(user?.name)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Xin chào, {user?.name || "Bạn"} 👋</h1>
              <div className="mt-1 text-white/90 text-sm flex items-center gap-2">
                {roleBadge}
                <span className="opacity-80">Thành viên từ {fDate(user?.created_at)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile card */}
            <section className="lg:col-span-2 rounded-2xl p-6 ring-1 ring-gray-100 bg-white shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Thông tin cá nhân</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Họ tên</div>
                  <div className="font-medium">{user?.name || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Email</div>
                  <div className="font-medium">{user?.email || "—"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Vai trò</div>
                  <div className="font-medium capitalize">{user?.role || "user"}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Xác minh email</div>
                  <div className="font-medium">{user?.email_verified_at ? `Đã xác minh (${fDate(user.email_verified_at)})` : "Chưa xác minh"}</div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/my-account/edit" className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Chỉnh sửa hồ sơ</Link>
                <Link to="/password-change" className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Đổi mật khẩu</Link>
                <Link to="/orders" className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Đơn hàng của tôi</Link>
                <Link to="/wishlist" className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Danh sách yêu thích</Link>
                <Link to="/my-account/addresses" className="rounded-xl border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50">Sổ địa chỉ</Link>
              </div>
            </section>

            {/* Quick stats */}
            <aside className="space-y-4">
              <div className="rounded-2xl p-5 ring-1 ring-gray-100 bg-white shadow-sm">
                <div className="text-sm text-gray-600">Yêu thích</div>
                <div className="mt-1 text-3xl font-semibold text-red-600">{wishlistCount}</div>
                <Link to="/wishlist" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Xem danh sách</Link>
              </div>
              <div className="rounded-2xl p-5 ring-1 ring-gray-100 bg-white shadow-sm">
                <div className="text-sm text-gray-600">Thiết bị</div>
                <div className="mt-1 text-xs text-gray-500 break-words leading-relaxed">{ua}</div>
              </div>
              <div className="rounded-2xl p-5 ring-1 ring-gray-100 bg-white shadow-sm">
                <div className="text-sm text-gray-600">Trạng thái</div>
                <div className="mt-1 text-emerald-700 text-sm">Đang hoạt động</div>
                <button onClick={onLogout} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-white text-sm hover:bg-black">
                  Đăng xuất
                </button>
              </div>
            </aside>
          </div>

          {/* Security tips / CTA */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 ring-1 ring-gray-100 bg-white shadow-sm">
              <h3 className="font-semibold">Bảo mật tài khoản</h3>
              <ul className="mt-3 list-disc pl-5 text-sm text-gray-600 space-y-1">
                <li>Dùng mật khẩu mạnh, không trùng mật khẩu ở nơi khác.</li>
                <li>Bật xác minh email để bảo vệ tài khoản.</li>
                <li>Đăng xuất khỏi thiết bị lạ.</li>
              </ul>
              <Link to="/password-change" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Đổi mật khẩu ngay</Link>
            </div>
            <div className="rounded-2xl p-6 ring-1 ring-gray-100 bg-white shadow-sm">
              <h3 className="font-semibold">Mua sắm nhanh hơn</h3>
              <p className="mt-2 text-sm text-gray-600">Lưu sẵn địa chỉ và phương thức thanh toán để thanh toán nhanh.</p>
              <Link to="/my-account/addresses" className="mt-4 inline-block text-sm text-blue-600 hover:underline">Quản lý sổ địa chỉ</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
