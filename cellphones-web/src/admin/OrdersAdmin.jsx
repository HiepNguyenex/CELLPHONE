import { useEffect, useState, useRef, Fragment } from "react";
import {
  adminGetOrders,
  adminGetOrder,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminDownloadInvoice,
} from "../services/api";
import api from "../services/api";
import { Dialog, Transition } from "@headlessui/react";
import {
  X, Printer, Copy, User, MapPin, Mail, Phone, Package, Truck,
  DollarSign, Trash2, Download,
  Loader2, CheckCircle2, ShoppingBag, XCircle, CreditCard, RotateCcw, CircleDollarSign,
} from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";

/* ================== Helpers ================== */
const money = (v) => `${(Number(v) || 0).toLocaleString("vi-VN")}₫`;
const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");

/* ================== STATUS SETTINGS ================== */
const STATUS_FLOW = [
  "pending",
  "paid",
  "processing",
  "shipping",
  "shipped",
  "completed",
  "canceled",
  "refunded",
];

// Thêm label + icon + màu để hiển thị đẹp
const STATUS_INFO = {
  pending:    { label: "🕓 Chờ xử lý",     color: "bg-yellow-100 text-yellow-800 border-yellow-300",   icon: Loader2 },
  paid:       { label: "💸 Đã thanh toán", color: "bg-emerald-100 text-emerald-800 border-emerald-300", icon: CreditCard },
  processing: { label: "⚙️ Đang xử lý",    color: "bg-blue-100 text-blue-800 border-blue-300",         icon: CircleDollarSign },
  shipping:   { label: "🚚 Đang giao",     color: "bg-purple-100 text-purple-800 border-purple-300",   icon: Truck },
  shipped:    { label: "📦 Đã gửi",         color: "bg-indigo-100 text-indigo-800 border-indigo-300",   icon: ShoppingBag },
  completed:  { label: "✅ Hoàn tất",       color: "bg-green-100 text-green-800 border-green-300",      icon: CheckCircle2 },
  canceled:   { label: "❌ Đã huỷ",         color: "bg-red-100 text-red-800 border-red-300",            icon: XCircle },
  refunded:   { label: "↩️ Hoàn tiền",     color: "bg-gray-200 text-gray-700 border-gray-300",         icon: RotateCcw },
};

const STATUS_BADGE = {
  pending: "bg-yellow-100 text-yellow-800",
  paid: "bg-emerald-100 text-emerald-800",
  processing: "bg-blue-100 text-blue-800",
  shipping: "bg-purple-100 text-purple-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  canceled: "bg-red-100 text-red-800",
  refunded: "bg-gray-200 text-gray-700",
};

const CAN_DELETE = (s) => ["pending", "canceled"].includes(s);

/* ================== Simple Toast ================== */
const TYPE_STYLE = {
  info: { dot: "bg-blue-500", title: "Thông báo" },
  success: { dot: "bg-emerald-500", title: "Thành công" },
  error: { dot: "bg-rose-500", title: "Lỗi" },
  warning: { dot: "bg-amber-500", title: "Cảnh báo" },
  loading: { dot: "bg-gray-400", title: "Đang xử lý…" },
};

function ToastItem({ t, onClose }) {
  const s = TYPE_STYLE[t.type] || TYPE_STYLE.info;
  return (
    <div className="w-80 bg-white border rounded-xl shadow-lg p-3 flex gap-3 items-start">
      <span className={`mt-1 h-2.5 w-2.5 rounded-full ${s.dot} ${t.type==='loading'?'animate-pulse':''}`} />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-gray-900">{t.title || s.title}</div>
        {t.desc && <div className="text-xs text-gray-600 mt-0.5 break-words">{t.desc}</div>}
      </div>
      <div className="flex items-center gap-2">
        {t.action?.label && typeof t.action.onClick === "function" && (
          <button className="px-2 py-1 text-xs rounded border hover:bg-gray-50" onClick={t.action.onClick}>
            {t.action.label}
          </button>
        )}
        <button className="text-gray-400 hover:text-gray-700 rounded px-1 leading-none" onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

function ToastContainer({ toasts, remove }) {
  return (
    <div className="fixed z-[9999] top-4 right-4 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem t={t} onClose={() => remove(t.id)} />
        </div>
      ))}
    </div>
  );
}

