import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import WishlistButton from "./WishlistButton";
import { toVND } from "../utils/money";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();

  const price = Number(product?.price || 0);
  const sale = product?.sale_price != null ? Number(product.sale_price) : null;

  const handleAdd = () =>
    addToCart({
      id: product.id,
      name: product.name,
      price: sale ?? price,          // ưu tiên giá sale nếu có
      image_url: product.image_url,
    });

  return (
    <div className="border rounded-lg p-4 shadow hover:shadow-xl transition bg-white flex flex-col relative">
      {/* Nút yêu thích góc phải */}
      <WishlistButton productId={product.id} className="absolute top-2 right-2" label="" />

      {/* Ảnh → sang chi tiết */}
      <Link to={`/product/${product.id}`}>
        <div className="relative">
          <img
            src={product.image_url}
            alt={product.name}
            className="rounded mb-3 h-40 w-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://dummyimage.com/300x200/cccccc/000000&text=No+Image";
            }}
          />

          {/* Badge giảm giá nếu có sale_price */}
          {sale != null && sale < price && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              Giảm giá
            </span>
          )}
        </div>
      </Link>

      {/* Tên sản phẩm */}
      <h3 className="font-semibold text-sm md:text-base line-clamp-2 flex-grow text-black">
        {product.name || "Tên sản phẩm"}
      </h3>

      {/* Giá */}
      <div className="mt-2">
        {sale != null && sale < price ? (
          <>
            <p className="text-red-600 font-bold">{toVND(sale)}</p>
            <p className="text-gray-400 line-through text-sm">{toVND(price)}</p>
          </>
        ) : (
          <p className="text-red-600 font-bold">{toVND(price)}</p>
        )}
      </div>

      {/* Nút mua */}
      <button
        onClick={handleAdd}
        className="mt-3 bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition"
      >
        Mua ngay
      </button>
    </div>
  );
}
