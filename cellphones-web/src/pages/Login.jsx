// src/pages/LoginSmember.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCsrfCookie } from "@/services/api"; // ✅ Bổ sung dòng này

export default function LoginSmember() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const next = new URLSearchParams(location.search).get("next") || "/";

  const [identifier, setIdentifier] = useState(""); // SĐT hoặc email
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== Icons (inline, không phụ thuộc ảnh ngoài) =====
  const Eye = ({ open }) => (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" aria-hidden>
      {open ? (
        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeWidth="1.8" />
      ) : (
        <>
          <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" strokeWidth="1.8" />
          <path d="M3 3l18 18" strokeWidth="1.8" />
        </>
      )}
    </svg>
  );

  const GiftIcon = () => (
    <svg viewBox="0 0 24 24" className="size-4 text-red-600" fill="currentColor" aria-hidden>
      <path d="M20 7h-2.18A3 3 0 0015 4a3 3 0 00-3 3 3 3 0 00-3-3 3 3 0 00-2.82 3H4a1 1 0 000 2h1v10a2 2 0 002 2h10a2 2 0 002-2V9h1a1 1 0 100-2zM9 6a1 1 0 110 2H7a1 1 0 110-2h2zm8 0a1 1 0 110 2h-2a1 1 0 110-2h2zM8 20V9h4v11H8zm6 0V9h4v11h-4z"/>
    </svg>
  );

  const GoogleIcon = () => (
    <span className="grid size-5 place-items-center rounded-sm bg-white ring-1 ring-gray-200">
      <span className="text-[11px] font-black text-[#4285F4]">G</span>
    </span>
  );

  const ZaloIcon = () => (
    <span className="grid size-5 place-items-center rounded-sm bg-[#0068FF]">
      <span className="text-[11px] font-black text-white">Z</span>
    </span>
  );

  const BENEFITS = [
    "Chiết khấu đến 5% khi mua các sản phẩm tại CellphoneS",
    "Miễn phí giao hàng cho thành viên SMEM, SVIP và cho đơn hàng từ 300.000đ",
    "Tặng voucher sinh nhật đến 500.000đ cho khách hàng thành viên",
    "Trợ giá thu cũ lên đến 1 triệu",
    "Thăng hạng nhận voucher đến 300.000đ",
    "Đặc quyền S-Student/S-Teacher ưu đãi thêm đến 10%",
  ];

  // ✅ Sửa hàm handleSubmit: gọi Sanctum trước login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Vui lòng nhập đầy đủ SĐT/email và mật khẩu");
      return;
    }

    try {
      setLoading(true);

      // ✅ Lấy CSRF cookie trước khi login (bắt buộc với Sanctum)
      await getCsrfCookie();

      await login(identifier, password);
      navigate(next || "/my-account");
    } catch (err) {
      const msg = err?.response?.data?.message || "Thông tin đăng nhập không đúng";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* ===== LEFT: Promo panel ===== */}
          <div className="hidden lg:flex flex-col justify-between rounded-3xl ring-1 ring-gray-100 bg-white p-8 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="whitespace-nowrap inline-flex items-center h-8 rounded-md bg-red-600 px-3 text-white font-bold">
                  cellphone<span className="ml-0.5 rounded bg-white px-1 text-red-600">S</span>
                </div>
                <div className="whitespace-nowrap inline-flex items-center h-8 rounded-md bg-red-600 px-3 text-white font-semibold">
                  dienthoaivui
                </div>
              </div>

              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-gray-900">
                Nhập hội khách hàng thành viên <span className="text-red-600 whitespace-nowrap">SMEMBER</span>
              </h1>
              <p className="mt-2 text-gray-600">
                Để không bỏ lỡ các ưu đãi hấp dẫn từ <span className="whitespace-nowrap">CellphoneS</span>
              </p>

              <div className="relative mt-6 rounded-3xl bg-gradient-to-b from-gray-50 to-white p-5 ring-1 ring-gray-200">
                <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-8 w-8 rounded-tl-3xl border-t-4 border-l-4 border-red-600"></span>
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 h-8 w-8 rounded-tr-3xl border-t-4 border-r-4 border-red-600"></span>
                <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-red-600"></span>
                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-red-600"></span>

                <ul className="space-y-2.5 text-gray-800">
                  {BENEFITS.map((txt, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed">
                      <GiftIcon />
                      <span className="break-words">{txt}</span>
                    </li>
                  ))}
                </ul>

                <Link to="#" className="mt-3 inline-block text-sm text-red-600 hover:underline whitespace-nowrap">
                  Xem chi tiết chính sách ưu đãi Smember »
                </Link>
              </div>
            </div>
          </div>

          {/* ===== RIGHT: Login form ===== */}
          <div className="rounded-3xl ring-1 ring-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-red-600 whitespace-nowrap">
              Đăng nhập SMEMBER
            </h2>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md mx-auto" noValidate>
              {error && (
                <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Số điện thoại hoặc Email
                </label>
                <input
                  id="phone"
                  type="text"
                  placeholder="Nhập SĐT hoặc Email của bạn"
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative mt-1">
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    placeholder="Nhập mật khẩu của bạn"
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900"
                    aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <Eye open={showPwd} />
                  </button>
                </div>
              </div>

              <button
                className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60"
                disabled={loading || !identifier || !password}
              >
                {loading ? "Đang đăng nhập…" : "Đăng nhập"}
              </button>

              <div className="text-center text-sm">
                <Link to="/password-reset" className="text-blue-600 hover:underline whitespace-nowrap">
                  Quên mật khẩu?
                </Link>
              </div>

              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="h-px flex-1 bg-gray-200" />
                Hoặc đăng nhập bằng
                <span className="h-px flex-1 bg-gray-200" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/auth/google"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
                >
                  <GoogleIcon /> Google
                </a>
                <a
                  href="/auth/zalo"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"
                >
                  <ZaloIcon /> Zalo
                </a>
              </div>

              <div className="text-center text-sm text-gray-700">
                Bạn chưa có tài khoản?{" "}
                <Link to="/register" className="font-semibold text-red-600 hover:underline whitespace-nowrap">
                  Đăng ký ngay
                </Link>
              </div>

              <div className="pt-1 text-center text-xs text-gray-500">
                Mua sắm, sửa chữa tại{" "}
                <a href="https://cellphones.com.vn" className="text-red-600 hover:underline whitespace-nowrap" target="_blank" rel="noreferrer">
                  cellphones.com.vn
                </a>{" "}
                và{" "}
                <a href="https://dienthoaivui.com.vn" className="text-red-600 hover:underline whitespace-nowrap" target="_blank" rel="noreferrer">
                  dienthoaivui.com.vn
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
