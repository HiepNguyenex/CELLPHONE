// src/components/product/PromoBox.jsx
import { useState } from "react";

const fmtVND = (n) =>
  (Number(n) || 0).toLocaleString("vi-VN") + " ₫";

function CopyBadge({ code }) {
  const [ok, setOk] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(code);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {
          window.prompt("Sao chép mã:", code);
        }
      }}
      className={`text-xs px-2 py-1 rounded border ${
        ok ? "bg-green-50 border-green-500 text-green-700" : "hover:bg-gray-50"
      }`}
      title="Sao chép mã"
    >
      {ok ? "Đã sao chép" : "Sao chép"}
    </button>
  );
}

export default function PromoBox({
  coupons = [],
  gifts = [],
  partnerDeals = [],
  comboSavePercent = 0, // ví dụ 5 (%)
  basePrice = 0,
}) {
  const comboText =
    comboSavePercent > 0
      ? `Giảm thêm ${comboSavePercent}% khi mua kèm phụ kiện`
      : null;

  const comboPrice =
    comboSavePercent > 0
      ? Math.round(basePrice * (1 - comboSavePercent / 100))
      : null;

  return (
    <div className="mt-4 rounded-xl border border-red-200 bg-red-50/40">
      <div className="px-4 py-3 border-b border-red-100 flex items-center gap-2">
        <span className="text-red-600">🎁</span>
        <h3 className="font-semibold text-red-700">Ưu đãi & quà tặng</h3>
      </div>

      <div className="p-4 grid md:grid-cols-2 gap-4">
        {/* Coupons */}
        {coupons.length > 0 && (
          <div>
            <div className="font-medium mb-2">Mã giảm giá</div>
            <ul className="space-y-2">
              {coupons.map((c, i) => (
                <li
                  key={i}
                  className="border rounded-lg p-3 flex items-start gap-3 bg-white"
                >
                  <div className="text-sm">
                    <div className="font-semibold">
                      <span className="px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded mr-2">
                        {c.code}
                      </span>
                      {c.label}
                    </div>
                    {c.note && <div className="text-gray-600">{c.note}</div>}
                    {c.expires && (
                      <div className="text-gray-500 text-xs">
                        HSD: {c.expires}
                      </div>
                    )}
                  </div>
                  <div className="ml-auto">
                    <CopyBadge code={c.code} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Partner */}
        {partnerDeals.length > 0 && (
          <div>
            <div className="font-medium mb-2">Ưu đãi đối tác</div>
            <ul className="space-y-2">
              {partnerDeals.map((p, i) => (
                <li key={i} className="border rounded-lg p-3 bg-white">
                  <div className="font-semibold">{p.partner}</div>
                  <div className="text-gray-600">{p.label}</div>
                  {p.note && <div className="text-gray-500 text-xs">{p.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Gifts */}
        {gifts.length > 0 && (
          <div className="md:col-span-2">
            <div className="font-medium mb-2">Quà tặng kèm</div>
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {gifts.map((g, i) => (
                <li key={i} className="border rounded-lg p-3 bg-white">
                  <div className="font-semibold">{g.title}</div>
                  {g.value && (
                    <div className="text-red-600 text-sm">Trị giá {fmtVND(g.value)}</div>
                  )}
                  {g.note && <div className="text-gray-600 text-sm">{g.note}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Combo save */}
        {comboText && (
          <div className="md:col-span-2">
            <div className="rounded-lg p-3 bg-white border border-dashed">
              <div className="font-medium">
                🔗 {comboText}
              </div>
              <div className="text-sm text-gray-700">
                Giá dự kiến khi áp dụng combo:{" "}
                <span className="font-semibold text-red-600">
                  {fmtVND(comboPrice)}
                </span>{" "}
                (từ {fmtVND(basePrice)}).
              </div>
              <div className="text-xs text-gray-500">
                Áp dụng khi thêm phụ kiện đủ điều kiện vào cùng đơn.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
