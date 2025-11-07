// === FILE: src/pages/Checkout.jsx ===
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { quoteCheckout, createOrder, mapCartToItems, stripeCreate } from "../services/api";
import { useAuth } from "../context/AuthContext";
import useToast from "../components/Toast";

const fVND = (n) =>
  new Intl.NumberFormat("vi-VN").format(Number(n || 0)) + " ₫";

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, clearCart } = useCart();
  const toast = useToast();

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

  const [quote, setQuote] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
    coupon_code: null,
  });

  const [quoting, setQuoting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Ép đăng nhập
  useEffect(() => {
    if (!user) navigate("/login?next=/checkout");
  }, [user, navigate]);

  // Không có hàng -> về giỏ
  useEffect(() => {
    if (!cart?.length) navigate("/cart");
  }, [cart?.length, navigate]);

  const basePayload = useMemo(
    () => ({
      items: mapCartToItems(cart),
      shipping_method: form.shipping_method,
      coupon: form.coupon ? String(form.coupon).trim().toUpperCase() : null,
    }),
    [cart, form.shipping_method, form.coupon]
  );

  // Tính tạm tính
  useEffect(() => {
    if (!cart?.length) return;
    let cancelled = false;
    (async () => {
      try {
        setQuoting(true);
        const { data } = await quoteCheckout(basePayload);
        if (cancelled) return;
        setQuote({
          subtotal: data?.subtotal || 0,
          shipping: data?.shipping || 0,
          discount: data?.discount || 0,
          total: data?.total || 0,
          coupon_code: data?.coupon_code || null,
        });
      } catch (e) {
        if (cancelled) return;
        const msg =
          e?.response?.data?.message || "Không tính được tạm tính. Hãy thử lại.";
        toast.error(msg, { title: "Lỗi báo giá" });
        setQuote((q) => ({
          ...q,
          discount: 0,
          coupon_code: null,
          total: (q.subtotal || 0) + (q.shipping || 0),
        }));
      } finally {
        if (!cancelled) setQuoting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [basePayload, cart?.length, toast]);

  const onChange = (e) => {
    const { name, value, type } = e.target;
    setForm((s) => ({ ...s, [name]: type === "radio" ? value : value }));
  };

  // Áp dụng mã giảm giá
  const applyCoupon = async () => {
    if (!cart?.length) return;
    if (!form.coupon?.trim()) {
      toast.info("Bạn chưa nhập mã giảm giá.", { title: "Mã giảm giá" });
      return;
    }
    try {
      setApplyingCoupon(true);
      const payload = {
        items: mapCartToItems(cart),
        shipping_method: form.shipping_method,
        coupon: form.coupon.trim().toUpperCase(),
      };
      const { data } = await quoteCheckout(payload);
      setQuote({
        subtotal: data?.subtotal || 0,
        shipping: data?.shipping || 0,
        discount: data?.discount || 0,
        total: data?.total || 0,
        coupon_code: data?.coupon_code || form.coupon.trim().toUpperCase(),
      });
      toast.success(
        `Đã áp dụng mã ${data?.coupon_code || form.coupon.trim().toUpperCase()}.`,
        { title: "Áp dụng thành công" }
      );
    } catch (e) {
      const msg =
        e?.response?.data?.message || "Mã giảm giá không hợp lệ hoặc đã hết hạn.";
      toast.warning(msg, { title: "Không áp dụng được mã" });
      setQuote((q) => ({
        ...q,
        discount: 0,
        coupon_code: null,
        total: (q.subtotal || 0) + (q.shipping || 0),
      }));
    } finally {
      setApplyingCoupon(false);
    }
  };

  // Gửi đơn hàng
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
      tId = toast.loading("Đang tạo đơn hàng…", { title: "Vui lòng chờ" });

      const { data } = await createOrder(payload);
      const createdId = data?.order?.id ?? data?.id;
      clearCart();

      if (form.payment_method === "stripe") {
        // ✅ Gọi qua API chuẩn (không hard-code 127.0.0.1)
        const res = await stripeCreate(createdId);
        const payUrl = res?.data?.pay_url;
        toast.update(tId, {
          type: "success",
          title: "Đang chuyển đến Stripe",
          description: "Vui lòng hoàn tất thanh toán trên Stripe Checkout.",
          duration: 2000,
        });
        if (payUrl) window.location.href = payUrl;
        else navigate(`/order/${createdId}`); // fallback
        return;
      }

      // ✅ COD
      toast.update(tId, {
        type: "success",
        title: "Đặt hàng thành công",
        description: data?.order?.code
          ? `Mã đơn: ${data.order.code}`
          : "Cảm ơn bạn đã mua hàng.",
        duration: 4000,
      });
      navigate(createdId ? `/order/${createdId}` : "/thank-you");
    } catch (e) {
      console.error(e);
      const message = e?.response?.data?.message || "Đặt hàng thất bại.";
      toast.update(tId, {
        type: "error",
        title: "Đặt hàng thất bại",
        description: message,
        duration: 4500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 p-6 grid md:grid-cols-3 gap-6">
      {/* LEFT: Form */}
      <form
        onSubmit={submitOrder}
        className="md:col-span-2 bg-white shadow rounded-lg p-5 space-y-5"
      >
        <h1 className="text-2xl font-bold">Thanh toán</h1>

        {/* Thông tin người nhận */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Họ tên *</label>
            <input
              name="name"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Số điện thoại *</label>
            <input
              name="phone"
              value={form.phone}
              onChange={onChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              className="w-full border rounded p-2"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Địa chỉ *</label>
            <input
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full border rounded p-2"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Ghi chú</label>
            <textarea
              name="note"
              value={form.note}
              onChange={onChange}
              className="w-full border rounded p-2"
              rows={3}
            />
          </div>
        </div>

        {/* Phương thức */}
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
            <label className="flex items-center gap-2 mt-2">
              <input
                type="radio"
                name="payment_method"
                value="stripe"
                checked={form.payment_method === "stripe"}
                onChange={onChange}
              />
              <span>Stripe (thanh toán online)</span>
            </label>
          </div>
        </div>

        {/* Mã giảm giá */}
        <div className="flex items-end gap-2">
          <div className="flex-1">
            <label className="block text-sm mb-1">Mã giảm giá</label>
            <input
              name="coupon"
              value={form.coupon}
              onChange={onChange}
              placeholder="VD: WELCOME10"
              className="w-full border rounded p-2"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 border rounded"
            onClick={applyCoupon}
            disabled={applyingCoupon || quoting}
          >
            {applyingCoupon ? "Đang áp dụng…" : "Áp dụng"}
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
            <div key={it.id} className="flex justify-between">
              <span>{it.name} × {it.qty}</span>
            </div>
          ))}
        </div>

        <hr className="my-3" />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span>{fVND(quote.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Phí vận chuyển</span>
            <span>{fVND(quote.shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span>Giảm giá</span>
            <span>-{fVND(quote.discount)}</span>
          </div>
        </div>
        <hr className="my-3" />
        <div className="flex justify-between font-semibold text-lg">
          <span>Tổng cộng</span>
          <span>{fVND(quote.total)}</span>
        </div>
        {quoting && (
          <div className="text-xs text-gray-500 mt-2">
            Đang cập nhật tạm tính…
          </div>
        )}
      </div>
    </div>
  );
}
