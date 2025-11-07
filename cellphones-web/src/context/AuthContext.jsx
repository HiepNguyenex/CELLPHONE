// === FILE: src/context/AuthContext.jsx ===
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  getUser,
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from "../services/api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // bootstrap flag

  // Bootstrap: nếu có token thì gọi /v1/user để lấy thông tin
  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        const hasToken =
          !!localStorage.getItem("admin_token") ||
          !!localStorage.getItem("token");

        if (!hasToken) {
          setLoading(false);
          return;
        }

        const res = await getUser(ac.signal);
        setUser(res?.data ?? res ?? null);
      } catch (e) {
        // ❗ KHÔNG xoá token nếu chỉ lỗi mạng/CORS/hủy request
        const status = e?.response?.status;
        const isCanceled = e?.code === "ERR_CANCELED" || e?.name === "AbortError";

        if (!isCanceled && status === 401) {
          // Chỉ khi BE xác nhận token không hợp lệ
          localStorage.removeItem("token");
          localStorage.removeItem("admin_token");
          setUser(null);
        } else {
          // Giữ nguyên token để lần sau thử lại
          // console.warn("[Auth] bootstrap failed:", e);
        }
      } finally {
        setLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  // ==== Actions người dùng (không dùng cho admin_login) ====
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    const data = res?.data ?? {};

    const token = data?.token || data?.access_token;
    if (token) localStorage.setItem("token", token);

    if (data?.user) {
      setUser(data.user);
    } else {
      // fallback đảm bảo đồng bộ user sau đăng nhập
      try {
        const me = await getUser();
        setUser(me?.data ?? me ?? null);
      } catch {}
    }
    return data;
  };

  const register = async (name, email, password) => {
    return apiRegister({ name, email, password });
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,          // dùng flag này trong PrivateRoute để chờ bootstrap xong
      login,
      register,
      logout,
      setUser,
      isAdmin: !!user?.is_admin,
    }),
    [user, loading]
  );      
  

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
