// src/components/product/StoreAvailability.jsx
import { useEffect, useMemo, useState } from "react";
import { storeAvailability, storeReserve } from "../../services/api";

export default function StoreAvailability({ productId }) {
  const [city, setCity] = useState("DN"); // mặc định Đà Nẵng giống ảnh bạn
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const load = async (pid = productId, c = city) => {
    if (!pid) return;
    setLoading(true);
    try {
      const res = await storeAvailability({ product_id: pid, city: c });
      const list = res?.data?.stores ?? res?.data?.data ?? res?.data ?? [];
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error(e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, city, productId]);

  const inStockCount = useMemo(() => rows.filter(r => r.stock > 0).length, [rows]);

  return (
    <>
      <div className="mt-6 rounded border p-4">
        <div className="flex items-center justify-between">
          <div className="font-medium">Tình trạng hàng & giao nhanh</div>
          <div className="text-sm text-green-600">
            {inStockCount > 0 ? `✔ Còn hàng tại ${inStockCount} cửa hàng` : "Hết hàng tại khu vực"}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <select
            className="border rounded px-3 py-2"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            <option value="HCM">Hồ Chí Minh</option>
            <option value="HN">Hà Nội</option>
            <option value="DN">Đà Nẵng</option>
          </select>

          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded bg-gray-700 text-white"
          >
            Xem cửa hàng còn hàng
          </button>
        </div>
      </div>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white w-full max-w-3xl rounded-lg p-4 grid grid-cols-1 md:grid-cols-2 gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <div className="font-semibold mb-2">Cửa hàng ({city})</div>
              <div className="border rounded max-h-[360px] overflow-auto">
                {loading ? (
                  <div className="p-3 text-sm text-gray-600">Đang tải…</div>
                ) : rows.length ? (
                  rows.map((s) => (
                    <div key={s.id} className="p-3 border-b last:border-b-0">
                      <div className="font-medium">{s.name}</div>
                      <div className="text-sm text-gray-600">
                        Tồn kho: <b>{s.stock}</b>
                        {s.fast_2h ? " • Giao nhanh 2h" : ""}
                        <div className="truncate">{s.address || "—"}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-3 text-sm text-gray-600">Không có cửa hàng.</div>
                )}
              </div>
            </div>

            <div className="text-sm text-gray-500 flex items-center justify-center">
              (Bạn có thể thêm bản đồ ở đây)
            </div>

            <div className="col-span-full flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-200"
                onClick={() => setOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
