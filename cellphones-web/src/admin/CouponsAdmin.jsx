import { useEffect, useState } from "react";
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "../services/api";

const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN") : "");
const toInputDateTimeLocal = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  const pad = (n) => String(n).padStart(2, "0");
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(
    dt.getHours()
  )}:${pad(dt.getMinutes())}`;
};

export default function CouponsAdmin() {
  const [filters, setFilters] = useState({ q: "", active: "", per_page: 20, page: 1 });
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, current_page: 1, per_page: 20 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    code: "",
    discount: 10,
    max_uses: "",
    starts_at: "",
    expires_at: "",
    is_active: true, // Frontend state
  });

  const openCreate = () => {
    setEditing(null);
    setForm({
      code: "",
      discount: 10,
      max_uses: "",
      starts_at: "",
      expires_at: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      code: row.code,
      discount: row.discount,
      max_uses: row.max_uses || "",
      starts_at: row.starts_at ? toInputDateTimeLocal(row.starts_at) : "",
      expires_at: row.expires_at ? toInputDateTimeLocal(row.expires_at) : "",
      // ✅ FIX 2: Đồng bộ hóa khi EDIT. Kiểm tra 'status' từ Backend hoặc 'is_active' cũ
      is_active: row.status === 'active' || !!row.is_active,
    });
    setModalOpen(true);
  };

  const fetchList = () => {
    setLoading(true);
    setErr("");
    adminGetCoupons({
      q: filters.q || undefined,
      active: filters.active === "" ? undefined : filters.active,
      per_page: filters.per_page,
      page: filters.page,
    })
      .then((res) => {
        const payload = res?.data;
        const list = Array.isArray(payload?.data) ? payload.data : payload?.data?.data || [];
        const meta =
          payload?.meta ||
          payload ||
          { total: list.length, current_page: filters.page, per_page: filters.per_page };
        setData(list);
        setMeta({
          total: Number(meta.total ?? list.length),
          current_page: Number(meta.current_page ?? meta.page ?? 1),
          per_page: Number(meta.per_page ?? filters.per_page),
        });
      })
      .catch((e) => setErr(e?.response?.data?.message || "Không tải được danh sách coupons."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.per_page]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code.trim().toUpperCase(),
        discount: Number(form.discount),
        max_uses: form.max_uses ? Number(form.max_uses) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        // 🚀 FIX 1 (QUAN TRỌNG): Chuyển đổi is_active (boolean) thành status (string)
        // để thỏa mãn validation 'status' required của Laravel (lỗi 422).
        status: form.is_active ? 'active' : 'inactive', 
      };

      if (editing) {
        await adminUpdateCoupon(editing.id, payload);
      } else {
        await adminCreateCoupon(payload);
      }
      setModalOpen(false);
      fetchList();
    } catch (e2) {
      alert(e2?.response?.data?.message || "Lưu mã giảm giá thất bại.");
    }
  };

  const onDelete = async (row) => {
    if (!confirm(`Xoá coupon "${row.code}"?`)) return;
    try {
      await adminDeleteCoupon(row.id);
      fetchList();
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá thất bại.");
    }
  };

  const pages = Math.max(1, Math.ceil(meta.total / meta.per_page));

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-semibold mb-4">Quản lý mã giảm giá</h1>

      {/* Filters */}
      <div className="bg-white border rounded-2xl p-4 mb-4">
        <div className="grid md:grid-cols-6 gap-3">
          <input
            value={filters.q}
            onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
            placeholder="Tìm code…"
            className="border rounded-xl px-3 py-2"
          />
          <select
            value={filters.active}
            onChange={(e) => setFilters((f) => ({ ...f, active: e.target.value }))}
            className="border rounded-xl px-3 py-2"
          >
            <option value="">Trạng thái: Tất cả</option>
            <option value="1">Đang bật</option>
            <option value="0">Đang tắt</option>
          </select>
          <select
            value={filters.per_page}
            onChange={(e) => setFilters((f) => ({ ...f, per_page: Number(e.target.value), page: 1 }))}
            className="border rounded-xl px-3 py-2"
          >
            {[10, 20, 50, 100].map(n => <option key={n} value={n}>{n}/trang</option>)}
          </select>
          <div className="flex items-center gap-2">
            <button onClick={() => setFilters((f) => ({ ...f, page: 1 }))} className="px-4 py-2 rounded-xl bg-gray-900 text-white">
              Lọc
            </button>
            <button onClick={openCreate} className="px-4 py-2 rounded-xl border">
              + Thêm coupon
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-2xl overflow-x-auto">
        <table className="min-w-[1000px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left">
              <th className="p-3">ID</th>
              <th className="p-3">Code</th>
              <th className="p-3">% giảm</th>
              <th className="p-3">Đã dùng / Giới hạn</th>
              <th className="p-3">Bắt đầu</th>
              <th className="p-3">Hết hạn</th>
              <th className="p-3">Trạng thái</th>
              <th className="p-3">Cập nhật</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-4 text-gray-500">Đang tải…</td></tr>
            ) : err ? (
              <tr><td colSpan={9} className="p-4 text-red-600">Lỗi: {err}</td></tr>
            ) : data.length === 0 ? (
              <tr><td colSpan={9} className="p-4 text-gray-600">Không có coupon.</td></tr>
            ) : (
              data.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3 font-mono">{r.code}</td>
                  <td className="p-3">{r.discount}%</td>
                  <td className="p-3">{r.used} / {r.max_uses ?? "∞"}</td>
                  <td className="p-3 whitespace-nowrap">{fmt(r.starts_at)}</td>
                  <td className="p-3 whitespace-nowrap">{fmt(r.expires_at)}</td>
                  <td className="p-3">
                    {/* ✅ FIX 3: Sử dụng status từ Backend để hiển thị */}
                    {(() => {
                      const isActive = r.status === 'active' || !!r.is_active; // Hỗ trợ cả hai trường
                      return (
                        <span className={
                          "text-xs px-2 py-0.5 rounded-full border " +
                          (isActive ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-100 text-gray-600 border-gray-200")
                        }>
                          {isActive ? "Đang bật" : "Đang tắt"}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-3 whitespace-nowrap">{fmt(r.updated_at)}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => openEdit(r)} className="px-3 py-1.5 rounded-lg border mr-2">
                      Sửa
                    </button>
                    <button onClick={() => onDelete(r)} className="px-3 py-1.5 rounded-lg border text-red-600">
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-600">
          Tổng {meta.total} · Trang {meta.current_page}/{Math.max(1, Math.ceil(meta.total / meta.per_page))}
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={filters.page <= 1}
            onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
            className="px-3 py-2 rounded-xl border disabled:opacity-50"
          >
            Trước
          </button>
          <button
            disabled={filters.page >= Math.max(1, Math.ceil(meta.total / meta.per_page))}
            onClick={() => setFilters((f) => ({ ...f, page: Math.min(Math.max(1, Math.ceil(meta.total / meta.per_page)), f.page + 1) }))}
            className="px-3 py-2 rounded-xl border disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>

      {/* Modal create/update */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-xl rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">
                {editing ? `Sửa coupon #${editing.id}` : "Thêm coupon"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="px-3 py-1.5 border rounded-lg">Đóng</button>
            </div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Code</label>
                  <input
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">% giảm</label>
                  <input
                    type="number" min={1} max={100}
                    value={form.discount}
                    onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className="text-sm text-gray-600">Giới hạn lượt</label>
                  <input
                    type="number" min={1}
                    value={form.max_uses}
                    onChange={(e) => setForm((f) => ({ ...f, max_uses: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="VD 100, trống = ∞"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Bắt đầu</label>
                  <input
                    type="datetime-local"
                    value={form.starts_at}
                    onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Hết hạn</label>
                  <input
                    type="datetime-local"
                    value={form.expires_at}
                    onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value }))}
                    className="w-full border rounded-xl px-3 py-2"
                  />
                </div>
              </div>

              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={!!form.is_active}
                  onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
                />
                <span>Kích hoạt</span>
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl border">
                  Huỷ
                </button>
                <button type="submit" className="px-4 py-2 rounded-xl bg-gray-900 text-white">
                  {editing ? "Cập nhật" : "Tạo mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}