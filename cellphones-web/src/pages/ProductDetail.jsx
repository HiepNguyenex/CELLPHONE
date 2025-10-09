// ⚡ SỬA: src/pages/ProductDetail.jsx
import { useParams, useNavigate, Link } from "react-router-dom"; // ✅ THÊM Link
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../services/api";
import WishlistButton from "../components/WishlistButton";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/v1/products/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => console.error("Lỗi khi tải sản phẩm:", err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto mt-8 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
          <div className="space-y-3">
            <div className="h-8 w-2/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-6 w-1/3 bg-gray-100 rounded animate-pulse" />
            <div className="h-28 w-full bg-gray-100 rounded animate-pulse" />
            <div className="h-10 w-40 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) return <p className="text-center mt-10">❌ Không tìm thấy sản phẩm</p>;

  const price = Number(product.price || 0);
  const salePrice = product.sale_price ? Number(product.sale_price) : null;

  const handleAddToCart = () => {
    addToCart(product);
    navigate("/cart");
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square w-full overflow-hidden rounded-lg bg-gray-50">
          <img
            src={product.image_url || "https://via.placeholder.com/600x600?text=No+Image"}
            alt={product.name || "Sản phẩm"}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/600x600?text=No+Image";
            }}
          />
        </div>

        <div>
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

          {/* ✅ THÊM: hiển thị Thương hiệu và Danh mục (có link lọc search) */}
          <div className="text-sm text-gray-600 mb-3 space-x-2">
            {product?.brand && (
              <span>
                Thương hiệu:{" "}
                <Link
                  to={`/search?brand_id=${product.brand.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {product.brand.name}
                </Link>
              </span>
            )}
            {product?.category && (
              <span>
                {" • "}Danh mục:{" "}
                <Link
                  to={`/search?category_id=${product.category.id}`}
                  className="font-medium text-blue-600 hover:underline"
                >
                  {product.category.name}
                </Link>
              </span>
            )}
          </div>

          {/* Giá */}
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

          <p className="mt-2 text-gray-700">
            {product.description || "Chưa có mô tả"}
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700"
            >
              Thêm vào giỏ hàng
            </button>

            {/* Nút yêu thích */}
            <WishlistButton productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
