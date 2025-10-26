import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * Bọc quanh các route cần đăng nhập.
 * - Nếu chưa login -> chuyển về /login?next=<url hiện tại>
 * - Nếu requireAdmin=true -> chỉ cho phép user có is_admin=true hoặc role='admin'
 */
export default function RequireAuth({ children, requireAdmin = false }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Trong lúc đang fetch me() thì show loading ngắn
  if (loading) {
    return (
      <div className="w-full py-20 text-center text-gray-600">
        Đang kiểm tra phiên đăng nhập…
      </div>
    );
  }

  if (!user) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?next=${next}`} replace />;
  }

  if (requireAdmin) {
    const isAdmin = Boolean(user?.is_admin) || user?.role === "admin";
    if (!isAdmin) return <Navigate to="/" replace />;
  }

  return children;
}
