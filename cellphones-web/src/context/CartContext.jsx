import { createContext, useContext, useState, useEffect, useMemo } from "react";

const CartContext = createContext();

function makeLineKey(product) {
  return JSON.stringify({
    id: product.id,
    variant_id: product.variant_id || null,
    addons: Array.isArray(product?.services?.warranty_options)
      ? [...product.services.warranty_options].sort()
      : [],
  });
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ⚡ Tạo "lineId" duy nhất cho mỗi dòng (id + variant + addons)
  const addToCart = (product) => {
    setCart((prev) => {
      const lineId = makeLineKey(product);
      const idx = prev.findIndex((it) => it.lineId === lineId);

      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: Number(next[idx].qty || 0) + 1 };
        return next;
      }

      return [
        ...prev,
        {
          ...product,
          lineId,
          qty: 1,
          image: product.image_url || "https://via.placeholder.com/150x150?text=No+Image",
        },
      ];
    });
  };

  // ⚡ Dựa theo lineId — KHÔNG dùng product id nữa
  const updateQty = (lineId, qty) => {
    setCart((prev) =>
      prev.map((it) =>
        it.lineId === lineId
          ? { ...it, qty: Math.max(1, Number(qty) || 1) }
          : it
      )
    );
  };

  const removeFromCart = (lineId) =>
    setCart((prev) => prev.filter((item) => item.lineId !== lineId));

  const clearCart = () => setCart([]);

  const total = useMemo(
    () => cart.reduce((s, it) => s + Number(it.price || it.final_price || it.sale_price || 0) * Number(it.qty || 0), 0),
    [cart]
  );

  const count = useMemo(
    () => cart.reduce((s, it) => s + Number(it.qty || 0), 0),
    [cart]
  );

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total, count }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
