// src/pages/Orders.jsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders /*, cancelOrder */ } from "../services/api";
import useToast from "../components/Toast";

// ===== Utils =====
const fVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";
const fDateTime = (d) =>
  d ? new Date(d).toLocaleString("vi-VN", { hour12: false }) : "—";

const STATUS_META = {
  pending: { label: "Chờ thanh toán", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  paid: { label: "Đã thanh toán", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  cancelled: { label: "Đã hủy", cls: "bg-gray-100 text-gray-600 ring-gray-200" },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status || "khác", cls: "bg-gray-50 text-gray-600 ring-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${meta.cls}`}>
      <span className={`inline-block size-1.5 rounded-full ${status === "paid" ? "bg-emerald-600" : status === "pending" ? "bg-amber-500" : "bg-gray-400"}`} />
      {meta.label}
    </span>
  );
};

function OrdersSkeleton() {
  const Row = () => (
    <div className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-4 w-44 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-56 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="h-8 w-28 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Row key={i} />
      ))}
    </div>
  );
}

export default function Orders() {
  const [raw, setRaw] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const toast = useToast();

  // UI state
  const [q, setQ] = useState(""); // search code/id
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("newest");
  const [visible, setVisible] = useState(10); // simple load more if API không phân trang

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await getOrders();
        if (!mounted) return;
        setRaw(res?.data || null);
      } catch (e) {
        setErr("Không tải được danh sách đơn hàng");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const orders = useMemo(() => {
    const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : [];
    let out = list.map((o) => ({
      id: o.id,
      code: o.code || `DH${o.id}`,
      status: o.status,
      total: Number(o.total || 0),
      created_at: o.created_at,
      items_count: o.items_count ?? (Array.isArray(o.items) ? o.items.length : undefined),
      payment_method: o.payment_method,
      shipping_name: o.shipping_name || o.receiver_name,
      shipping_phone: o.shipping_phone || o.receiver_phone,
      shipping_address: o.shipping_address,
    }));

    // filter status
    if (status !== "all") out = out.filter((x) => x.status === status);

    // search by code/id
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      out = out.filter((x) => String(x.code).toLowerCase().includes(k) || String(x.id).includes(k));
    }

    // sort
    out.sort((a, b) => {
      switch (sortKey) {
        case "total_desc":
          return b.total - a.total;
        case "total_asc":
          return a.total - b.total;
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        case "newest":
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return out;
  }, [raw, q, status, sortKey]);

  const hasMore = useMemo(() => {
    // Nếu BE trả meta.has_more thì ưu tiên dùng
    if (raw?.meta?.has_more != null) return !!raw.meta.has_more;
    return orders.length > visible;
  }, [raw, orders.length, visible]);

  const displayed = useMemo(() => {
    if (raw?.meta?.has_more != null) return orders; // không cắt nếu có phân trang server
    return orders.slice(0, visible);
  }, [orders, raw, visible]);

  const handleCancel = async (id) => {
    if (!confirm("Bạn chắc muốn hủy đơn này?")) return;
    try {
      // await cancelOrder(id);
      // Sau khi có API, thay bằng call trên và refetch.
      toast.success("(Demo) Đã gửi yêu cầu hủy đơn #" + id);
    } catch (e) {
      toast.error("Hủy đơn thất bại");
    }
  };

  // ===== Render =====
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <div className="h-10 w-56 rounded bg-gray-100 animate-pulse" />
        </div>
        <OrdersSkeleton />
      </div>
    );
  }

  if (err) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center rounded-3xl p-12 bg-white ring-1 ring-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-red-600">{err}</p>
          <button onClick={() => location.reload()} className="mt-4 rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
        <div className="text-center rounded-3xl p-12 bg-white ring-1 ring-gray-100 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">Đơn hàng của tôi</h1>
          <p className="text-gray-600 mb-6">Bạn chưa có đơn hàng nào.</p>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-white shadow-sm hover:bg-red-700">
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Header + Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">Đơn hàng của tôi</h1>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 ring-1 ring-gray-200">
            {orders.length} đơn
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm theo mã đơn / ID"
            className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-red-400 focus:ring-red-400"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-red-400 focus:ring-red-400"
            title="Trạng thái"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="pending">Chờ thanh toán</option>
            <option value="paid">Đã thanh toán</option>
            <option value="cancelled">Đã hủy</option>
          </select>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            className="rounded-xl border-gray-300 text-sm shadow-sm focus:border-red-400 focus:ring-red-400"
            title="Sắp xếp"
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="total_desc">Tổng cao → thấp</option>
            <option value="total_asc">Tổng thấp → cao</option>
          </select>
        </div>
      </div>

      {/* List (cards) */}
      <div className="space-y-3">
        {displayed.map((o) => (
          <div key={o.id} className="rounded-2xl p-4 bg-white ring-1 ring-gray-100 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center flex-wrap gap-2">
                  <span className="font-semibold">#{o.code}</span>
                  <StatusBadge status={o.status} />
                </div>
                <div className="mt-1 text-sm text-gray-600">
                  Ngày tạo: {fDateTime(o.created_at)}
                  {typeof o.items_count === "number" && (
                    <>
                      {" · "}Sản phẩm: <b>{o.items_count}</b>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  Tổng tiền: <b className="text-gray-900">{fVND(o.total)}</b>
                </div>
                {o.payment_method && (
                  <div className="text-xs text-gray-500">Thanh toán: {o.payment_method}</div>
                )}
                {o.shipping_address && (
                  <div className="mt-1 text-xs text-gray-500">
                    Giao đến: {o.shipping_name ? `${o.shipping_name} · ` : ""}
                    {o.shipping_phone ? `${o.shipping_phone} · ` : ""}
                    {o.shipping_address}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                {o.status === "pending" && (
                  <button
                    onClick={() => handleCancel(o.id)}
                    className="px-3 py-2 rounded-xl border text-red-600 hover:bg-red-50"
                    title="Hủy đơn"
                  >
                    Hủy
                  </button>
                )}
                <Link
                  to={`/order/${o.id}`}
                  className="px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 shadow-sm"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load more (client-side) */}
      {hasMore && raw?.meta?.has_more == null && (
        <div className="mt-4 flex justify-center">
          <button
            onClick={() => setVisible((v) => v + 10)}
            className="rounded-xl border px-4 py-2 text-sm hover:bg-gray-50"
          >
            Tải thêm
          </button>
        </div>
      )}

      {/* Server-side pagination controls if available */}
      {raw?.meta?.has_more && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Đang sử dụng phân trang phía máy chủ – vui lòng thêm nút "Tải thêm" theo API (page, per_page).
        </div>
      )}
    </div>
  );
}
