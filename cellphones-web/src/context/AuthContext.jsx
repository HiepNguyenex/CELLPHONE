// === FILE: src/context/AuthContext.jsx ===
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getUser, login as apiLogin, register as apiRegister, logout as apiLogout } from "../services/api";

export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const [user, setUser]   = useState(null);
  const [loading, setLoading] = useState(true);

  // Tự load /v1/user nếu đang có token hoặc admin_token
  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const hasToken =
          !!localStorage.getItem("admin_token") || !!localStorage.getItem("token");
        if (!hasToken) {
          setLoading(false);
          return;
        }
        const res = await getUser(ac.signal);
        setUser(res?.data ?? res ?? null);
      } catch {
        // token hỏng → xoá để tránh vòng lặp 401
        localStorage.removeItem("token");
        localStorage.removeItem("admin_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  // ==== Actions người dùng (không dùng cho admin_login) ====
  const login = async (email, password) => {
    const res = await apiLogin({ email, password });
    // BE trả { token, user }
    const data = res?.data ?? {};
    if (data?.token) localStorage.setItem("token", data.token);
    if (data?.user)  setUser(data.user);
    return data;
  };

  const register = async (name, email, password) => {
    return apiRegister({ name, email, password });
  };

  const logout = async () => {
    try { await apiLogout(); } catch {}
    localStorage.removeItem("token");
    localStorage.removeItem("admin_token");
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    setUser,
    isAdmin: !!user?.is_admin,
  }), [user, loading]);
     


  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
