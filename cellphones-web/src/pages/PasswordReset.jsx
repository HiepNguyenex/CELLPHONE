import { useState } from "react";

export default function PasswordReset() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Sau này bạn sẽ gọi API gửi mail reset ở đây
    console.log("📩 Gửi yêu cầu reset cho:", email);

    setSubmitted(true);
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Quên mật khẩu</h1>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <p className="text-gray-600 text-sm">
            Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="border p-2 rounded"
          />
          <button
            type="submit"
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700"
          >
            Gửi yêu cầu
          </button>
        </form>
      ) : (
        <p className="text-green-600 font-semibold">
          ✅ Yêu cầu đã được gửi! Vui lòng kiểm tra email của bạn.
        </p>
      )}
    </div>
  );
}
