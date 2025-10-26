// src/pages/Compare.jsx
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useCompare } from "../context/CompareContext";
import { useCart } from "../context/CartContext";

const fVND = (n) => (Number(n || 0)).toLocaleString("vi-VN") + " ₫";

function resolveImg(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
}

// Lấy đơn giá ưu tiên final → sale → price
const unitPrice = (p) =>
  Number(p?.final_price ?? p?.sale_price ?? p?.price ?? 0);

// Cấu hình trường hiển thị + kiểu so sánh để đánh dấu “tốt nhất”
const FIELD_CONFIG = [
  { key: "name", label: "Tên sản phẩm", type: "text" },
  { key: "price", label: "Giá", type: "number", best: "min" }, // rẻ nhất tốt
  { key: "ram", label: "RAM", type: "number", best: "max" },
  { key: "storage", label: "Bộ nhớ", type: "number", best: "max" },
  { key: "chipset", label: "Chip xử lý", type: "text" },
  { key: "battery", label: "Pin", type: "number", best: "max" },
  { key: "rear_cameras", label: "Camera sau", type: "text" },
];

// mapping fallback key trong specs
const ALT_KEYS = {
  chipset: ["cpu", "processor", "chip", "soc"],
  ram: ["ram", "memory"],
  storage: ["storage", "rom"],
  battery: ["battery", "power", "capacity"],
  rear_cameras: ["rear_camera", "camera", "rear_cameras"],
};

// ===== Helpers parse số (để so sánh) =====
const parseFirstNumber = (s) => {
  if (s == null) return null;
  const m = String(s).replaceAll(",", "").match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
};
const parseRam = (s) => parseFirstNumber(s); // “8 GB”, “12GB” -> 8/12
const parseStorage = (s) => parseFirstNumber(s); // “512 GB”
const parseBattery = (s) => parseFirstNumber(s); // “5000 mAh”
const parsePrice = (p) => Number(p || 0);

function getDisplayAndNumeric(product, fieldKey) {
  if (fieldKey === "price") {
    const base = Number(product?.price ?? 0);
    const sale = Number(product?.sale_price ?? null);
    const final = unitPrice(product);
    const display =
      sale && sale < base
        ? `${fVND(final)}  •  ` +
          `%c${fVND(base)}%c`.replace("%c", "").replace("%c", "")
        : fVND(final);
    return {
      display: fVND(final),
      numeric: parsePrice(final),
      extra: { base, final, sale },
    };
  }

  const specs = product?.specs || {};
  // direct
  if (specs[fieldKey]) {
    return {
      display: String(specs[fieldKey]),
      numeric:
        fieldKey === "ram"
          ? parseRam(specs[fieldKey])
          : fieldKey === "storage"
          ? parseStorage(specs[fieldKey])
          : fieldKey === "battery"
          ? parseBattery(specs[fieldKey])
          : null,
    };
  }
  // fallback keys
  const alts = ALT_KEYS[fieldKey] || [];
  for (const k of alts) {
    if (specs[k]) {
      return {
        display: String(specs[k]),
        numeric:
          fieldKey === "ram"
            ? parseRam(specs[k])
            : fieldKey === "storage"
            ? parseStorage(specs[k])
            : fieldKey === "battery"
            ? parseBattery(specs[k])
            : null,
      };
    }
  }
  return { display: "—", numeric: null };
}

function computeBestIndices(products, field) {
  if (field.type !== "number" || !field.best) return new Set();
  const nums = products.map((p) => getDisplayAndNumeric(p, field.key).numeric);
  const valid = nums.filter((n) => typeof n === "number" && !Number.isNaN(n));
  if (!valid.length) return new Set();

  const target =
    field.best === "max" ? Math.max(...valid) : Math.min(...valid);

  const best = new Set();
  nums.forEach((n, idx) => {
    if (n === target) best.add(idx);
  });
  return best;
}

