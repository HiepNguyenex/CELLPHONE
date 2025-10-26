// src/admin/InventoriesAdmin.jsx
import { useEffect, useMemo, useState } from "react";
import {
  adminGetInventories,
  adminUpsertInventories,
  adminDeleteInventory,
  adminGetStores,
  adminGetProducts,
} from "../services/api";

// helper unbox danh sách từ mọi kiểu response: paginate / array / object
const extractList = (res) =>
  res?.data?.data?.data ?? // trường hợp res.data = { data: { data: [...] } }
  res?.data?.data ??       // trường hợp res.data = { data: [...] }
  res?.data ??             // trường hợp res = axiosResponse với data là mảng
  [];

export default function InventoriesAdmin() {
  const [stores, setStores] = useState([]);     // [{id, name, city, ...}]
  const [products, setProducts] = useState([]); // [{id, name, ...}]
  const [rows, setRows] = useState([]);         // list tồn kho

  const [loading, setLoading] = useState(false);

  // filter
  const [storeId, setStoreId] = useState("");
  const [q, setQ] = useState("");

  // các dòng chờ lưu (bulk-upsert)
  const [pending, setPending] = useState([]); // [{id?, store_id, product_id, stock}]

  // ========== LOAD MASTER DATA ==========
  const loadMasters = async () => {
    try {
      const [rsStores, rsProducts] = await Promise.all([
        // lấy nhiều hơn để dropdown đủ dữ liệu
        adminGetStores({ per_page: 1000 }),
        adminGetProducts({ per_page: 1000 }),
      ]);

      const s = extractList(rsStores);
      const p = extractList(rsProducts);

      setStores(Array.isArray(s) ? s : []);
      setProducts(Array.isArray(p) ? p : []);
    } catch (e) {
      console.error("Load masters error:", e);
      setStores([]);
      setProducts([]);
    }
  };

  // ========== LOAD INVENTORIES ==========
  const loadInventories = async (params = {}) => {
    setLoading(true);
    try {
      const r = await adminGetInventories({
        store_id: params.store_id ?? (storeId || undefined),
        q: params.q ?? (q || undefined),
        per_page: 50,
      });

      const list = extractList(r);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Load inventories error:", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMasters();
  }, []);

  useEffect(() => {
    loadInventories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, q]);

  // ========== HANDLERS ==========
  const upsert = async () => {
    if (!pending.length) return alert("Không có thay đổi để lưu.");
    try {
      await adminUpsertInventories(
        pending.map((x) => ({
          id: x.id ?? undefined,
          store_id: Number(x.store_id),
          product_id: Number(x.product_id),
          stock: Math.max(0, Number(x.stock) || 0),
        }))
      );
      setPending([]);
      await loadInventories();
      alert("Đã lưu tồn kho.");
    } catch (e) {
      console.error(e);
      alert("Lưu tồn kho thất bại.");
    }
  };

  const remove = async (id) => {
    if (!id) return;
    if (!confirm("Xoá dòng tồn kho này?")) return;
    try {
      await adminDeleteInventory(id);
      await loadInventories();
    } catch (e) {
      console.error(e);
      alert("Xoá thất bại.");
    }
  };

  // ghi thay đổi vào rows và đánh dấu pending
  const markChange = (idx, patch) => {
    setRows((prev) => {
      const next = [...prev];
      const row = { ...next[idx], ...patch };
      next[idx] = row;

      // push/replace vào pending
      setPending((pend) => {
        const key = (r) =>
          `${r.id || "n"}-${r.store_id}-${r.product_id}`;
        const updated = { ...row };
        const existIdx = pend.findIndex((x) => key(x) === key(updated));
        const copy = [...pend];
        if (existIdx >= 0) copy[existIdx] = updated;
        else copy.push(updated);
        return copy;
      });

      return next;
    });
  };

  const addEmptyRow = () => {
    const sId = storeId || (stores[0]?.id ?? "");
    setRows((prev) => [
      {
        id: null,
        store_id: sId,
        product_id: products[0]?.id ?? "",
        stock: 0,
      },
      ...prev,
    ]);
  };

  const storeOptions = useMemo(
    () =>
      stores.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.city})`,
      })),
    [stores]
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Tồn kho cửa hàng</h1>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col">
          <label className="text-sm mb-1">Cửa hàng</label>
          <select
            className="border rounded px-3 py-2 min-w-[260px]"
            value={storeId}
            onChange={(e) => setStoreId(e.target.value)}
          >
            <option value="">— Tất cả —</option>
            {storeOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm mb-1">Tìm theo tên/ID SP</label>
          <input
            className="border rounded px-3 py-2 min-w-[220px]"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="iphone, 123…"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => loadInventories()}
            className="px-4 h-10 rounded bg-gray-700 text-white"
          >
            Tải dữ liệu
          </button>
          <button
            onClick={addEmptyRow}
            className="px-4 h-10 rounded bg-green-600 text-white"
          >
            Thêm dòng
          </button>
          <button
            onClick={upsert}
            className="px-4 h-10 rounded bg-blue-600 text-white"
          >
            Lưu thay đổi
          </button>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-auto">
        <table className="min-w-[920px] w-full bg-white rounded border">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 w-14">ID</th>
              <th className="text-left p-2 w-[260px]">Cửa hàng</th>
              <th className="text-left p-2 w-[380px]">Sản phẩm</th>
              <th className="text-left p-2 w-28">Tồn kho</th>
              <th className="p-2 w-28">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Đang tải…
                </td>
              </tr>
            ) : rows.length ? (
              rows.map((r, idx) => (
                <tr key={`${r.id || "new"}-${idx}`} className="border-t">
                  <td className="p-2">{r.id ?? "—"}</td>
                  <td className="p-2">
                    <select
                      className="border rounded px-2 py-1 w-[260px]"
                      value={r.store_id || ""}
                      onChange={(e) =>
                        markChange(idx, { store_id: Number(e.target.value) })
                      }
                    >
                      {storeOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <select
                      className="border rounded px-2 py-1 w-[380px]"
                      value={r.product_id || ""}
                      onChange={(e) =>
                        markChange(idx, { product_id: Number(e.target.value) })
                      }
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          #{p.id} — {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border rounded px-2 py-1 w-24"
                      min={0}
                      value={r.stock ?? 0}
                      onChange={(e) =>
                        markChange(idx, {
                          stock: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </td>
                  <td className="p-2">
                    {r.id ? (
                      <button
                        onClick={() => remove(r.id)}
                        className="px-3 py-1 rounded bg-red-600 text-white"
                      >
                        Xoá
                      </button>
                    ) : (
                      <span className="text-xs text-gray-500">Chưa lưu</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
