import { useEffect, useMemo, useRef, useState } from "react";
import { getWarrantyPlans } from "../../services/api";

const TYPE_LABEL = {
  extended: "Bảo hành mở rộng",
  accident: "Bảo hiểm rơi vỡ / vào nước",
  combo: "Gói combo",
};

export default function WarrantyUpsell({ productId, onChange }) {
  const [rows, setRows] = useState([]);
  const [checked, setChecked] = useState(new Set());
  const [loading, setLoading] = useState(true);

  // Giữ tham chiếu onChange để tránh phải add vào deps → không lặp
  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!productId) {
      setRows([]);
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    setLoading(true);

    getWarrantyPlans({ product_id: productId }, ac.signal)
      .then((r) => {
        const list = r?.data?.data ?? r?.data ?? [];
        setRows(Array.isArray(list) ? list : []);
      })
      .catch((e) => {
        // Bỏ qua lỗi hủy request của axios
        if (e?.name !== "CanceledError" && e?.code !== "ERR_CANCELED") {
          console.error("Load warranty plans:", e);
        }
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });

    return () => ac.abort();
  }, [productId]);

  // Tính tổng
  const total = useMemo(() => {
    return rows.reduce(
      (sum, p) => sum + (checked.has(p.id) ? Number(p.price || 0) : 0),
      0
    );
  }, [rows, checked]);

  // Báo ra ngoài khi checked/total đổi
  useEffect(() => {
    onChangeRef.current?.(Array.from(checked), total);
  }, [checked, total]);

  if (loading) return <p className="mt-6 text-gray-500">Đang tải gói bảo hành…</p>;

  return (
    <div className="mt-6 border rounded-lg">
      <div className="px-4 py-3 font-semibold border-b">
        Dịch vụ bảo vệ & bảo hành mở rộng
      </div>

      {/* Empty state */}
      {!rows.length ? (
        <div className="p-4 text-sm text-gray-600">
          Sản phẩm này hiện chưa có gói bảo hành phù hợp.
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {Object.entries(
            rows.reduce((acc, r) => {
              const key = r.type || "other";
              (acc[key] = acc[key] || []).push(r);
              return acc;
            }, {})
          ).map(([type, list]) => (
            <div key={type}>
              <div className="text-sm text-gray-600 mb-2">
                {TYPE_LABEL[type] ?? type}
              </div>
              <div className="space-y-2">
                {list.map((p) => (
                  <label
                    key={p.id}
                    className="flex items-start gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked.has(p.id)}
                      onChange={(e) =>
                        setChecked((prev) => {
                          const next = new Set(prev);
                          if (e.target.checked) next.add(p.id);
                          else next.delete(p.id);
                          return next;
                        })
                      }
                    />
                    <div className="flex-1">
                      <div className="font-medium">
                        {p.name}
                        {p.months ? ` · ${p.months} tháng` : ""}
                      </div>
                      <div className="text-red-600 font-semibold">
                        {Number(p.price || 0).toLocaleString("vi-VN")} ₫
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-3 border-t">
            <div className="text-sm text-gray-600">Tổng dịch vụ:</div>
            <div className="text-red-600 font-semibold">
              {total.toLocaleString("vi-VN")} ₫
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