export default function Compare() {
  const { compare, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const [diffOnly, setDiffOnly] = useState(false);

  // Rỗng
  if (!compare?.length) {
    return (
      <div className="max-w-5xl mx-auto mt-12 text-center">
        <div className="text-5xl mb-3">📊</div>
        <h2 className="text-xl font-semibold mb-3">Danh sách so sánh trống</h2>
        <Link to="/" className="inline-block bg-black text-white px-4 py-2 rounded">
          Quay lại mua sắm
        </Link>
      </div>
    );
  }

  // Lọc hàng hiển thị nếu bật “chỉ khác nhau”
  const fields = useMemo(() => {
    if (!diffOnly) return FIELD_CONFIG;
    return FIELD_CONFIG.filter((f) => {
      if (f.key === "name") return true; // luôn giữ
      const values = compare.map((p) => getDisplayAndNumeric(p, f.key).display);
      const uniq = new Set(values.map((v) => String(v).toLowerCase()));
      return uniq.size > 1;
    });
  }, [diffOnly, compare]);

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 md:px-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 className="text-2xl font-bold">So sánh sản phẩm</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm flex items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={diffOnly}
              onChange={(e) => setDiffOnly(e.target.checked)}
            />
            Chỉ hiển thị khác nhau
          </label>
          <button
            onClick={() => {
              if (confirm("Xoá toàn bộ danh sách so sánh?")) clearCompare();
            }}
            className="text-sm text-rose-600 hover:underline"
          >
            🗑️ Xóa tất cả
          </button>
        </div>
      </div>

      {/* Bảng so sánh */}
      <div className="overflow-x-auto rounded-lg border bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 border p-3 w-48 text-left font-semibold">
                Thông số
              </th>
              {compare.map((p, idx) => {
                const base = Number(p.price ?? 0);
                const final = unitPrice(p);
                const discount = Math.max(base - final, 0);
                const canQuickAdd = !(Array.isArray(p.variants) && p.variants.length);

                return (
                  <th key={p.id || idx} className="border p-3 align-top min-w-[220px]">
                    <div className="flex flex-col items-center">
                      <img
                        src={resolveImg(p.image_url)}
                        alt={p.name}
                        className="w-24 h-24 object-cover rounded mb-2 bg-gray-100"
                        onError={(e) =>
                          (e.currentTarget.src =
                            "https://dummyimage.com/200x200/eee/aaa&text=—")
                        }
                      />
                      <Link
                        to={`/product/${p.id}`}
                        className="font-medium text-gray-800 text-center line-clamp-2 hover:underline"
                        title={p.name}
                      >
                        {p.name}
                      </Link>

                      <div className="mt-2 text-center">
                        <div className="text-red-600 font-semibold">
                          {fVND(final)}
                        </div>
                        {discount > 0 && (
                          <div className="text-xs text-gray-500">
                            <span className="line-through">{fVND(base)}</span>{" "}
                            <span className="text-emerald-700">
                              −{fVND(discount)}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 mt-2">
                        <Link
                          to={`/product/${p.id}`}
                          className="px-3 py-1.5 border rounded hover:bg-gray-50"
                        >
                          Xem chi tiết
                        </Link>
                        {canQuickAdd && (
                          <button
                            className="px-3 py-1.5 rounded bg-black text-white hover:opacity-90"
                            onClick={() =>
                              addToCart({
                                ...p,
                                image_url: resolveImg(p.image_url),
                                price: Number(p.price ?? final),
                                sale_price: Number(p.sale_price ?? null),
                                final_price: Number(p.final_price ?? final),
                                qty: 1,
                              })
                            }
                          >
                            Thêm nhanh
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="text-xs text-rose-500 mt-2 hover:underline"
                      >
                        Xóa khỏi so sánh
                      </button>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {fields.map((f, rowIndex) => {
              // Xác định “best” theo trường số
              const bestIdx = computeBestIndices(compare, f);

              return (
                <tr
                  key={f.key}
                  className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="sticky left-0 z-10 bg-inherit border p-3 font-medium w-48">
                    {f.label}
                  </td>
                  {compare.map((p, colIndex) => {
                    const val = getDisplayAndNumeric(p, f.key);
                    const isBest = bestIdx.has(colIndex);

                    return (
                      <td
                        key={(p.id || colIndex) + f.key}
                        className={`border p-3 text-center align-middle ${
                          isBest
                            ? "bg-emerald-50 ring-1 ring-emerald-200"
                            : ""
                        }`}
                        title={String(val.display)}
                      >
                        <div className="inline-flex items-center gap-1">
                          <span>{val.display}</span>
                          {isBest && f.type === "number" && (
                            <span className="px-1.5 py-[1px] text-[10px] rounded bg-emerald-600 text-white">
                              Tốt nhất
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-gray-500 text-center mt-3">
        (Kéo sang ngang để xem đầy đủ nếu có nhiều sản phẩm)
      </p>
    </div>
  );
}
