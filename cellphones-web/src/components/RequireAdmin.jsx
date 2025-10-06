import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to={`/login?next=${location.pathname}`} replace />;
  }

  if (!user.is_admin) {
    // Nếu không phải admin thì chặn
    return <Navigate to="/" replace />;
  }

  return children;
}
