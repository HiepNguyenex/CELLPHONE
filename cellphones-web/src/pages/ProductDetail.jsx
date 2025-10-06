import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import WishlistButton from "../components/WishlistButton"; // 👈 thêm

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/v1/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Lỗi khi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-center mt-10">⏳ Đang tải...</p>;
  if (!product) return <p className="text-center mt-10">❌ Không tìm thấy sản phẩm</p>;

  const handleAddToCart = () => {
    addToCart(product);
    navigate("/cart");
  };

  const price = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <img
          src={product.image_url || "https://via.placeholder.com/400x300?text=No+Image"}
          alt={product.name || "Sản phẩm"}
          className="rounded-lg shadow"
        />

        <div>
          <h1 className="text-2xl font-bold mb-4">{product.name}</h1>

          <div className="mb-4">
            {salePrice ? (
              <>
                <p className="text-red-600 text-2xl font-semibold">
                  {salePrice.toLocaleString("vi-VN")} ₫
                </p>
                <p className="text-gray-500 line-through">
                  {price.toLocaleString("vi-VN")} ₫
                </p>
              </>
            ) : (
              <p className="text-red-600 text-2xl font-semibold">
                {price.toLocaleString("vi-VN")} ₫
              </p>
            )}
          </div>

          <p className="mt-4 text-gray-700">{product.description || "Chưa có mô tả"}</p>

          <p className="mt-2 text-sm text-gray-500">
            Thương hiệu: {product.brand?.name || "Không rõ"} | Danh mục: {product.category?.name || "Không rõ"}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
            >
              Thêm vào giỏ hàng
            </button>

            {/* 👇 Nút yêu thích */}
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
