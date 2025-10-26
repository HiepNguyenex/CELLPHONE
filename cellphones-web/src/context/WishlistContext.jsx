import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { fetchWishlist, addWishlist, removeWishlist } from "../services/api";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  // Load wishlist khi đã đăng nhập
  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    (async () => {
      try {
        setLoading(true);
        const { data } = await fetchWishlist();
        const arr = (data?.data || []).map((x) => Number(x.id));
        setIds(new Set(arr));
      } catch (e) {
        console.error("Wishlist load error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const value = useMemo(() => ({
    loading,
    count: ids.size,
    ids,
    has: (pid) => ids.has(Number(pid)),
    add: async (pid) => {
      pid = Number(pid);
      await addWishlist(pid);
      setIds((prev) => new Set([...prev, pid]));
    },
    remove: async (pid) => {
      pid = Number(pid);
      await removeWishlist(pid);
      setIds((prev) => {
        const next = new Set(prev); next.delete(pid); return next;
      });
    },
    toggle: async (pid) => {
      pid = Number(pid);
      if (ids.has(pid)) {
        await removeWishlist(pid);
        setIds((prev) => { const n = new Set(prev); n.delete(pid); return n; });
        return false;
      } else {
        await addWishlist(pid);
        setIds((prev) => new Set([...prev, pid]));
        return true;
      }
    }
  }), [ids, loading]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => useContext(WishlistContext);
