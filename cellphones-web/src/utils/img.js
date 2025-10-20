// src/utils/img.js
const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

// Lấy origin kể cả khi API_BASE là /api hay /api/v1
export const ORIGIN = (() => {
  try { return new URL(API_BASE, window.location.origin).origin; }
  catch { return API_BASE.replace(/\/api(?:\/v\d+)?\/?$/i, "").replace(/\/+$/, ""); }
})();

// Chuẩn hoá mọi kiểu đường dẫn ảnh => URL tuyệt đối
export function resolveImg(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const path = String(u).replace(/^\/+/, "");
  const rel  = path.startsWith("storage/") ? path : `storage/${path}`;
  return `${ORIGIN}/${rel}`;
}

// Fallback logo khi lỗi ảnh
export const fallbackLogo = (name = "") =>
  `https://via.placeholder.com/80x80.png?text=${encodeURIComponent((name||"?").slice(0,1).toUpperCase())}`;
