// File: src/pages/FlashSalePage.jsx (SỬA LỖI TypeError: Cannot read properties of null)

import React, { useEffect, useState } from "react";
import { getFlashSales } from "../services/api";

// 🚀 SỬA IMPORT để khớp với cấu trúc thư mục của bạn
import ProductGrid from "../components/ProductGrid"; 
import SkeletonGrid from "../components/SkeletonGrid"; 
// Giả định bạn có component SkeletonProductCard trong thư mục components

export default function FlashSalePage() {
    const [salesData, setSalesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        document.title = "Flash Sale | Cellphones Clone";
        const ac = new AbortController();
        setLoading(true);

        // getFlashSales (getCurrentFlashSaleForHome) trả về 1 đối tượng Flash Sale hoặc null
        getFlashSales(ac.signal) 
            .then(data => {
                setError(null); // Xóa lỗi cũ
                if (data && typeof data === 'object' && Array.isArray(data.products)) { 
                    if (data.products.length > 0) {
                        setSalesData(data);
                    } else {
                        // Trường hợp có sự kiện nhưng không có sản phẩm nào được gán
                        setError("Chương trình Flash Sale đang hoạt động nhưng chưa có sản phẩm nào được gán.");
                    }
                } else {
                    // Xử lý trường hợp data không hợp lệ hoặc null
                    setError("Hiện tại không có chương trình Flash Sale nào đang diễn ra.");
                }
            })
            .catch(err => {
                if (err.name !== 'CanceledError') {
                    console.error("Lỗi tải Flash Sale:", err);
                    setError("Không thể tải dữ liệu Flash Sale. Vui lòng thử lại.");
                }
            })
            .finally(() => {
                setLoading(false);
            });

        return () => ac.abort();
    }, []);

    if (loading) {
        return (
            <div className="max-w-[1280px] mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Ưu Đãi Flash Sale</h1>
                <SkeletonGrid count={12} /> 
            </div>
        );
    }
    
    if (error) {
        return <p className="text-center mt-10 text-red-600">❌ {error}</p>;
    }
    
    // Nếu salesData là null hoặc products rỗng, nhưng đã pass qua check lỗi (chắc chắn không xảy ra nếu logic lỗi đúng)
    const products = salesData?.products || []; 

    // Chuyển đổi format sản phẩm để ProductGrid hiểu 
    const productGridFormat = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        image_url: p.image_url,
        // Đảm bảo ProductGrid dùng đúng trường giá
        price: p.original_price, 
        sale_price: p.flash_sale_price,
        final_price: p.flash_sale_price,
        discount_percent: p.discount_percent,
    }));


    return (
        <div className="max-w-[1280px] mx-auto px-4 py-8">
            {/* 🚀 FIX LỖI: Dùng optional chaining (?.) để kiểm tra an toàn */}
            <h1 className="text-3xl font-bold mb-6 text-red-600 border-b pb-3">
                {salesData?.name || "Ưu Đãi Flash Sale"}
            </h1>
            
            {productGridFormat.length > 0 ? (
                <ProductGrid 
                    products={productGridFormat} 
                    // Dùng optional chaining cho title
                    title={`Giảm giá lên tới ${productGridFormat[0]?.discount_percent || 0}%`}
                    hideTitle={true}
                />
            ) : (
                <p className="text-center text-gray-600">Không có sản phẩm nào trong đợt Flash Sale này.</p>
            )}
        </div>
    );
}