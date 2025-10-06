// src/pages/PaymentResult.jsx
import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getOrderDetail } from "../services/api"; // dùng hàm đã có sẵn của bạn

const money = (n) => `${(Number(n) || 0).toLocaleString("vi-VN")} đ`;

export default function PaymentResult() {
  const q = useQuery();
  const orderId = Number(q.get("order_id")) || null; // BE redirect kèm ?order_id=...
  const okFlag = q.get("ok"); // "1" | "0" | null (chỉ để tham khảo hiển thị ban đầu)

  const [status, setStatus] = useState("checking"); // checking|paid|failed|pending|notfound
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("notfound");
      return;
    }

    let alive = true;
    let tries = 0;

    const poll = async () => {
      try {
        const res = await getOrderDetail(orderId);
        if (!alive) return;
        const o = res.data;
        setOrder(o);

        if (o.payment_status === "paid") return setStatus("paid");
        if (o.payment_status === "failed") return setStatus("failed");

        // chưa chốt IPN → tiếp tục chờ
        tries += 1;
        if (tries < 10) {
          setTimeout(poll, 1500);
        } else {
          setStatus("pending");
        }
      } catch (e) {
        setStatus("notfound");
      }
    };

    // gợi ý theo okFlag (nếu có), nhưng kết quả cuối vẫn theo IPN
    if (okFlag === "1") setStatus("checking");
    if (okFlag === "0") setStatus("checking");

    poll();
    return () => {
      alive = false;
    };
  }, [orderId, okFlag]);

  const title =
    status === "paid"
      ? "Thanh toán thành công!"
      : status === "failed"
      ? "Thanh toán thất bại!"
      : status === "pending"
      ? "Đã nhận giao dịch, đang xác minh..."
      : status === "checking"
      ? "Đang kiểm tra giao dịch..."
      : "Không tìm thấy đơn hàng";

  return (
    <div className="max-w-xl mx-auto px-4 py-10 text-center">
      <h1 className="text-2xl font-bold mb-2">{title}</h1>

      {order && (
        <p className="text-gray-600 mb-6">
          Đơn <b>#{order.code || order.id}</b> • Tổng: <b>{money(order.total)}</b>
        </p>
      )}

      {status === "paid" && (
        <div className="space-x-2">
          <Link
            to="/orders"
            className="inline-block px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
          >
            Xem đơn hàng của tôi
          </Link>
          <Link to="/" className="inline-block px-4 py-2 rounded border">
            Về trang chủ
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="space-x-2">
          <Link to="/orders" className="inline-block px-4 py-2 rounded border">
            Xem đơn hàng
          </Link>
          <Link to="/" className="inline-block px-4 py-2 rounded bg-black text-white">
            Tiếp tục mua sắm
          </Link>
        </div>
      )}

      {(status === "pending" || status === "checking") && (
        <div className="text-gray-600">
          Vui lòng đợi trong giây lát. Nếu quá lâu, hãy vào{" "}
          <Link to="/orders" className="text-blue-600 underline">
            Đơn hàng của tôi
          </Link>{" "}
          để kiểm tra.
        </div>
      )}

      {status === "notfound" && (
        <div className="text-gray-600">
          Không thấy thông tin đơn hàng. Về{" "}
          <Link to="/" className="text-blue-600 underline">
            trang chủ
          </Link>
          .
        </div>
      )}
    </div>
  );
}

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}
