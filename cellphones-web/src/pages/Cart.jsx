import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const fVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

export default function Cart() {
  const { cart, updateQty, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // giữ lại nếu bạn dùng disable nút

  const total = useMemo(
    () => cart.reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 0), 0),
    [cart]
  );

  if (!cart?.length) {
    return <p className="text-center mt-10">🛒 Giỏ hàng trống!</p>;
  }

  const goCheckout = () => {
    if (!user) {
      navigate("/login?next=/checkout");
      return;
    }
    navigate("/checkout");
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Giỏ hàng của bạn</h1>

      <ul className="divide-y">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <img
                src={item.image_url || item.image}
                alt={item.name}
                className="w-20 h-20 rounded object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://dummyimage.com/100x100/cccccc/000000&text=No+Image";
                }}
              />
              <div>
                <h2 className="font-semibold">{item.name}</h2>
                <p className="text-red-600">{fVND(item.price)}</p>

                <div className="flex items-center gap-2 mt-1">
                  <button className="px-2 border rounded" onClick={() => updateQty(item.id, Number(item.qty || 1) - 1)}>-</button>
                  <input
                    value={item.qty}
                    onChange={(e) => updateQty(item.id, e.target.value)}
                    className="w-14 border rounded text-center"
                  />
                  <button className="px-2 border rounded" onClick={() => updateQty(item.id, Number(item.qty || 1) + 1)}>+</button>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="font-medium">{fVND((Number(item.price) || 0) * (Number(item.qty) || 1))}</div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-sm text-red-600 hover:underline mt-1"
              >
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-between items-center">
        <p className="text-lg font-bold">
          Tổng: <span className="text-red-600">{fVND(total)}</span>
        </p>

        <div className="flex gap-3">
          <button
            onClick={clearCart}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Xóa tất cả
          </button>

          <button
            type="button"                         // quan trọng: KHÔNG submit/POST ở trang này
            onClick={goCheckout}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang xử lý..." : "Thanh toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
