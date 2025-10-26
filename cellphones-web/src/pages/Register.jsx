// src/pages/RegisterSmember.jsx
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const isEmail = (v) => /.+@.+\..+/.test(String(v).toLowerCase());
const isVNPhone = (v) => /^(\+?84|0)\d{9,10}$/.test(String(v).replace(/\s|-/g, ""));

export default function RegisterSmember() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const next = new URLSearchParams(location.search).get("next") || "/login";

  const [name, setName] = useState("");
  const [email, setEmail] = useState(""); // dùng cho SĐT hoặc email
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
    <span className="grid size-5 place-items-center rounded-sm bg-white ring-1 ring-gray-200"><span className="text-[11px] font-black text-[#4285F4]">G</span></span>
  );
  const ZaloIcon = () => (
    <span className="grid size-5 place-items-center rounded-sm bg-[#0068FF]"><span className="text-[11px] font-black text-white">Z</span></span>
  );

  const BENEFITS = [
    "Chiết khấu đến 5% khi mua các sản phẩm tại CellphoneS",
    "Miễn phí giao hàng cho thành viên SMEM, SVIP và cho đơn hàng từ 300.000đ",
    "Tặng voucher sinh nhật đến 500.000đ cho khách hàng thành viên",
    "Trợ giá thu cũ lên đến 1 triệu",
    "Thăng hạng nhận voucher đến 300.000đ",
    "Đặc quyền S-Student/S-Teacher ưu đãi thêm đến 10%",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) return setError("Vui lòng nhập họ và tên");
    if (!(isEmail(email) || isVNPhone(email))) return setError("Nhập đúng SĐT hoặc Email");
    if (password.length < 6) return setError("Mật khẩu phải ít nhất 6 ký tự");
    if (password !== confirm) return setError("Mật khẩu nhập lại không khớp");
    if (!agree) return setError("Bạn cần đồng ý Điều khoản & Chính sách");

    try {
      setLoading(true);
      // API hiện tại: register(name, email, password). Nếu BE dùng phone riêng, sửa ở đây.
      await register(name, email, password);
      navigate(next);
    } catch (err) {
      const msg = err?.response?.data?.message || "Email/SĐT đã tồn tại hoặc dữ liệu không hợp lệ";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-white">
      <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          {/* LEFT: Promo */}
          <div className="hidden lg:flex flex-col justify-between rounded-3xl ring-1 ring-gray-100 bg-white p-8 shadow-sm">
            <div>
              <div className="flex items-center gap-3">
                <div className="inline-flex h-8 items-center rounded-md bg-red-600 px-3 text-white font-bold whitespace-nowrap">
                  cellphone<span className="ml-0.5 rounded bg-white px-1 text-red-600">S</span>
                </div>
                <div className="inline-flex h-8 items-center rounded-md bg-red-600 px-3 text-white font-semibold whitespace-nowrap">dienthoaivui</div>
              </div>
              <h1 className="mt-6 text-3xl font-extrabold leading-tight text-gray-900">Đăng ký <span className="text-red-600 whitespace-nowrap">SMEMBER</span></h1>
              <p className="mt-2 text-gray-600">Nhận ưu đãi độc quyền và tích điểm đổi quà tại <span className="whitespace-nowrap">CellphoneS</span></p>
              <div className="relative mt-6 rounded-3xl bg-gradient-to-b from-gray-50 to-white p-5 ring-1 ring-gray-200">
                <span className="pointer-events-none absolute -top-0.5 -left-0.5 h-8 w-8 rounded-tl-3xl border-t-4 border-l-4 border-red-600" />
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 h-8 w-8 rounded-tr-3xl border-t-4 border-r-4 border-red-600" />
                <span className="pointer-events-none absolute -bottom-0.5 -left-0.5 h-8 w-8 rounded-bl-3xl border-b-4 border-l-4 border-red-600" />
                <span className="pointer-events-none absolute -bottom-0.5 -right-0.5 h-8 w-8 rounded-br-3xl border-b-4 border-r-4 border-red-600" />
                <ul className="space-y-2.5 text-gray-800">
                  {BENEFITS.map((txt, i) => (
                    <li key={i} className="flex items-start gap-2.5 leading-relaxed"><GiftIcon /> <span className="break-words">{txt}</span></li>
                  ))}
                </ul>
                <Link to="#" className="mt-3 inline-block text-sm text-red-600 hover:underline whitespace-nowrap">Xem chi tiết ưu đãi Smember »</Link>
              </div>
            </div>
          </div>

          {/* RIGHT: Register form */}
          <div className="rounded-3xl ring-1 ring-gray-100 bg-white p-8 shadow-sm">
            <h2 className="text-2xl md:text-3xl font-extrabold text-center text-red-600 whitespace-nowrap">Đăng ký SMEMBER</h2>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 max-w-md mx-auto" noValidate>
              {error && <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200" role="alert">{error}</div>}
              <div>
                <label htmlFor="name" className="text-sm font-medium text-gray-700">Họ và tên</label>
                <input id="name" type="text" placeholder="Nguyễn Văn A" className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400" value={name} onChange={(e)=>setName(e.target.value)} />
              </div>
              <div>
                <label htmlFor="email" className="text-sm font-medium text-gray-700">Số điện thoại hoặc Email</label>
                <input id="email" type="text" placeholder="0987 654 321 hoặc you@example.com" className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400" value={email} onChange={(e)=>setEmail(e.target.value)} />
              </div>
              <div>
                <label htmlFor="pwd" className="text-sm font-medium text-gray-700">Mật khẩu</label>
                <div className="relative mt-1">
                  <input id="pwd" type={showPwd?"text":"password"} placeholder="Tối thiểu 6 ký tự" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400" value={password} onChange={(e)=>setPassword(e.target.value)} />
                  <button type="button" onClick={()=>setShowPwd(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900" aria-label={showPwd?"Ẩn mật khẩu":"Hiện mật khẩu"}><Eye open={showPwd}/></button>
                </div>
              </div>
              <div>
                <label htmlFor="confirm" className="text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
                <div className="relative mt-1">
                  <input id="confirm" type={showPwd2?"text":"password"} placeholder="Nhập lại mật khẩu" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 pr-10 text-gray-900 shadow-sm focus:border-red-400 focus:ring-red-400" value={confirm} onChange={(e)=>setConfirm(e.target.value)} />
                  <button type="button" onClick={()=>setShowPwd2(v=>!v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900" aria-label={showPwd2?"Ẩn mật khẩu":"Hiện mật khẩu"}><Eye open={showPwd2}/></button>
                </div>
              </div>
              <label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" className="mt-0.5 size-4 rounded border-gray-300 text-red-600 focus:ring-red-500" checked={agree} onChange={(e)=>setAgree(e.target.checked)} /> Tôi đồng ý với <a href="#" className="ml-1 text-red-600 hover:underline whitespace-nowrap">Điều khoản</a> và <a href="#" className="ml-1 text-red-600 hover:underline whitespace-nowrap">Chính sách bảo mật</a>.</label>
              <button className="w-full rounded-xl bg-red-600 py-2.5 font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-60" disabled={loading || !name || !email || !password || !confirm || !agree}>{loading?"Đang tạo tài khoản…":"Đăng ký"}</button>
              <div className="flex items-center gap-3 text-xs text-gray-500"><span className="h-px flex-1 bg-gray-200"/>Hoặc đăng ký bằng<span className="h-px flex-1 bg-gray-200"/></div>
              <div className="grid grid-cols-2 gap-3"><a href="/auth/google" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"><GoogleIcon/> Google</a><a href="/auth/zalo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm shadow-sm hover:bg-gray-50"><ZaloIcon/> Zalo</a></div>
              <div className="text-center text-sm text-gray-700">Đã có tài khoản? <Link to="/login" className="font-semibold text-red-600 hover:underline whitespace-nowrap">Đăng nhập</Link></div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
