import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getOrderDetail, cancelOrder } from "../services/api";

const fVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " đ";

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getOrderDetail(id);
        setOrder(data);
      } catch (e) {
        console.error(e);
        navigate("/orders");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigate]);

  const onCancel = async () => {
    if (!order || order.status !== "pending") return;
    if (!confirm("Bạn chắc chắn muốn hủy đơn này?")) return;

    try {
      setCancelling(true);
      const { data } = await cancelOrder(order.id);
      setOrder(data); // status -> cancelled
    } catch (e) {
      const msg = e?.response?.data?.message || "Hủy đơn thất bại.";
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading || !order) return <div className="p-6">Đang tải...</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">
            Đơn hàng #{order.code || `ORD${order.id}`} – {order.status}
          </h1>
          <div className="flex gap-2">
            <Link to="/orders" className="px-3 py-2 border rounded">Danh sách đơn</Link>
            <Link to="/" className="px-3 py-2 border rounded">Tiếp tục mua</Link>
            {order.status === "pending" && (
              <button
                onClick={onCancel}
                disabled={cancelling}
                className="px-3 py-2 bg-red-600 text-white rounded disabled:opacity-60"
              >
                {cancelling ? "Đang hủy..." : "Hủy đơn"}
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <div className="font-semibold mb-2">Thông tin nhận hàng</div>
            <div className="space-y-1">
              <div>Người nhận: {order.name}</div>
              <div>Điện thoại: {order.phone}</div>
              <div>Địa chỉ: {order.address}</div>
              {order.note && <div>Ghi chú: {order.note}</div>}
              <div className="text-sm text-gray-600 mt-2">
                Vận chuyển: {order.shipping_method} | Thanh toán: {order.payment_method}
              </div>
            </div>
          </div>

          <div>
            <div className="font-semibold mb-2">Sản phẩm</div>
            <div className="space-y-3">
              {(order.items || []).map((it) => (
                <div key={it.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={it.image_url}
                      alt=""
                      className="w-12 h-12 rounded object-cover"
                      onError={(e)=>{e.currentTarget.src="https://dummyimage.com/60x60/ddd/000&text=No+Img";}}
                    />
                    <div>
                      <div className="font-medium">{it.name}</div>
                      <div className="text-sm text-gray-600">{fVND(it.price)}</div>
                    </div>
                  </div>
                  <div>SL: {it.qty}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 text-sm space-y-1">
              <div className="flex justify-between"><span>Tạm tính</span><span>{fVND(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Giảm giá</span><span>-{fVND(order.discount)}</span></div>
              <div className="flex justify-between"><span>Phí vận chuyển</span><span>{fVND(order.shipping)}</span></div>
              <div className="flex justify-between font-semibold text-lg mt-2">
                <span>Tổng</span><span>{fVND(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
