import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { getPaymentResult } from "../services/api";
import { CheckCircle, XCircle, Clock } from "lucide-react";

const fVND = (n) => `${(Number(n) || 0).toLocaleString("vi-VN")} ₫`;

export default function PaymentResult() {
  const { search } = useLocation();
  const query = useMemo(() => new URLSearchParams(search), [search]);

  const orderId = Number(query.get("order_id")) || null;
  const ok = query.get("ok");

  const [status, setStatus] = useState("checking");
  const [order, setOrder] = useState(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("notfound");
      return;
    }

    let active = true;
    let tries = 0;

    const pollOrder = async () => {
      try {
        const res = await getPaymentResult(orderId);
        if (!active) return;

        const o = res.data;
        setOrder(o);

        if (o.payment_status === "paid") return setStatus("paid");
        if (o.payment_status === "failed") return setStatus("failed");

        tries++;
        if (tries < 10) setTimeout(pollOrder, 1500);
        else setStatus("pending");
      } catch {
        if (active) setStatus("notfound");
      }
    };

    pollOrder();
    return () => {
      active = false;
    };
  }, [orderId]);

  const renderIcon = () => {
    if (status === "paid")
      return <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />;
    if (status === "failed")
      return <XCircle className="w-16 h-16 text-red-500 mx-auto mb-3" />;
    if (status === "pending" || status === "checking")
      return <Clock className="w-16 h-16 text-amber-500 mx-auto mb-3 animate-pulse" />;
    return <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-3" />;
  };

  const title =
    status === "paid"
      ? "Thanh toán thành công 🎉"
      : status === "failed"
      ? "Thanh toán thất bại ❌"
      : status === "pending"
      ? "Đang xác minh thanh toán..."
      : status === "checking"
      ? "Đang kiểm tra đơn hàng..."
      : "Không tìm thấy đơn hàng";

  const desc =
    status === "paid"
      ? "Cảm ơn bạn đã mua hàng tại Cellphones!"
      : status === "failed"
      ? "Thanh toán thất bại hoặc đã bị hủy. Đơn hàng của bạn vẫn đang chờ xử lý."
      : status === "pending"
      ? "Hệ thống đang xác minh thanh toán của bạn. Vui lòng đợi trong giây lát."
      : status === "checking"
      ? "Đang tải thông tin đơn hàng từ máy chủ..."
      : "Không thể tìm thấy thông tin đơn hàng.";

  return (
    <div className="max-w-xl mx-auto p-6 text-center mt-12 bg-white rounded-xl shadow">
      {renderIcon()}
      <h1 className="text-2xl font-bold mb-2">{title}</h1>
      <p className="text-gray-600 mb-5">{desc}</p>

      {order && (
        <div className="border rounded-lg bg-gray-50 text-left p-4 mb-6">
          <p>
            <strong>Mã đơn hàng:</strong> {order.code || `#${order.id}`}
          </p>
          <p>
            <strong>Tổng tiền:</strong> {fVND(order.total)}
          </p>
          <p>
            <strong>Trạng thái đơn:</strong>{" "}
            <span
              className={
                order.payment_status === "paid"
                  ? "text-green-600 font-medium"
                  : "text-amber-600 font-medium"
              }
            >
              {order.payment_status}
            </span>
          </p>
        </div>
      )}

      {status === "paid" && (
        <div className="flex justify-center gap-3">
          <Link
            to={`/order/${orderId}`}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Xem đơn hàng
          </Link>
          <Link to="/" className="px-5 py-2 border rounded hover:bg-gray-50">
            Về trang chủ
          </Link>
        </div>
      )}

      {status === "failed" && (
        <div className="flex justify-center gap-3">
          <Link to="/orders" className="px-5 py-2 border rounded hover:bg-gray-50">
            Đơn hàng của tôi
          </Link>
          <Link
            to="/"
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Mua lại
          </Link>
        </div>
      )}

      {(status === "pending" || status === "checking") && (
        <div className="text-sm text-gray-500">
          Nếu quá 30 giây vẫn chưa cập nhật, hãy truy cập{" "}
          <Link to="/orders" className="text-blue-600 underline">
            Đơn hàng của tôi
          </Link>{" "}
          để xem kết quả mới nhất.
        </div>
      )}

      {status === "notfound" && (
        <div className="text-sm text-gray-500">
          Không tìm thấy đơn hàng.{" "}
          <Link to="/" className="text-blue-600 underline">
            Quay về trang chủ
          </Link>
          .
        </div>
      )}
    </div>
  );
}
