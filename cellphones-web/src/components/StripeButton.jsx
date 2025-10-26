import axios from "axios";

export default function StripeButton({ orderId, total }) {
  const handlePay = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/v1/payment/stripe/create",
        { order_id: orderId }
      );
      window.location.href = res.data.pay_url;
    } catch (err) {
      console.error(err);
      alert("Không thể tạo phiên thanh toán!");
    }
  };

  return (
    <button
      onClick={handlePay}
      className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
    >
      Thanh toán bằng Stripe
    </button>
  );
}
