// src/admin/StoresAdmin.jsx
import { useEffect, useState } from "react";
import {
  adminGetStores,
  adminCreateStore,
  adminUpdateStore,
  adminDeleteStore,
} from "../services/api";

export default function StoresAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    city: "HCM",
    address: "",
    // Checkbox “Giao nhanh 2h” chỉ là hiển thị, không gửi vào bảng stores
    fast2h: true,
  });

  const normalizeStores = (payload) => {
    // BE trả paginate: { data: [...] } hoặc trả mảng
    const items = payload?.data?.data ?? payload?.data ?? [];
    if (!Array.isArray(items)) return [];
    return items.map((s) => ({
      ...s,
      // gom về 1 key để UI hiển thị
      fast2h: s.fast_2h ?? s.fast2h ?? false,
    }));
  };

  const load = async () => {
    try {
      setLoading(true);
      const r = await adminGetStores({ per_page: 100 });
      setRows(normalizeStores(r));
    } catch (e) {
      console.error(e);
      alert("Không tải được danh sách cửa hàng");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.name?.trim()) return alert("Nhập tên cửa hàng");
    try {
      await adminCreateStore({
        name: form.name.trim(),
        city: form.city,
        address: form.address?.trim() || null,
        // KHÔNG gửi fast2h — bảng stores không có cột này
      });
      setForm({ name: "", city: "HCM", address: "", fast2h: true });
      await load();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message || "Tạo cửa hàng thất bại";
      alert(msg);
    }
  };

  const save = async (row) => {
    try {
      await adminUpdateStore(row.id, {
        name: row.name?.trim() || "",
        city: row.city,
        address: row.address?.trim() || null,
        // KHÔNG gửi fast2h — bảng stores không có cột này
      });
      await load();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message || "Cập nhật thất bại";
      alert(msg);
    }
  };

  const del = async (id) => {
    if (!confirm("Xoá cửa hàng này?")) return;
    try {
      await adminDeleteStore(id);
      await load();
    } catch (e) {
      console.error(e);
      const msg =
        e?.response?.data?.message || "Xoá thất bại";
      alert(msg);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Cửa hàng</h1>

      {/* Form thêm */}
      <div className="border rounded p-3 mb-4 bg-white">
        <div className="font-medium mb-2">Thêm cửa hàng</div>
        <div className="grid sm:grid-cols-4 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Tên cửa hàng"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
          >
            <option value="HCM">Hồ Chí Minh</option>
            <option value="HN">Hà Nội</option>
            <option value="DN">Đà Nẵng</option>
          </select>
          <input
            className="border rounded px-3 py-2"
            placeholder="Địa chỉ"
            value={form.address}
            onChange={(e) =>
              setForm((f) => ({ ...f, address: e.target.value }))
            }
          />
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={form.fast2h}
              onChange={(e) =>
                setForm((f) => ({ ...f, fast2h: e.target.checked }))
              }
            />
            Giao nhanh 2h (hiển thị, không lưu vào bảng stores)
          </label>
        </div>
        <div className="mt-3">
          <button
            onClick={add}
            className="px-4 h-10 rounded bg-green-600 text-white"
          >
            Thêm
          </button>
        </div>
      </div>

      {/* Danh sách */}
      <div className="overflow-auto">
        <table className="min-w-[820px] w-full bg-white rounded border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Tên</th>
              <th className="text-left p-2">Khu vực</th>
              <th className="text-left p-2">Địa chỉ</th>
              <th className="text-left p-2">2h</th>
              <th className="p-2 w-48">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : Array.isArray(rows) && rows.length > 0 ? (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">
                    <input
                      className="border rounded px-2 py-1 w-56"
                      value={r.name || ""}
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
                    <select
                      className="border rounded px-2 py-1"
                      value={r.city || "HCM"}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, city: e.target.value } : x
                          )
                        )
                      }
                    >
                      <option value="HCM">HCM</option>
                      <option value="HN">HN</option>
                      <option value="DN">DN</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      className="border rounded px-2 py-1 w-72"
                      value={r.address || ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, address: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!r.fast2h}
                      readOnly
                      title="Hiển thị (không lưu vào bảng stores). Trạng thái 2h nên đặt theo từng tồn kho/cửa hàng."
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
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  Chưa có cửa hàng
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
