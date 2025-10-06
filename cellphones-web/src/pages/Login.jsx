import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate("/my-account");
    } catch {
      setError("Sai email hoặc mật khẩu");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Đăng nhập</h1>
      {error && <p className="text-red-600 mb-2">{error}</p>}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Email"
          className="border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-red-600 text-white py-2 rounded hover:bg-red-700">
          Đăng nhập
        </button>
      </form>

      <div className="flex justify-between mt-4 text-sm">
        <Link to="/password-reset" className="text-blue-600 hover:underline">
          Quên mật khẩu?
        </Link>
        <Link to="/register" className="text-blue-600 hover:underline">
          Chưa có tài khoản? Đăng ký
        </Link>
      </div>
    </div>
  );
}
