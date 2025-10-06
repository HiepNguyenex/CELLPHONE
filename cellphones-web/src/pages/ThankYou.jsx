import { CheckCircle } from "lucide-react"; // cần cài lucide-react: npm i lucide-react
import { Link } from "react-router-dom";

export default function ThankYou() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-10 text-center">
        <CheckCircle className="mx-auto text-green-500 w-20 h-20 mb-6" />
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🎉 Cảm ơn bạn đã đặt hàng!
        </h1>
        <p className="text-gray-600 mb-6">
          Đơn hàng của bạn đã được đặt thành công. Chúng tôi sẽ liên hệ và giao
          hàng trong thời gian sớm nhất.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Về trang chủ
          </Link>
          <Link
            to="/orders"
            className="border border-gray-300 hover:bg-gray-100 px-6 py-3 rounded-lg font-medium transition"
          >
            Theo dõi đơn hàng
          </Link>
        </div>
      </div>
    </div>
  );
}
