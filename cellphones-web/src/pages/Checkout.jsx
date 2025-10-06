import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { quoteCheckout, createOrder, mapCartToItems } from "../services/api";
import { useAuth } from "../context/AuthContext";
import useToast from "../components/Toast"; // 🔔 dùng Toast tự viết

const fVND = (n) => new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const toast = useToast(); // ⬅️ hook

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    shipping_method: "standard",
    payment_method: "cod",
    coupon: "",
  });

  const [quote, setQuote] = useState({ subtotal: 0, shipping: 0, discount: 0, total: 0 });
  const [quoting, setQuoting] = useState(false);
  const [loading, setLoading] = useState(false);

  // ép đăng nhập
  useEffect(() => {
    if (!user) navigate("/login?next=/checkout");
  }, [user, navigate]);

  // không có hàng -> về cart
  useEffect(() => {
    if (!cart?.length) navigate("/cart");
  }, [cart?.length, navigate]);

  const basePayload = useMemo(
    () => ({
      items: mapCartToItems(cart),
      shipping_method: form.shipping_method,
      coupon: form.coupon || null,
    }),
    [cart, form.shipping_method, form.coupon]
  );

  // Gọi quote + thông báo lỗi bằng toast
  useEffect(() => {
    if (!cart?.length) return;
    (async () => {
      try {
        setQuoting(true);
        const { data } = await quoteCheckout(basePayload);
        setQuote({
          subtotal: data?.subtotal || 0,
          shipping: data?.shipping || 0,
          discount: data?.discount || 0,
          total: data?.total || 0,
        });
      } catch (e) {
        console.error(e);
        toast.error("Không tính được tạm tính. Hãy thử lại hoặc đăng nhập lại.", {
          title: "Lỗi báo giá",
        });
      } finally {
        setQuoting(false);
      }
    })();
  }, [basePayload, cart?.length, toast]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const submitOrder = async (e) => {
    e.preventDefault();
    if (!cart?.length) return;

    const payload = {
      ...basePayload,
      payment_method: form.payment_method,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      address: form.address.trim(),
      note: form.note || null,
    };

    let tId;
    try {
      setLoading(true);
      // loading toast
      tId = toast.loading("Đang tạo đơn hàng…", { title: "Vui lòng chờ" });

      const { data } = await createOrder(payload);
      clearCart();

      // success
      toast.update(tId, {
        type: "success",
        title: "Đặt hàng thành công",
        description: data?.order?.code ? `Mã đơn: ${data.order.code}` : "Cảm ơn bạn đã mua hàng.",
        duration: 4000,
      });

      // Điều hướng
      const id = data?.order?.id ?? data?.id;
      navigate(id ? `/order/${id}` : "/thank-you");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "";
      const errs = e?.response?.data?.errors;

      // Case: hết hàng / không đủ tồn kho
      if (/tồn kho|hết hàng|không đủ/i.test(message)) {
        if (tId) {
          toast.update(tId, {
            type: "error",
            title: "Không đủ tồn kho",
            description: message,
            action: { label: "Giỏ hàng", onClick: () => navigate("/cart") },
            duration: 5500,
          });
        } else {
          toast.error(message, {
            title: "Không đủ tồn kho",
            action: { label: "Giỏ hàng", onClick: () => navigate("/cart") },
            duration: 5500,
          });
        }
        return;
      }

      // Case: 422 validation
      if (errs) {
        const msg = Object.values(errs).flat().join(", ");
        if (tId) {
          toast.update(tId, {
            type: "warning",
            title: "Thiếu/Không hợp lệ",
            description: msg,
            duration: 5000,
          });
        } else {
          toast.warning(msg, { title: "Thiếu/Không hợp lệ", duration: 5000 });
        }
        return;
      }

      // Fallback
      const fallback = message || "Đặt hàng thất bại.";
      if (tId) {
        toast.update(tId, {
          type: "error",
          title: "Đặt hàng thất bại",
          description: fallback,
          duration: 4500,
        });
      } else {
        toast.error(fallback, { title: "Đặt hàng thất bại", duration: 4500 });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 grid md:grid-cols-3 gap-6">
      {/* LEFT: Form */}
      <form onSubmit={submitOrder} className="md:col-span-2 bg-white shadow rounded-lg p-5 space-y-5">
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Họ tên *</label>
            <input name="name" value={form.name} onChange={onChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Số điện thoại *</label>
            <input name="phone" value={form.phone} onChange={onChange} className="w-full border rounded p-2" required />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} className="w-full border rounded p-2" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Địa chỉ nhận hàng *</label>
            <input name="address" value={form.address} onChange={onChange} className="w-full border rounded p-2" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Ghi chú</label>
            <textarea name="note" value={form.note} onChange={onChange} className="w-full border rounded p-2" rows={3} />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Phương thức vận chuyển</div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="shipping_method"
                value="standard"
                checked={form.shipping_method === "standard"}
                onChange={onChange}
              />
              <span>Tiêu chuẩn (30.000đ)</span>
            </label>
            <label className="flex items-center gap-2 mt-2">
              <input
                type="radio"
                name="shipping_method"
                value="express"
                checked={form.shipping_method === "express"}
                onChange={onChange}
              />
              <span>Hỏa tốc (50.000đ)</span>
            </label>
            <p className="text-xs text-gray-500 mt-2">Miễn phí ship cho đơn từ 2.000.000đ.</p>
          </div>

          <div className="border rounded p-3">
            <div className="font-semibold mb-2">Phương thức thanh toán</div>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="payment_method"
                value="cod"
                checked={form.payment_method === "cod"}
                onChange={onChange}
              />
              <span>Thanh toán khi nhận hàng (COD)</span>
            </label>
          </div>
        </div>

        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Mã giảm giá</label>
            <input
              name="coupon"
              value={form.coupon}
              onChange={onChange}
              placeholder="SALE10"
              className="w-full border rounded p-2"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={() => {
              // đổi coupon → useEffect tự quote lại; chỉ hiển thị feedback
              toast.info(form.coupon ? `Đã áp dụng mã ${form.coupon}` : "Chưa nhập mã giảm giá", {
                title: "Mã giảm giá",
              });
              setForm((s) => ({ ...s })); // trigger re-render nếu cần
            }}
          >
            Áp dụng
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || quoting}
          className="w-full bg-red-600 text-white py-3 rounded hover:bg-red-700 disabled:opacity-60"
        >
          {loading ? "Đang đặt hàng..." : "Đặt hàng"}
        </button>
      </form>

      {/* RIGHT: Summary */}
      <div className="bg-white shadow rounded-lg p-5 h-fit">
        <h2 className="text-xl font-bold mb-3">Tóm tắt đơn hàng</h2>

        <div className="space-y-1 text-sm">
          {cart.map((it) => (
            <div key={`${it.id}-${it.qty}`} className="flex justify-between">
              <span>{it.name || `Sản phẩm #${it.id}`} × {it.qty}</span>
            </div>
          ))}
        </div>

        <hr className="my-3" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between"><span>Tạm tính</span><span>{fVND(quote.subtotal)}</span></div>
          <div className="flex justify-between"><span>Phí vận chuyển</span><span>{fVND(quote.shipping)}</span></div>
          <div className="flex justify-between"><span>Giảm giá</span><span>-{fVND(quote.discount)}</span></div>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Tổng cộng</span>
          <span>{fVND(quote.total)}</span>
        </div>
        {quoting && <div className="text-xs text-gray-500 mt-2">Đang cập nhật tạm tính…</div>}
      </div>
    </div>
  );
}