/* ================== PAGE ================== */
export default function OrdersAdmin() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: "", status: "" });

  const [open, setOpen] = useState(false);
  const [detail, setDetail] = useState(null);

  const [updating, setUpdating] = useState(false);
  const [statusModal, setStatusModal] = useState({ open: false, order: null });

  const [delModal, setDelModal] = useState({ open: false, order: null });

  // toast state
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);
  const timers = useRef(new Map());
  const removeToast = (id) => {
    setToasts((p) => p.filter((x) => x.id !== id));
    const tm = timers.current.get(id);
    if (tm) { clearTimeout(tm); timers.current.delete(id); }
  };
  const addToast = (t) => {
    const id = ++toastId.current;
    const rec = { id, duration: t.type === "loading" ? null : 3500, ...t };
    setToasts((p) => [...p, rec]);
    if (rec.duration) {
      const tm = setTimeout(() => removeToast(id), rec.duration);
      timers.current.set(id, tm);
    }
    return id;
  };
  const updateToast = (id, patch) => {
    setToasts((p) => p.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    const dur = patch.duration ?? (patch.type && patch.type !== "loading" ? 3500 : null);
    if (dur) {
      const tm = setTimeout(() => removeToast(id), dur);
      const old = timers.current.get(id);
      if (old) clearTimeout(old);
      timers.current.set(id, tm);
    }
  };

  // ==== LOAD LIST ====
  const load = async () => {
    setLoading(true);
    try {
      const res = await adminGetOrders({
        q: filters.q || undefined,
        status: filters.status || undefined,
      });
      const data = res?.data?.data ?? res?.data ?? [];
      setList(Array.isArray(data) ? data : data?.data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []); // first load

  const search = async () => load();

  // ==== OPEN DETAIL ====
  const openDetail = async (id) => {
    const res = await adminGetOrder(id);
    setDetail(res?.data);
    setOpen(true);
  };

  // ==== SAVE STATUS ====
  async function saveStatus(newStatus, note) {
    if (!statusModal.order) return;
    if (!newStatus) return addToast({ type: "warning", desc: "Vui lòng chọn trạng thái hợp lệ!" });
    setUpdating(true);
    const t = addToast({ type: "loading", title: "Đang cập nhật trạng thái…" });
    try {
      await adminUpdateOrderStatus(statusModal.order.id, newStatus, note);
      const res = await adminGetOrder(statusModal.order.id);
      setDetail(res?.data);
      await load();
      setStatusModal({ open: false, order: null });
      updateToast(t, { type: "success", title: "Đã cập nhật trạng thái" });
    } catch (e) {
      updateToast(t, {
        type: "error",
        title: "Không thể cập nhật",
        desc: e?.response?.data?.message || e.message || "Vui lòng thử lại.",
      });
    } finally {
      setUpdating(false);
    }
  }

  // ==== DELETE ORDER ====
  async function doDelete() {
    if (!delModal.order) return;
    const t = addToast({ type: "loading", title: "Đang xoá đơn…" });
    try {
      await adminDeleteOrder(delModal.order.id);
      const deletedId = delModal.order.id;
      setDelModal({ open: false, order: null });
      if (open && detail?.id === deletedId) setOpen(false);
      await load();
      updateToast(t, { type: "success", title: "Đã xoá đơn hàng" });
    } catch (e) {
      updateToast(t, {
        type: "error",
        title: "Xoá đơn thất bại",
        desc: e?.response?.data?.message || e.message || "",
      });
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">🧾 Quản lý đơn hàng</h2>

      {/* Quick filter chips (lọc nhanh theo trạng thái) */}
      <div className="flex flex-wrap gap-2 mb-3">
        {STATUS_FLOW.map((st) => {
          const s = STATUS_INFO[st];
          const active = filters.status === st;
          return (
            <button
              key={st}
              onClick={() =>
                setFilters((f) => ({ ...f, status: f.status === st ? "" : st }))
              }
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                active
                  ? `${s.color} ring-2 ring-offset-1`
                  : "bg-white hover:bg-gray-50"
              }`}
              title={`Lọc: ${s.label}`}
            >
              {s.icon && <s.icon size={14} className="inline mr-1" />} {s.label}
            </button>
          );
        })}
      </div>

      {/* Filters (giữ bộ lọc cũ) */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          value={filters.q}
          onChange={(e) => setFilters({ ...filters, q: e.target.value })}
          placeholder="Tìm theo ID, mã đơn, email, sđt..."
          className="border rounded px-3 py-2 w-72"
        />
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="border rounded px-3 py-2"
        >
          <option value="">-- Tất cả trạng thái --</option>
          {STATUS_FLOW.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <button
          onClick={search}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tìm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Khách hàng</th>
              <th className="p-3 text-left">Tổng</th>
              <th className="p-3 text-left">Trạng thái</th>
              <th className="p-3 text-left">Thời gian</th>
              <th className="p-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Đang tải...</td></tr>
            )}
            {!loading && list.map((o) => {
              const s = STATUS_INFO[o.status] || {};
              return (
                <tr key={o.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">#{o.id}</td>
                  <td className="p-3">
                    {o.name || o.user?.name || "Khách"}
                    <br /><span className="text-gray-500 text-xs">{o.email || o.user?.email || ""}</span>
                  </td>
                  <td className="p-3 text-red-600 font-semibold">{money(o.total)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${s.color || STATUS_BADGE[o.status] || "bg-gray-100 text-gray-700"}`}
                      title={o.status}
                    >
                      {s.label || o.status}
                    </span>
                  </td>
                  <td className="p-3">{fmt(o.created_at)}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openDetail(o.id)}
                        className="px-3 py-2 bg-gray-800 text-white rounded hover:bg-black"
                      >
                        Chi tiết
                      </button>
                      <button
                        disabled={["completed", "canceled", "refunded"].includes(o.status)}
                        onClick={() => setStatusModal({ open: true, order: o })}
                        className={`px-3 py-2 rounded text-white ${
                          ["completed","canceled","refunded"].includes(o.status)
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                        }`}
                      >
                        Cập nhật
                      </button>
                      <button
                        disabled={!CAN_DELETE(o.status)}
                        onClick={() => setDelModal({ open: true, order: o })}
                        className={`px-3 py-2 rounded text-white ${
                          CAN_DELETE(o.status)
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-gray-400 cursor-not-allowed"
                        }`}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {!loading && !list.length && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-500">Không có đơn nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      <OrderDetailModal
        open={open}
        onClose={() => setOpen(false)}
        order={detail}
        onAskDelete={() => setDelModal({ open: true, order: detail })}
        addToast={addToast}
        updateToast={updateToast}
        removeToast={removeToast}
      />

      {/* Update Status Modal */}
      <UpdateStatusModal
        open={statusModal.open}
        onClose={() => setStatusModal({ open: false, order: null })}
        onSave={saveStatus}
        current={statusModal.order?.status}
        saving={updating}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        open={delModal.open}
        title={`Xoá đơn hàng #${delModal.order?.id ?? ""}`}
        message="Hành động này không thể khôi phục. Chỉ đơn pending/canceled mới được xoá."
        confirmText="Xoá"
        cancelText="Huỷ"
        theme="danger"
        onClose={() => setDelModal({ open: false, order: null })}
        onConfirm={doDelete}
      />

      {/* Toasts */}
      <ToastContainer toasts={toasts} remove={removeToast} />
    </div>
  );
}

/* ============= Line helper ============= */
function Line({ label, children, icon: Icon }) {
  return (
    <div className="flex items-start gap-2">
      {Icon && <Icon size={16} className="mt-1 text-gray-500" />}
      <div className="text-xs text-gray-500 w-28">{label}</div>
      <div className="text-sm">{children}</div>
    </div>
  );
}

/* ============= Order Detail Modal ============= */
function OrderDetailModal({ open, onClose, order, onAskDelete, addToast, updateToast }) {
  const _onClose = typeof onClose === "function" ? onClose : () => {};
  if (!order) return null;

  async function downloadInvoice() {
    const tid = addToast({ type: "loading", title: "Đang tạo PDF…" });
    try {
      const res = await adminDownloadInvoice(order.id);
      const dispo = res.headers?.["content-disposition"] || "";
      const m = /filename\*?=(?:UTF-8'')?"?([^"]+)"?/i.exec(dispo);
      const filename = decodeURIComponent(m?.[1] || `invoice-${order.code || order.id}.pdf`);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      setTimeout(() => URL.revokeObjectURL(url), 15000);
      updateToast(tid, { type: "success", title: "Đã tải hóa đơn", desc: filename, action: { label: "Mở", onClick: () => window.open(url, "_blank") } });
    } catch (e) {
      const msg = String(e?.message || e);
      if (/ERR_BLOCKED_BY_CLIENT/i.test(msg)) {
        const directUrl = `${api.defaults.baseURL}/v1/admin/orders/${order.id}/invoice`;
        window.open(directUrl, "_blank");
        updateToast(tid, { type: "warning", title: "Đang tải qua IDM/AdBlock", desc: "Nếu không thấy, tắt AdBlock/IDM cho localhost & 127.0.0.1." });
        return;
      }
      updateToast(tid, { type: "error", title: "Tải hoá đơn thất bại", desc: e?.response?.data?.message || e?.message || "Vui lòng thử lại." });
    }
  }

  const totals = [
    { k: "Tạm tính", v: order.subtotal },
    { k: "Phí vận chuyển", v: order.shipping },
    { k: "Giảm giá", v: -Math.abs(order.discount || 0) },
    { k: "Tổng tiền", v: order.total, strong: true },
  ];
  const copyAddr = () => navigator.clipboard?.writeText(order.address || "");

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog open={open} onClose={_onClose} className="relative z-50">
        <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/40" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child as={Fragment} enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100" leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95">
            <Dialog.Panel className="w-full max-w-4xl bg-white rounded-2xl shadow-xl">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <Dialog.Title className="text-xl font-semibold">Đơn #{order.id}</Dialog.Title>
                  <div className="mt-1 flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[order.status] || "bg-gray-100 text-gray-700"}`}>{order.status}</span>
                    <span className="text-xs text-gray-500">Tạo lúc: {fmt(order.created_at)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadInvoice} className="px-3 py-2 rounded border hover:bg-gray-50 flex items-center gap-2"><Download size={16}/> Tải PDF</button>
                  <button onClick={() => window.print()} className="px-3 py-2 rounded border hover:bg-gray-50 flex items-center gap-2"><Printer size={16} /> In hóa đơn</button>
                  <button disabled={!CAN_DELETE(order.status)} onClick={onAskDelete} className={`px-3 py-2 rounded border flex items-center gap-2 ${CAN_DELETE(order.status) ? "text-red-600 border-red-200 hover:bg-red-50" : "text-gray-400 cursor-not-allowed"}`}><Trash2 size={16} /> Xóa đơn</button>
                  <button onClick={_onClose} className="p-2 rounded hover:bg-gray-100"><X size={18} /></button>
                </div>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2 font-medium"><User size={16} /> Khách hàng</div>
                    <Line label="Họ tên" icon={User}>{order.name || order.user?.name || "Khách"}</Line>
                    <Line label="Email" icon={Mail}>{order.email || order.user?.email || "—"}</Line>
                    <Line label="Điện thoại" icon={Phone}>{order.phone || "—"}</Line>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2 font-medium"><MapPin size={16} /> Địa chỉ giao hàng</div>
                    <div className="text-sm">{order.address || "—"}</div>
                    <button onClick={copyAddr} className="mt-2 inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"><Copy size={14} /> Sao chép</button>
                  </div>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2 font-medium"><DollarSign size={16} /> Thanh toán & vận chuyển</div>
                    <Line label="Thanh toán">{order.payment_method || "—"}</Line>
                    <Line label="Vận chuyển" icon={Truck}>{order.shipping_method || "—"}</Line>
                  </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                  <div className="border rounded-lg overflow-hidden">
                    <div className="px-4 py-3 border-b font-medium flex items-center gap-2"><Package size={16} /> Sản phẩm</div>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="p-3 text-left">Sản phẩm</th>
                          <th className="p-3 text-center w-20">SL</th>
                          <th className="p-3 text-right w-32">Đơn giá</th>
                          <th className="p-3 text-right w-32">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.items || []).map((it) => (
                          <tr key={it.id} className="border-t">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img src={it.image_url || "https://dummyimage.com/48x48/eeeeee/000000&text=IMG"} alt={it.name} className="w-12 h-12 rounded object-cover" />
                                <div>
                                  <div className="font-medium">{it.name}</div>
                                  <div className="text-xs text-gray-500">#{it.product_id}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-center">{it.qty}</td>
                            <td className="p-3 text-right">{money(it.price)}</td>
                            <td className="p-3 text-right">{money(it.price * it.qty)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="w-full md:w-80 border rounded-lg ml-auto">
                    <div className="px-4 py-3 border-b font-medium">Tổng tiền</div>
                    <div className="p-4 space-y-2">
                      {totals.map((t) => (
                        <div key={t.k} className={`flex justify-between ${t.strong ? "text-base font-semibold" : "text-sm"}`}>
                          <span>{t.k}</span>
                          <span className={t.strong ? "text-red-600" : ""}>{money(t.v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}

/* ============= Update Status Modal ============= */
function UpdateStatusModal({ open, onClose, onSave, current, saving }) {
  const map = {
    pending: ["paid", "processing", "canceled"],
    paid: ["processing", "canceled"],
    processing: ["shipping", "canceled", "refunded"],
    shipping: ["shipped", "canceled", "refunded"],
    shipped: ["completed", "refunded"],
    completed: [],
    canceled: [],
    refunded: [],
  };
  const options = map[current] || [];
  const [status, setStatus] = useState(options[0] || "");
  const [note, setNote] = useState("");

  useEffect(() => {
    setStatus(options[0] || "");
    setNote("");
  }, [open, current]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-md p-5 space-y-4 shadow-lg">
        <div className="font-semibold text-lg">Cập nhật trạng thái</div>

        {options.length === 0 ? (
          <div className="text-sm text-gray-500">
            Đơn hàng đã hoàn tất hoặc bị huỷ/refund, không thể thay đổi trạng thái.
          </div>
        ) : (
          <>
            <select className="border rounded p-2 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
              {options.map((o) => (<option key={o} value={o}>{o}</option>))}
            </select>
            <textarea
              className="border rounded p-2 w-full"
              rows={4}
              placeholder="Ghi chú (tuỳ chọn)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button className="border px-4 py-2 rounded hover:bg-gray-50" onClick={onClose}>Huỷ</button>
          <button
            disabled={options.length === 0 || saving}
            className={`px-4 py-2 rounded text-white ${
              options.length === 0 || saving
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            onClick={() => onSave(status, note)}
          >
            {saving ? "Đang lưu..." : "Lưu"}
          </button>
        </div>
      </div>
    </div>
  );
}
