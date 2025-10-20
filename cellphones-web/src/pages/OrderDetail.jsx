// src/pages/OrderDetail.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderDetail, cancelOrder, vnpayCreate } from "../services/api";

const fVND = (n) => (Number(n || 0)).toLocaleString("vi-VN") + " ₫";
const fDateTime = (s) => (s ? new Date(s).toLocaleString("vi-VN") : "—");

const STATUS = {
  pending:    { label: "Chờ xác nhận",    tone: "bg-amber-100 text-amber-800 border-amber-200" },
  processing: { label: "Đang xử lý",      tone: "bg-blue-100 text-blue-800 border-blue-200" },
  shipping:   { label: "Đang vận chuyển", tone: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  completed:  { label: "Hoàn tất",        tone: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  cancelled:  { label: "Đã huỷ",          tone: "bg-rose-100 text-rose-800 border-rose-200" },
  refunded:   { label: "Đã hoàn tiền",    tone: "bg-zinc-100 text-zinc-800 border-zinc-200" },
};

const STEP_ORDER = ["pending","processing","shipping","completed"];

function StatusPill({ status }) {
  const s = STATUS[status] || { label: status, tone: "bg-zinc-100 text-zinc-800 border-zinc-200" };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-sm border ${s.tone}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {s.label}
    </span>
  );
}

function resolveImg(u) {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
}

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getOrderDetail(id);
        if (mounted) setOrder(data);
      } catch (e) {
        console.error(e);
        navigate("/orders");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id, navigate]);

  const canCancel = order?.status === "pending";
  const canPayNow =
    order?.status === "pending" &&
    (order?.payment_method || "").toLowerCase().includes("vnpay") &&
    String(order?.payment_status || "").toLowerCase() !== "paid";

  const steps = useMemo(() => {
    if (!order) return [];
    const map = {
      created_at:  { key: "pending",    at: order.created_at },
      confirmed_at:{ key: "processing", at: order.confirmed_at || order.updated_at },
      shipped_at:  { key: "shipping",   at: order.shipped_at },
      delivered_at:{ key: "completed",  at: order.delivered_at },
      cancelled_at:{ key: "cancelled",  at: order.cancelled_at },
      refunded_at: { key: "refunded",   at: order.refunded_at },
    };
    const arr = STEP_ORDER.map(k => ({ key: k, at: Object.values(map).find(m => m.key === k)?.at || null }));
    if (order.status === "cancelled") arr.push({ key: "cancelled", at: map.cancelled_at.at });
    if (order.status === "refunded")  arr.push({ key: "refunded",  at: map.refunded_at.at });
    return arr.filter(Boolean);
  }, [order]);

  const onCancel = async () => {
    if (!canCancel) return;
    if (!confirm("Bạn có chắc muốn huỷ đơn này?")) return;
    try {
      setWorking(true);
      const { data } = await cancelOrder(order.id);
      setOrder(data);
    } catch (e) {
      alert(e?.response?.data?.message || "Huỷ đơn thất bại.");
    } finally {
      setWorking(false);
    }
  };

  const onPayNow = async () => {
    try {
      setWorking(true);
      const { data } = await vnpayCreate(order.id);
      const url = data?.url || data?.payment_url;
      if (url) window.location.href = url;
      else alert("Không nhận được URL thanh toán.");
    } catch (e) {
      alert(e?.response?.data?.message || "Không thể tạo phiên thanh toán.");
    } finally {
      setWorking(false);
    }
  };

  const copyCode = () => {
    if (!order) return;
    navigator.clipboard?.writeText(order.code || `ORD${order.id}`);
  };

  if (loading || !order) {
    return <div className="max-w-5xl mx-auto p-6">Đang tải chi tiết đơn hàng…</div>;
  }

  const items = Array.isArray(order.items) ? order.items : [];
  const subtotal = Number(order.subtotal ?? items.reduce((s, it) => s + (Number(it.final_price ?? it.price) * Number(it.qty ?? 1)), 0));
  const discount = Number(order.discount ?? 0);
  const shipping = Number(order.shipping ?? 0);
  const total = Number(order.total ?? subtotal - discount + shipping);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .card { box-shadow: none !important; border: 1px solid #e5e7eb; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }
      `}</style>

      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-5 card">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold">
                Đơn hàng #{order.code || `ORD${order.id}`}
              </h1>
              <button
                onClick={copyCode}
                className="no-print text-sm text-blue-600 hover:underline"
                title="Sao chép mã đơn"
              >
                Sao chép
              </button>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <StatusPill status={order.status} />
              {order.payment_status && (
                <>
                  <span className="opacity-60">•</span>
                  <span>Thanh toán:</span>
                  <StatusPill status={String(order.payment_status).toLowerCase()} />
                </>
              )}
              <span className="opacity-60">•</span>
              <span>Tạo lúc {fDateTime(order.created_at)}</span>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <Link to="/orders" className="px-3 py-2 border rounded-md">Danh sách đơn</Link>
            <Link to="/" className="px-3 py-2 border rounded-md">Tiếp tục mua</Link>
            <button onClick={() => window.print()} className="px-3 py-2 border rounded-md">
              In hoá đơn
            </button>
            {canPayNow && (
              <button
                onClick={onPayNow}
                disabled={working}
                className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md disabled:opacity-60"
              >
                {working ? "Đang xử lý…" : "Thanh toán ngay"}
              </button>
            )}
            {canCancel && (
              <button
                onClick={onCancel}
                disabled={working}
                className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-md disabled:opacity-60"
              >
                {working ? "Đang huỷ…" : "Huỷ đơn"}
              </button>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-5">
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {steps.map((s, idx) => {
              const activeIdx = Math.max(0, STEP_ORDER.indexOf(order.status));
              const isDone   = STEP_ORDER.indexOf(s.key) <= activeIdx && order.status !== "cancelled" && order.status !== "refunded";
              const isLast   = idx === steps.length - 1;
              const label    = STATUS[s.key]?.label || s.key;
              return (
                <div key={idx} className="flex items-center gap-3 min-w-max">
                  <div className="text-center">
                    <div className={`h-8 w-8 rounded-full border grid place-items-center text-xs ${isDone ? "bg-black text-white border-black" : "bg-white text-gray-500"}`}>
                      {idx + 1}
                    </div>
                    <div className="text-xs mt-1 font-medium">{label}</div>
                    <div className="text-[11px] text-gray-500">{s.at ? fDateTime(s.at) : ""}</div>
                  </div>
                  {!isLast && <div className={`h-[2px] w-16 md:w-24 ${isDone ? "bg-black" : "bg-gray-200"}`} />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border p-5 card">
            <div className="font-semibold mb-2">Thông tin nhận hàng</div>
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-500">Người nhận:</span> <span className="font-medium">{order.name}</span></div>
              <div><span className="text-gray-500">Điện thoại:</span> {order.phone}</div>
              <div><span className="text-gray-500">Địa chỉ:</span> {order.address}</div>
              {order.note && <div><span className="text-gray-500">Ghi chú:</span> {order.note}</div>}
              <div className="pt-2 text-gray-600">
                Vận chuyển: <span className="font-medium">{order.shipping_method || "standard"}</span> ·
                Thanh toán: <span className="font-medium">{order.payment_method || "cod"}</span>
                {order.tracking_code && (
                  <>
                    <br />
                    Mã vận đơn: <span className="font-mono">{order.tracking_code}</span>
                    {order.tracking_url && (
                      <> · <a href={order.tracking_url} target="_blank" rel="noreferrer" className="text-blue-600 underline">Theo dõi</a></>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-5 card">
            <div className="font-semibold mb-2">Tóm tắt thanh toán</div>
            <div className="space-y-2 text-sm">
              <Row k="Tạm tính" v={fVND(subtotal)} />
              <Row k="Giảm giá" v={`-${fVND(discount)}`} />
              <Row k="Phí vận chuyển" v={fVND(shipping)} />
              {order.coupon_code && (
                <Row k="Mã giảm giá" v={<span className="px-2 py-0.5 rounded bg-gray-100 border">{order.coupon_code}</span>} />
              )}
              <div className="border-t pt-2" />
              <Row k={<span className="font-semibold">Tổng thanh toán</span>} v={<span className="font-semibold text-lg">{fVND(total)}</span>} />
              {order.payment_status && (
                <Row k="Trạng thái thanh toán" v={<StatusPill status={String(order.payment_status).toLowerCase()} />} />
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-5 card">
            <div className="font-semibold mb-2">Hỗ trợ</div>
            <div className="text-sm text-gray-600">
              Cần trợ giúp? Liên hệ <a className="text-blue-600 underline" href="tel:18002097">1800 2097</a> hoặc nhắn qua fanpage.
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-5 card">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold">Sản phẩm ({items.length})</div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-2 pr-3">Sản phẩm</th>
                    <th className="py-2 px-3">Đơn giá</th>
                    <th className="py-2 px-3 text-center">SL</th>
                    <th className="py-2 pl-3 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const price = Number(it.final_price ?? it.price ?? 0);
                    const qty = Number(it.qty ?? 1);
                    const line = price * qty;
                    return (
                      <tr key={it.id} className="border-b last:border-0">
                        <td className="py-3 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              alt=""
                              src={resolveImg(it.image_url)}
                              className="w-14 h-14 rounded object-cover bg-gray-100"
                              onError={(e) => { e.currentTarget.src = "https://dummyimage.com/56x56/eee/aaa&text=—"; }}
                            />
                            <div>
                              <div className="font-medium">{it.name}</div>
                              {it.variant_name && (
                                <div className="text-xs text-gray-500">Biến thể: {it.variant_name}</div>
                              )}
                              {it.variant_sku && (
                                <div className="text-[11px] text-gray-500">SKU: {it.variant_sku}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3">{fVND(price)}</td>
                        <td className="py-3 px-3 text-center">{qty}</td>
                        <td className="py-3 pl-3 text-right font-medium">{fVND(line)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile totals */}
            <div className="mt-4 md:hidden text-sm space-y-1">
              <Row k="Tạm tính" v={fVND(subtotal)} />
              <Row k="Giảm giá" v={`-${fVND(discount)}`} />
              <Row k="Phí vận chuyển" v={fVND(shipping)} />
              <div className="border-t pt-2" />
              <Row k={<span className="font-semibold">Tổng</span>} v={<span className="font-semibold">{fVND(total)}</span>} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{k}</span>
      <span>{v}</span>
    </div>
  );
}
