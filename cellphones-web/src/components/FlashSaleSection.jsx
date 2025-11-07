// === FILE: src/components/FlashSaleSection.jsx (Ghi đè toàn bộ) ===

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// 🚀 IMPORT HÀM API MỚI (đã bổ sung ở api.js)
import { getCurrentFlashSaleForHome } from '../services/api'; 

// Hàm tiện ích để xử lý URL ảnh
const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u; // Nếu là URL đầy đủ (HTTP/HTTPS), dùng nguyên
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`; // Nếu không, thêm Base URL
};

// Skeleton component (Dự phòng nếu bạn chưa có)
function SkeletonProductCard() {
    return (
        <div className="rounded-lg bg-white p-4 shadow-xl animate-pulse">
            <div className="relative pt-[100%] mb-3 bg-gray-200 rounded-md"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>
    );
}


export default function FlashSaleSection() {
  const [flashSaleData, setFlashSaleData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);
    getCurrentFlashSaleForHome(ac.signal) // Gọi API đã được sửa
      .then(data => {
        // API trả về đối tượng Flash Sale hoặc null
        if (data) {
          setFlashSaleData(data); 
        }
      })
      .catch(err => {
        if (err?.name !== 'CanceledError') {
          console.error("Failed to load flash sale:", err);
        }
      })
      .finally(() => {
        setLoading(false);
      });

    return () => ac.abort();
  }, []);

  if (loading) {
    // Hiển thị skeleton
    return (
      <section className="max-w-[1280px] mx-auto px-4 py-8 my-8">
        <div className="bg-gray-200 h-64 rounded-2xl mb-6 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonProductCard /><SkeletonProductCard /><SkeletonProductCard />
        </div>
      </section>
    );
  }

  const data = flashSaleData;
  
  // Kiểm tra nếu không có sự kiện hoặc không có sản phẩm
  if (!data || !data.products || data.products.length === 0) {
    return null;
  }

  const { name, banner_image_url, products } = data;

  // Sử dụng ảnh nền động nếu có
  const sectionStyle = banner_image_url 
    ? { backgroundImage: `url(${resolveImg(banner_image_url)})`, backgroundSize: 'cover', backgroundPosition: 'center' } 
    : {};

  return (
    // 🚀 ĐÃ SỬA: Bỏ mt-10, bg-red-50, p-5 (để dùng style banner)
    <section 
      className="max-w-[1280px] mx-auto px-4 py-8 my-8 rounded-2xl overflow-hidden shadow-xl relative"
      style={sectionStyle}
    >
      {/* Lớp phủ (overlay) màu đỏ đậm, độ trong suốt tùy thuộc vào ảnh nền */}
      <div className={`absolute inset-0 z-0 bg-red-800/80 ${banner_image_url ? 'bg-opacity-50' : 'bg-opacity-100'}`}></div> 
      
      <div className="relative z-10 text-white text-center py-8">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-3 drop-shadow-lg">
          🔥 {name} SALE SỐC 🔥
        </h2>
        <p className="text-lg mb-8 opacity-90 drop-shadow">
          {data.description || 'Không thể bỏ lỡ các ưu đãi độc quyền chỉ có tại Cellphones!'}
        </p>

        {/* 🚀 ĐÃ SỬA: Hiển thị 3 sản phẩm */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-8 lg:px-12">
          {products.slice(0, 3).map(product => ( 
            <Link 
              to={`/product/${product.slug || product.id}`} 
              key={product.id} 
              className="group bg-white rounded-lg p-4 shadow-xl hover:shadow-2xl transition-transform transform duration-300 relative overflow-hidden text-black block"
            >
              {/* Badge giảm giá */}
              {product.discount_percent > 0 && (
                  <span className="absolute top-0 right-0 bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-bl-lg z-10">
                      -{product.discount_percent}%
                  </span>
              )}
              
              <div className="relative pt-[100%] mb-3"> 
                <img 
                  src={resolveImg(product.image_url)} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-contain rounded-md transition-transform group-hover:scale-105"
                />
              </div>
              <h3 className="text-md font-semibold mb-2 text-gray-900 group-hover:text-red-600 transition truncate">
                {product.name}
              </h3>
              <div className="flex flex-col items-center">
                <p className="text-red-600 text-2xl font-bold">
                  {Number(product.flash_sale_price).toLocaleString('vi-VN')} ₫
                </p>
                <p className="text-gray-500 line-through text-sm mt-1">
                  {Number(product.original_price).toLocaleString('vi-VN')} ₫
                </p>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Nút xem tất cả sản phẩm flash sale */}
        <Link 
            to="/flash-sale" 
            className="mt-10 inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-red-600 bg-white hover:bg-red-50 hover:text-red-700 transition-colors shadow-md"
        >
            Xem tất cả ưu đãi Flash Sale
        </Link>
      </div>
    </section>
  );
}