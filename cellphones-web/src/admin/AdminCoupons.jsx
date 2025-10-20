import { useEffect, useState } from "react";
import useToast from "../components/Toast";
import {
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from "../services/api";

const fVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

const EMPTY = {
  code: "",
  type: "percent",
  discount: 10,
  max_discount: 200000,
  min_order: 0,
  starts_at: "",
  expires_at: "",
  usage_limit: "",
  per_user_limit: "",
  brand_id: "",
  category_id: "",
  product_id: "",
  active: true,
};

export default function CouponsAdmin() {
  const toast = useToast();
  const [list, setList] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ total: 0, last_page: 1 });
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);

  async function load(p = 1) {
    setLoading(true);
    try {
      const { data } = await adminGetCoupons({ page: p, q });
      setList(data?.data ?? []);
      setMeta({
        total: data?.total ?? 0,
        last_page: data?.last_page ?? 1,
      });
      setPage(data?.current_page ?? p);
    } catch (e) {
      console.error(e);
      toast.error("Không tải được danh sách coupons");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((s) => ({ ...s, [name]: type === "checkbox" ? checked : value }));
  };

  const onEdit = (row) => {
    setEditingId(row.id);
    setForm({
      ...EMPTY,
      ...row,
      // Chuẩn hóa datetime-local (yyyy-MM-ddTHH:mm)
      starts_at: row.starts_at ? row.starts_at.replace(" ", "T").slice(0, 16) : "",
      expires_at: row.expires_at ? row.expires_at.replace(" ", "T").slice(0, 16) : "",
    });
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(EMPTY);
  };

  const normalize = (f) => {
    const n = { ...f };
    [
      "discount",
      "max_discount",
      "min_order",
      "usage_limit",
      "per_user_limit",
      "brand_id",
      "category_id",
      "product_id",
    ].forEach((k) => {
      n[k] = n[k] === "" || n[k] === null ? null : Number(n[k]);
    });
    // giữ nguyên starts_at / expires_at theo input datetime-local (Laravel cast datetime đọc được)
    return n;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = normalize(form);
      if (editingId) {
        await adminUpdateCoupon(editingId, payload);
        toast.success("Đã cập nhật coupon");
      } else {
        await adminCreateCoupon(payload);
        toast.success("Đã tạo coupon");
      }
      resetForm();
      load(page);
    } catch (e2) {
      console.error(e2);
      const msg =
        e2?.response?.data?.message ||
        (e2?.response?.data?.errors &&
          Object.values(e2.response.data.errors).flat().join(", ")) ||
        "Lỗi lưu coupon";
      toast.error(msg);
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Xoá coupon này?")) return;
    try {
      await adminDeleteCoupon(id);
      toast.success("Đã xoá");
      load(page);
    } catch (e) {
      console.error(e);
      toast.error("Không xoá được");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <h1 className="text-2xl font-bold">Coupons</h1>
        <div className="flex items-center gap-2">
          <input
            className="border rounded px-3 py-2"
            placeholder="Tìm theo mã..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button
            onClick={() => load(1)}
            className="px-3 py-2 border rounded"
          >
            Tải lại
          </button>
        </div>
      </div>

      {/* Form */}
      <form
        onSubmit={onSubmit}
        className="grid md:grid-cols-4 gap-3 p-4 border rounded mb-6 bg-white"
      >
        <input
          className="border rounded px-2 py-1"
          name="code"
          value={form.code}
          onChange={onChange}
          placeholder="CODE *"
          required
        />
        <select
          className="border rounded px-2 py-1"
          name="type"
          value={form.type}
          onChange={onChange}
        >
          <option value="percent">% (theo %)</option>
          <option value="fixed">VNĐ (cố định)</option>
        </select>
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="discount"
          value={form.discount}
          onChange={onChange}
          placeholder="discount"
        />
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="max_discount"
          value={form.max_discount ?? ""}
          onChange={onChange}
          placeholder="max_discount (VND)"
        />

        <input
          className="border rounded px-2 py-1"
          type="number"
          name="min_order"
          value={form.min_order ?? ""}
          onChange={onChange}
          placeholder="min_order (VND)"
        />
        <input
          className="border rounded px-2 py-1"
          type="datetime-local"
          name="starts_at"
          value={form.starts_at}
          onChange={onChange}
        />
        <input
          className="border rounded px-2 py-1"
          type="datetime-local"
          name="expires_at"
          value={form.expires_at}
          onChange={onChange}
        />
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="usage_limit"
          value={form.usage_limit ?? ""}
          onChange={onChange}
          placeholder="usage_limit"
        />

        <input
          className="border rounded px-2 py-1"
          type="number"
          name="per_user_limit"
          value={form.per_user_limit ?? ""}
          onChange={onChange}
          placeholder="per_user_limit"
        />
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="brand_id"
          value={form.brand_id ?? ""}
          onChange={onChange}
          placeholder="brand_id"
        />
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="category_id"
          value={form.category_id ?? ""}
          onChange={onChange}
          placeholder="category_id"
        />
        <input
          className="border rounded px-2 py-1"
          type="number"
          name="product_id"
          value={form.product_id ?? ""}
          onChange={onChange}
          placeholder="product_id"
        />

        <label className="flex items-center gap-2 col-span-3">
          <input
            type="checkbox"
            name="active"
            checked={!!form.active}
            onChange={onChange}
          />
          <span>Active</span>
        </label>

        <div className="flex gap-2">
          <button
            className="px-4 py-2 bg-black text-white rounded"
            type="submit"
          >
            {editingId ? "Cập nhật" : "Tạo mới"}
          </button>
          {editingId && (
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={resetForm}
            >
              Huỷ
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="overflow-x-auto bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Code</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Min Order</th>
              <th className="p-2 border">Time</th>
              <th className="p-2 border">Limit</th>
              <th className="p-2 border">Used</th>
              <th className="p-2 border">Scope</th>
              <th className="p-2 border">Active</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((row) => {
              const discountText =
                row.type === "fixed"
                  ? fVND(row.discount)
                  : `${row.discount}%${
                      row.max_discount ? ` (max ${fVND(row.max_discount)})` : ""
                    }`;
              const timeText = `${(row.starts_at || "")
                .replace("T", " ")
                .slice(0, 16)} → ${(row.expires_at || "")
                .replace("T", " ")
                .slice(0, 16)}`;
              const scope =
                (row.brand_id ? `brand#${row.brand_id} ` : "") +
                (row.category_id ? `cat#${row.category_id} ` : "") +
                (row.product_id ? `prod#${row.product_id}` : "");
              return (
                <tr key={row.id}>
                  <td className="p-2 border font-mono">{row.code}</td>
                  <td className="p-2 border">{row.type}</td>
                  <td className="p-2 border">{discountText}</td>
                  <td className="p-2 border">
                    {row.min_order ? fVND(row.min_order) : "-"}
                  </td>
                  <td className="p-2 border">{timeText}</td>
                  <td className="p-2 border">
                    {row.usage_limit ?? "∞"}/{row.per_user_limit ?? "∞"}
                  </td>
                  <td className="p-2 border">{row.used_count}</td>
                  <td className="p-2 border">
                    {scope.trim().length ? scope : "-"}
                  </td>
                  <td className="p-2 border">{row.active ? "✓" : "✗"}</td>
                  <td className="p-2 border">
                    <button
                      className="px-2 py-1 border mr-2"
                      onClick={() => onEdit(row)}
                    >
                      Sửa
                    </button>
                    <button
                      className="px-2 py-1 border"
                      onClick={() => onDelete(row.id)}
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              );
            })}
            {!list.length && !loading && (
              <tr>
                <td className="p-3 text-center" colSpan={10}>
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-2 mt-4">
        <button
          className="px-3 py-2 border rounded"
          disabled={page <= 1}
          onClick={() => load(page - 1)}
        >
          ← Trước
        </button>
        <div>
          Trang <b>{page}</b> / {meta.last_page}
        </div>
        <button
          className="px-3 py-2 border rounded"
          disabled={page >= meta.last_page}
          onClick={() => load(page + 1)}
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
