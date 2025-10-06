import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getOrders, /* cancelOrder */ } from "../services/api";

const fVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

const Badge = ({ status }) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-700",
    paid: "bg-green-100 text-green-700",
    cancelled: "bg-gray-200 text-gray-600",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs ${map[status] || "bg-gray-100"}`}>
      {status}
    </span>
  );
};

export default function Orders() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders()
      .then((res) => setData(res.data))
      .catch(() => setErr("Không tải được danh sách đơn hàng"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải...</p>;
  if (err) return <p className="text-center mt-10 text-red-600">{err}</p>;

  const orders = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Đơn hàng của tôi</h1>

      {!orders.length ? (
        <p>
          Chưa có đơn hàng.{" "}
          <Link to="/" className="text-red-600 underline">Tiếp tục mua sắm</Link>
        </p>
      ) : (
        <ul className="divide-y">
          {orders.map((o) => (
            <li key={o.id} className="py-4 flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  #{o.code} <Badge status={o.status} />
                </p>
                <p className="text-sm text-gray-600">
                  Ngày: {new Date(o.created_at).toLocaleString("vi-VN")}
                </p>
                <p className="text-sm">Tổng: <b>{fVND(o.total)}</b></p>
              </div>
              <div className="flex items-center gap-3">
                {/* Hủy đơn khi cần
                {o.status === "pending" && (
                  <button
                    onClick={async () => {
                      if (!confirm("Bạn chắc muốn hủy đơn này?")) return;
                      try { await cancelOrder(o.id); location.reload(); }
                      catch { alert("Hủy đơn thất bại!"); }
                    }}
                    className="px-3 py-1 rounded border text-red-600 hover:bg-red-50"
                  >
                    Hủy
                  </button>
                )} */}
                <Link
                  to={`/order/${o.id}`}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700"
                >
                  Xem chi tiết
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
