import { useAuth } from "../context/AuthContext";

export default function MyAccount() {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto mt-12 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">👤 Tài khoản của tôi</h1>

      {user ? (
        <>
          <p><strong>Họ tên:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Vai trò:</strong> {user.role}</p>

          <button
            onClick={logout}
            className="mt-6 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900"
          >
            Đăng xuất
          </button>
        </>
      ) : (
        <p>Bạn chưa đăng nhập</p>
      )}
    </div>
  );
}
