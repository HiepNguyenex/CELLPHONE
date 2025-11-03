import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const fVND = (n) => (Number(n || 0)).toLocaleString("vi-VN") + " ₫";
const FREE_SHIP_THRESHOLD = 300_000;

function resolveImg(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
}

// Giá hiển thị ưu tiên final_price -> sale_price -> price
const getUnitPrice = (it) =>
  Number(it?.final_price ?? it?.sale_price ?? it?.price ?? 0);

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);

  const summary = useMemo(() => {
    const items = cart || [];
    let subtotal = 0;
    let compareAt = 0; // tổng giá gốc để tính “tiết kiệm”
    let warranty = 0;

    items.forEach((it) => {
      const qty = Number(it.qty || 1);
      const unit = getUnitPrice(it);
      subtotal += unit * qty;

      const base = Number(it.price ?? unit);
      compareAt += base * qty;

      const w = Number(it?.services?.warranty_amount ?? 0);
      warranty += w * qty; // ⚡ tính theo số lượng
    });

    const discount = Math.max(compareAt - subtotal, 0);
    const shipping = subtotal >= FREE_SHIP_THRESHOLD ? 0 : 25_000; // demo phí ship
    const total = subtotal + shipping + warranty;

    return { items, subtotal, compareAt, discount, warranty, shipping, total };
  }, [cart]);

  const progressToFree = Math.min(
    100,
    Math.floor((summary.subtotal / FREE_SHIP_THRESHOLD) * 100)
  );

  const goCheckout = async () => {
    if (!user) return navigate("/login?next=/checkout");
    try {
      setCheckingOut(true);
      navigate("/checkout");
    } finally {
      setCheckingOut(false);
    }
  };

  if (!cart?.length) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-16 text-center">
        <div className="text-5xl mb-3">🛒</div>
        <h1 className="text-2xl font-bold mb-2">Giỏ hàng của bạn đang trống</h1>
        <p className="text-gray-600 mb-6">
          Hãy khám phá các sản phẩm hot và thêm vào giỏ nhé.
        </p>
        <Link
          to="/"
          className="inline-block bg-black text-white px-5 py-3 rounded-md"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng</h1>

      {/* Free shipping progress */}
      <div className="mb-5 rounded-lg border bg-white p-4">
        {summary.subtotal >= FREE_SHIP_THRESHOLD ? (
          <div className="text-emerald-700">
            ✅ Bạn đã đủ điều kiện <b>miễn phí vận chuyển</b>!
          </div>
        ) : (
          <>
            <div className="text-gray-700 mb-2">
              Mua thêm{" "}
              <b>{fVND(FREE_SHIP_THRESHOLD - summary.subtotal)}</b> để được{" "}
              <b>miễn phí vận chuyển</b>.
            </div>
            <div className="h-2 w-full bg-gray-200 rounded">
              <div
                className="h-2 bg-black rounded"
                style={{ width: `${progressToFree}%` }}
              />
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white">
            <ul className="divide-y">
              {cart.map((item) => {
                const unit = getUnitPrice(item);
                const base = Number(item.price ?? unit);
                const qty = Number(item.qty || 1);
                const line = unit * qty;
                const stock = Number(item.stock ?? 0);
                const maxQty = stock > 0 ? Math.min(stock, 99) : 99;
                const isMax = qty >= maxQty;
                const isMin = qty <= 1;

                const onChangeQty = (next) => {
                  const n = clampInt(next, 1, maxQty);
                  updateQty(item.lineId, n); // ⚡ Dùng lineId
                };

                return (
                  <li key={item.lineId} className="p-4 md:p-5">
                    <div className="flex items-start gap-4">
                      <img
                        src={resolveImg(item.image_url || item.image)}
                        alt=""
                        className="w-24 h-24 rounded object-cover bg-gray-100"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://dummyimage.com/120x120/eee/aaa&text=—";
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div>
                            <div className="font-medium line-clamp-2">
                              {item.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {item.variant_name && (
                                <>
                                  Biến thể: {item.variant_name}{" "}
                                  {item.variant_sku && <>· SKU: {item.variant_sku}</>}
                                </>
                              )}
                            </div>
                            {item?.services?.warranty_amount ? (
                              <div className="text-xs text-gray-500 mt-1">
                                Gói bảo hành:{" "}
                                {fVND(item.services.warranty_amount)}
                              </div>
                            ) : null}
                          </div>

                          <div className="text-right md:min-w-[160px]">
                            <div className="text-red-600 font-semibold">
                              {fVND(unit)}
                            </div>
                            {base > unit && (
                              <div className="text-xs text-gray-500 line-through">
                                {fVND(base)}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Qty + actions */}
                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <QtyControl
                            value={qty}
                            onChange={onChangeQty}
                            min={1}
                            max={maxQty}
                            disabledDecr={isMin}
                            disabledIncr={isMax}
                          />

                          <div className="text-right">
                            <div className="text-sm">
                              Thành tiền:{" "}
                              <span className="font-medium">{fVND(line)}</span>
                            </div>
                            <button
                              onClick={() =>
                                confirm("Xoá sản phẩm khỏi giỏ?") &&
                                removeFromCart(item.lineId) // ⚡ Dùng lineId
                              }
                              className="text-xs text-rose-600 hover:underline"
                            >
                              Xoá
                            </button>
                          </div>
                        </div>

                        {/* Low stock note */}
                        {stock > 0 && stock <= 3 && (
                          <div className="text-xs text-amber-600 mt-2">
                            ⚠️ Chỉ còn {stock} sản phẩm trong kho.
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="p-4 md:p-5 flex items-center justify-between">
              <Link to="/" className="text-sm underline">
                ← Tiếp tục mua sắm
              </Link>
              <button
                onClick={() =>
                  confirm("Xoá toàn bộ giỏ hàng?") && clearCart()
                }
                className="text-sm text-rose-600 hover:underline"
              >
                Xoá tất cả
              </button>
            </div>
          </div>
        </div>

        {/* Summary sticky */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-lg border bg-white p-4">
              <div className="font-semibold mb-3">Tóm tắt đơn hàng</div>
              <div className="space-y-2 text-sm">
                <Row k="Tạm tính" v={fVND(summary.subtotal)} />
                {summary.discount > 0 && (
                  <Row
                    k="Tiết kiệm"
                    v={<span className="text-emerald-700">-{fVND(summary.discount)}</span>}
                  />
                )}
                {summary.warranty > 0 && (
                  <Row k="Bảo hành mở rộng" v={fVND(summary.warranty)} />
                )}
                <Row k="Phí vận chuyển" v={fVND(summary.shipping)} />
                <div className="border-t pt-2" />
                <Row
                  k={<span className="font-semibold">Tổng cộng</span>}
                  v={<span className="font-semibold text-lg">{fVND(summary.total)}</span>}
                />
                <div className="text-[11px] text-gray-500">
                  Đã bao gồm VAT (nếu có)
                </div>
              </div>

              <button
                type="button"
                onClick={goCheckout}
                disabled={checkingOut}
                className="mt-4 w-full h-11 rounded-md bg-black text-white hover:opacity-90 disabled:opacity-50"
              >
                {checkingOut ? "Đang xử lý…" : "Thanh toán"}
              </button>
            </div>

            {/* Small tip / security */}
            <div className="rounded-lg border bg-white p-4 text-xs text-gray-600">
              🔒 Thanh toán bảo mật. Bạn có thể kiểm tra hàng trước khi nhận
              (tuỳ nhà vận chuyển).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- tiny components ---------- */

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{k}</span>
      <span>{v}</span>
    </div>
  );
}

function QtyControl({
  value,
  onChange,
  min = 1,
  max = 99,
  disabledDecr = false,
  disabledIncr = false,
}) {
  const set = (val) => onChange(clampInt(val, min, max));
  return (
    <div className="inline-flex items-center border rounded-md overflow-hidden">
      <button
        type="button"
        className="h-9 w-9 grid place-items-center disabled:opacity-40"
        onClick={() => set(value - 1)}
        disabled={disabledDecr}
        aria-label="Giảm 1"
      >
        −
      </button>
      <input
        className="h-9 w-12 text-center outline-none"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^\d]/g, "");
          set(raw === "" ? min : Number(raw));
        }}
        onBlur={(e) => set(Number(e.target.value || min))}
      />
      <button
        type="button"
        className="h-9 w-9 grid place-items-center disabled:opacity-40"
        onClick={() => set(value + 1)}
        disabled={disabledIncr}
        aria-label="Tăng 1"
      >
        +
      </button>
    </div>
  );
}

function clampInt(n, min, max) {
  const v = Math.max(min, Math.min(max, Number(n || 0)));
  return Number.isFinite(v) ? v : min;
}
