import React, { useEffect, useState } from "react";
import {
  adminGetWarrantyPlans,
  adminCreateWarrantyPlan,
  adminUpdateWarrantyPlan,
  adminDeleteWarrantyPlan,
} from "../services/api";

// Nhãn tiếng Việt cho các type
const TYPE_OPTIONS = [
  { value: "extended", label: "Bảo hành mở rộng" },
  { value: "accident", label: "Bảo hiểm rơi vỡ / vào nước" },
  { value: "combo",    label: "Gói combo" },
];

// Rút gọn dữ liệu từ nhiều kiểu response khác nhau
function normalizePlans(res) {
  const raw =
    res?.data?.data ??     // { data: [...] }
    res?.data ??           // [...]
    [];
  const arr = Array.isArray(raw) ? raw : [];
  return arr.map((x) => ({
    id: Number(x.id),
    name: String(x.name ?? ""),
    months: Number(x.months ?? 12),
    price: Number(x.price ?? 0),
    type: String(x.type ?? "extended"),
    active: Boolean(x.active ?? true),
  }));
}

export default function WarrantyPlansAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form thêm mới
  const [form, setForm] = useState({
    name: "",
    months: 12,
    price: 0,
    type: "extended",
    active: true,
  });

  const load = async () => {
    setLoading(true);
    try {
      const r = await adminGetWarrantyPlans({ per_page: 200 });
      setRows(normalizePlans(r));
    } catch (e) {
      console.error(e);
      alert("Không tải được danh sách gói bảo hành");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.name?.trim()) return alert("Nhập tên gói");
    try {
      await adminCreateWarrantyPlan({
        name: form.name.trim(),
        months: Number(form.months) || 0,
        price: Number(form.price) || 0,
        type: form.type,
        active: !!form.active,
      });
      setForm({ name: "", months: 12, price: 0, type: "extended", active: true });
      await load();
    } catch (e) {
      console.error(e);
      alert("Tạo gói thất bại");
    }
  };

  const save = async (row) => {
    try {
      await adminUpdateWarrantyPlan(row.id, {
        name: String(row.name || ""),
        months: Number(row.months) || 0,
        price: Number(row.price) || 0,
        type: String(row.type || "extended"),
        active: !!row.active,
      });
      await load();
    } catch (e) {
      console.error(e);
      alert("Cập nhật thất bại");
    }
  };

  const del = async (id) => {
    if (!confirm("Xoá gói này?")) return;
    try {
      await adminDeleteWarrantyPlan(id);
      await load();
    } catch (e) {
      console.error(e);
      alert("Xoá thất bại");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-5">Gói bảo hành</h1>

      {/* Thêm gói */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="font-medium mb-3">Thêm gói</div>
        <div className="grid sm:grid-cols-5 gap-3 items-center">
          <input
            className="border rounded px-3 py-2"
            placeholder="Tên gói"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            type="number"
            className="border rounded px-3 py-2"
            placeholder="Tháng"
            value={form.months}
            min={1}
            onChange={(e) => setForm((f) => ({ ...f, months: Number(e.target.value) }))}
          />
          <input
            type="number"
            className="border rounded px-3 py-2"
            placeholder="Giá (đ)"
            value={form.price}
            onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))}
            />
            Kích hoạt
          </label>
        </div>
        <div className="mt-3">
          <button onClick={add} className="px-4 h-10 rounded bg-green-600 text-white">
            Thêm
          </button>
        </div>
      </div>

      {/* Danh sách */}
      <div className="overflow-auto">
        <table className="min-w-[840px] w-full bg-white rounded border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 w-16">ID</th>
              <th className="text-left p-2">Tên</th>
              <th className="text-left p-2 w-28">Tháng</th>
              <th className="text-left p-2 w-40">Giá (đ)</th>
              <th className="text-left p-2 w-60">Loại</th>
              <th className="text-left p-2 w-24">Active</th>
              <th className="p-2 w-40">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">
                    <input
                      className="border rounded px-2 py-1 w-80"
                      value={r.name}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, name: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      value={r.months}
                      min={1}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, months: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-36"
                      value={r.price}
                      step="1000"
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, price: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="border rounded px-2 py-1 w-56"
                      value={r.type}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, type: e.target.value } : x
                          )
                        )
                      }
                    >
                      {TYPE_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!r.active}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, active: e.target.checked } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => save(r)}
                      className="px-3 py-1 rounded bg-blue-600 text-white mr-2"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => del(r.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white"
                    >
                      Xoá
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  Chưa có gói bảo hành
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
