// src/components/product/ProductBundles.jsx
import React, { useEffect, useState } from "react";
import { getProductBundles } from "../../services/api";
import ProductCard from "../ProductCard";

export default function ProductBundles({ productId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);

    getProductBundles(productId)
      .then((res) => {
        // API hiện tại: { product_id, base_price, bundles: [ { bundle_product: {...}, combo_price, discount_amount, discount_percent } ] }
        const basePrice = Number(res?.data?.base_price ?? 0);
        const raw = Array.isArray(res?.data?.bundles) ? res.data.bundles : [];

        // Map về "product-like" để tái dùng ProductCard
        // Hiển thị "giá khi mua kèm": sale_price = combo_price - base_price
        const mapped = raw.map((row) => {
          const p = row?.bundle_product || {};
          const combo = Number(row?.combo_price ?? 0);
          const discountedItemPrice = Math.max(combo - basePrice, 0);

          return {
            id: p.id,
            name: p.name,
            image_url: p.image_url,
            // giá gốc của sản phẩm kèm
            price: Number(p.price ?? 0),
            // giá khi mua kèm (để ProductCard hiển thị gạch giá)
            sale_price:
              Number.isFinite(discountedItemPrice) && discountedItemPrice > 0
                ? discountedItemPrice
                : null,

            // giữ thêm metadata nếu cần
            _bundle: {
              combo_price: combo,
              discount_amount: Number(row?.discount_amount ?? 0),
              discount_percent: Number(row?.discount_percent ?? 0),
              base_price: basePrice,
            },
          };
        });

        setItems(mapped);
      })
      .catch((err) => {
        console.error("Lỗi khi tải gợi ý mua kèm:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  }, [productId]);

  if (loading) return <p className="mt-6 text-gray-500">Đang tải gợi ý...</p>;
  if (!items.length) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">🎁 Mua kèm sản phẩm này</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Giá hiển thị là giá khi mua kèm sản phẩm chính.
      </p>
    </div>
  );
}
