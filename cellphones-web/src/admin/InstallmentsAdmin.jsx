// src/pages/admin/InstallmentsAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  adminGetInstallments,
  adminCreateInstallment,
  adminUpdateInstallment,
  adminDeleteInstallment,
} from "../services/api";

// Chuẩn hoá mọi kiểu payload về mảng items
function pluckList(axiosData) {
  // axiosData = res.data
  const d = axiosData?.data ?? axiosData;
  if (Array.isArray(d)) return d;       // trả mảng trực tiếp
  if (Array.isArray(d?.data)) return d.data; // trả paginate {data:[...]}
  return [];
}

export default function InstallmentsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [form, setForm] = useState({
    provider: "Bank A",       // 🔁 trùng BE
    method: "credit",         // credit | finance
    months: 12,
    interest_monthly: 0,      // ví dụ 0.015 = 1.5%/tháng
    min_down_percent: 0,      // yêu cầu bởi BE (required)
    zero_percent: true,       // chỉ có ý nghĩa với credit
    active: true,
  });

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await adminGetInstallments();
      setRows(pluckList(res.data));
    } catch (e) {
      setErr(e?.response?.data?.message || "Không tải được danh sách gói trả góp.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    if (!form.months) return alert("Nhập kỳ hạn");
    try {
      const payload = {
        provider: form.provider?.trim() || null,
        method: form.method,
        months: Number(form.months || 0),
        interest_monthly: Number(form.interest_monthly || 0),
        min_down_percent: Number(form.min_down_percent || 0),
        zero_percent: form.method === "credit" ? !!form.zero_percent : false,
        active: !!form.active,
      };
      await adminCreateInstallment(payload);
      setForm({
        provider: "Bank A",
        method: "credit",
        months: 12,
        interest_monthly: 0,
        min_down_percent: 0,
        zero_percent: true,
        active: true,
      });
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Tạo gói trả góp thất bại.");
    }
  };

  const save = async (r) => {
    try {
      const payload = {
        provider: r.provider?.trim() || null,
        method: r.method,
        months: Number(r.months || 0),
        interest_monthly: Number(r.interest_monthly || 0),
        min_down_percent: Number(r.min_down_percent || 0),
        zero_percent: r.method === "credit" ? !!r.zero_percent : false,
        active: !!r.active,
      };
      await adminUpdateInstallment(r.id, payload);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Cập nhật gói trả góp thất bại.");
    }
  };

  const del = async (id) => {
    if (!confirm("Xoá cấu hình này?")) return;
    try {
      await adminDeleteInstallment(id);
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Xoá thất bại.");
    }
  };

  const activeCount = useMemo(() => rows.filter(r => r.active).length, [rows]);

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Cấu hình Trả góp</h1>

      {/* summary */}
      <div className="bg-white border rounded-2xl p-3 mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Tổng: <b>{rows.length}</b> gói · Đang bật: <b>{activeCount}</b>
        </div>
      </div>

      {/* Create */}
      <div className="border rounded-2xl p-3 mb-4 bg-white">
        <div className="font-medium mb-2">Thêm cấu hình</div>
        <div className="grid sm:grid-cols-7 gap-3">
          <input
            className="border rounded px-3 py-2"
            placeholder="Đối tác/Ngân hàng"
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value }))}
          />
          <select
            className="border rounded px-3 py-2"
            value={form.method}
            onChange={(e) => {
              const method = e.target.value;
              setForm((f) => ({
                ...f,
                method,
                // nếu chọn finance -> zero_percent luôn false
                zero_percent: method === "credit" ? f.zero_percent : false,
              }));
            }}
          >
            <option value="credit">Credit (qua thẻ)</option>
            <option value="finance">Finance (CTTC)</option>
          </select>
          <input
            type="number"
            min={1}
            className="border rounded px-3 py-2"
            placeholder="Kỳ hạn"
            value={form.months}
            onChange={(e) =>
              setForm((f) => ({ ...f, months: Number(e.target.value) }))
            }
          />
          <input
            type="number"
            step="0.0001"
            min={0}
            className="border rounded px-3 py-2"
            placeholder="Lãi suất/tháng (vd 0.015)"
            value={form.interest_monthly}
            onChange={(e) =>
              setForm((f) => ({ ...f, interest_monthly: e.target.value }))
            }
          />
          <input
            type="number"
            step="1"
            min={0}
            max={90}
            className="border rounded px-3 py-2"
            placeholder="% trả trước tối thiểu"
            value={form.min_down_percent}
            onChange={(e) =>
              setForm((f) => ({ ...f, min_down_percent: e.target.value }))
            }
          />
          <label className={`flex items-center gap-2 ${form.method === "finance" ? "opacity-50" : ""}`}>
            <input
              type="checkbox"
              checked={!!form.zero_percent}
              disabled={form.method === "finance"}
              onChange={(e) =>
                setForm((f) => ({ ...f, zero_percent: e.target.checked }))
              }
            />
            0% lãi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) =>
                setForm((f) => ({ ...f, active: e.target.checked }))
              }
            />
            Active
          </label>
        </div>
        <div className="mt-3">
          <button onClick={add} className="px-4 h-10 rounded bg-green-600 text-white">
            Thêm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto">
        <table className="min-w-[1100px] w-full bg-white rounded border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">ID</th>
              <th className="text-left p-2">Đối tác</th>
              <th className="text-left p-2">Phương thức</th>
              <th className="text-left p-2">Tháng</th>
              <th className="text-left p-2">Lãi/tháng</th>
              <th className="text-left p-2">% trả trước tối thiểu</th>
              <th className="text-left p-2">0%</th>
              <th className="text-left p-2">Active</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-4 text-gray-500">Đang tải…</td></tr>
            ) : err ? (
              <tr><td colSpan={9} className="p-4 text-red-600">{err}</td></tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">
                  Chưa có cấu hình
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.id}</td>
                  <td className="p-2">
                    <input
                      className="border rounded px-2 py-1 w-48"
                      value={r.provider || ""}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, provider: e.target.value } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <select
                      className="border rounded px-2 py-1"
                      value={r.method || "credit"}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? {
                                  ...x,
                                  method: e.target.value,
                                  zero_percent:
                                    e.target.value === "credit" ? x.zero_percent : false,
                                }
                              : x
                          )
                        )
                      }
                    >
                      <option value="credit">credit</option>
                      <option value="finance">finance</option>
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      min={1}
                      className="border rounded px-2 py-1 w-24"
                      value={r.months ?? 0}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id ? { ...x, months: Number(e.target.value) } : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="0.0001"
                      min={0}
                      className="border rounded px-2 py-1 w-28"
                      value={r.interest_monthly ?? 0}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, interest_monthly: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      step="1"
                      min={0}
                      max={90}
                      className="border rounded px-2 py-1 w-28"
                      value={r.min_down_percent ?? 0}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, min_down_percent: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="checkbox"
                      checked={!!r.zero_percent}
                      disabled={r.method === "finance"}
                      onChange={(e) =>
                        setRows((prev) =>
                          prev.map((x) =>
                            x.id === r.id
                              ? { ...x, zero_percent: e.target.checked }
                              : x
                          )
                        )
                      }
                    />
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
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
