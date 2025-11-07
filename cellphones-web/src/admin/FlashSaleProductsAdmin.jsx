// File: src/admin/FlashSaleProductsAdmin.jsx (FINAL - HỖ TRỢ CHỌN SẢN PHẨM NỔI BẬT)

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminGetFlashSaleProductsAdmin, adminUpsertFlashSaleProduct } from '../services/api';
import { XCircleIcon, CheckCircleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

// Helper: Định dạng tiền tệ
const formatCurrency = (amount) => Number(amount || 0).toLocaleString('vi-VN') + ' ₫';
// Helper: Chuyển đường dẫn ảnh tương đối sang tuyệt đối
const resolveImg = (u) => u && /^https?:\/\//i.test(u) ? u : `${import.meta.env.VITE_API_URL.replace('/api', '')}/${String(u || '').replace(/^\/+/, "")}`;

// --- Component Chính ---
export default function FlashSaleProductsAdmin() {
    const { id: saleId } = useParams();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({ q: '', page: 1, per_page: 20 });
    const [meta, setMeta] = useState({});
    
    // State lưu trữ giá trị đang chỉnh sửa (giá sale/%)
    const [editCache, setEditCache] = useState({});

    // Hàm tải dữ liệu
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await adminGetFlashSaleProductsAdmin(saleId, filters);
            
            const list = res.data?.data || [];
            setProducts(list);
            setMeta(res.data);
            
            // Khởi tạo editCache từ dữ liệu hiện có
            const initialCache = {};
            list.forEach(p => {
                if (p.flash_sale_price !== null || p.discount_percent !== null) {
                    initialCache[p.id] = {
                        flash_sale_price: p.flash_sale_price || '', 
                        discount_percent: p.discount_percent || '',
                        is_active: p.is_sale_active ?? false,
                        // 🚀 BỔ SUNG: Khởi tạo trạng thái nổi bật
                        is_featured: p.is_featured ?? false, 
                    };
                }
            });
            setEditCache(initialCache);

        } catch (err) {
            console.error("Lỗi Fetch Products Admin:", err);
            // alert('Lỗi khi tải dữ liệu sản phẩm: Vui lòng kiểm tra API Backend Admin.'); // Bỏ alert này để UI không bị chặn
            setError("Không tải được danh sách sản phẩm.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filters.page, filters.per_page]);
    
    // Hàm xử lý khi thay đổi giá trị trong ô input
    const handleValueChange = (productId, field, value) => {
        setEditCache(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                [field]: value === '' ? '' : value, 
                is_active: prev[productId]?.is_active ?? true,
                // Giữ nguyên is_featured nếu không phải trường đang thay đổi
                is_featured: prev[productId]?.is_featured ?? false, 
            }
        }));
    };
    
    // Helper để xác định sản phẩm đã được chỉnh sửa hay chưa
    const isProductEdited = (product) => {
        const cache = editCache[product.id];
        if (!cache) return false;
        
        // 1. So sánh Giá và Phần trăm
        const cachedPrice = cache.flash_sale_price === '' ? null : Number(cache.flash_sale_price);
        const cachedDiscount = cache.discount_percent === '' ? null : Number(cache.discount_percent);
        
        const originalPrice = product.flash_sale_price !== null ? Number(product.flash_sale_price) : null;
        const originalDiscount = product.discount_percent !== null ? Number(product.discount_percent) : null;
        
        const priceChanged = cachedPrice !== originalPrice || cachedDiscount !== originalDiscount;
        
        // 2. So sánh Trạng thái Nổi bật (Nếu cột is_featured đã có trong product object)
        const cachedFeatured = cache.is_featured ?? false;
        const originalFeatured = product.is_featured ?? false;
        const featuredChanged = cachedFeatured !== originalFeatured;
        
        return priceChanged || featuredChanged;
    };
    
    // Hàm lưu (upsert) sản phẩm
    const handleSave = async (product) => {
        const cache = editCache[product.id];

        if (!cache || (!cache.flash_sale_price && !cache.discount_percent)) {
            return alert('Vui lòng nhập giá sale hoặc phần trăm giảm.');
        }

        const payload = {
            product_id: product.id,
            sale_price: cache.flash_sale_price !== '' ? Number(cache.flash_sale_price) : null,
            discount_percent: cache.discount_percent !== '' ? Number(cache.discount_percent) : null,
            is_active: cache.is_active ?? true,
            // 🚀 BỔ SUNG: Gửi trạng thái nổi bật lên Backend
            is_featured: cache.is_featured ?? false,
        };

        try {
            await adminUpsertFlashSaleProduct(saleId, payload);
            alert(`Đã lưu ${product.name} vào Flash Sale!`);
            fetchData(); // Tải lại dữ liệu
        } catch (err) {
            alert('Lỗi lưu sản phẩm: ' + (err.response?.data?.message || err.message));
        }
    };
    
    // Hàm xóa (dùng is_active=false)
    const handleRemove = async (productId) => {
        if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này khỏi Flash Sale?')) return;

        const payload = {
            product_id: productId,
            is_active: false, // Signal cho Backend xóa FlashSaleItem
        };

        try {
            await adminUpsertFlashSaleProduct(saleId, payload); 
            alert('Đã xóa sản phẩm khỏi Flash Sale.');
            fetchData();
        } catch (err) {
             alert('Lỗi xóa sản phẩm: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) return <p className="p-4 flex items-center gap-2 text-gray-600">
        <ArrowPathIcon className='w-5 h-5 animate-spin' /> Đang tải danh sách sản phẩm...
    </p>;
    if (error) return <p className="p-4 text-red-600">❌ {error}</p>;

    return (
        <div className="p-4 bg-white rounded-lg shadow-sm">
            <div className="mb-4">
                <Link to="/admin/flash-sales" className="text-blue-600 hover:underline">
                    ← Quay lại Quản lý Flash Sale
                </Link>
            </div>
            
            <h1 className="text-2xl font-bold mb-6">
                Quản lý Sản phẩm cho Sự kiện #{saleId}
            </h1>
            
            {/* Thanh Tìm kiếm và Phân trang */}
            <div className="flex justify-between items-center mb-4">
                <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={filters.q}
                    onChange={(e) => setFilters(f => ({ ...f, q: e.target.value, page: 1 }))}
                    onKeyDown={(e) => e.key === 'Enter' && fetchData()}
                    className="border p-2 rounded w-64 text-sm"
                />
                <button onClick={fetchData} className="ml-3 px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">
                    Áp dụng tìm kiếm
                </button>
            </div>

            {/* Bảng Sản phẩm */}
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {/* 🚀 BỔ SUNG CỘT: Nổi bật */}
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-20">Nổi bật</th> 
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sản phẩm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá gốc</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá Sale (đ)</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">% Giảm</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái Sale</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map(product => {
                            const cache = editCache[product.id] || {
                                flash_sale_price: product.flash_sale_price || '',
                                discount_percent: product.discount_percent || '',
                                is_active: product.is_sale_active ?? false,
                                is_featured: product.is_featured ?? false, // Đảm bảo lấy giá trị gốc
                            };
                            const isInSale = product.flash_sale_item_id !== null;
                            const isEdited = isProductEdited(product); // Dùng helper

                            return (
                                <tr key={product.id}>
                                    {/* 🚀 CỘT NỔI BẬT */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            name="is_featured"
                                            checked={cache.is_featured}
                                            onChange={(e) => handleValueChange(product.id, 'is_featured', e.target.checked)}
                                            className="h-4 w-4 text-red-600 rounded"
                                            disabled={!isInSale} // Chỉ cho phép chọn nếu sản phẩm đang sale
                                        />
                                    </td>
                                    {/* Cột sản phẩm */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={resolveImg(product.image_url)} alt={product.name} className="h-10 w-10 object-cover rounded mr-3 flex-shrink-0" />
                                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {product.name}
                                            </div>
                                        </div>
                                    </td>
                                    {/* Cột giá gốc */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatCurrency(product.price)}
                                    </td>
                                    {/* Cột Giá Sale */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            placeholder="Giá Sale"
                                            value={cache.flash_sale_price}
                                            onChange={(e) => handleValueChange(product.id, 'flash_sale_price', e.target.value)}
                                            className="w-28 border p-1 rounded text-sm"
                                        />
                                    </td>
                                    {/* Cột % Giảm */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        <input
                                            type="number"
                                            placeholder="% Giảm"
                                            value={cache.discount_percent}
                                            onChange={(e) => handleValueChange(product.id, 'discount_percent', e.target.value)}
                                            className="w-20 border p-1 rounded text-sm"
                                        />
                                    </td>
                                    {/* Cột Trạng thái */}
                                    <td className="px-4 py-4 whitespace-nowrap">
                                        {isInSale ? (
                                            <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800">Đang Sale</span>
                                        ) : (
                                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">Không Sale</span>
                                        )}
                                    </td>
                                    {/* Cột Thao tác */}
                                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleSave(product)}
                                            className={`px-3 py-1 mr-2 rounded text-white text-xs transition ${
                                                isEdited || !isInSale ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
                                            }`}
                                            disabled={!isEdited && isInSale}
                                        >
                                            <CheckCircleIcon className='w-4 h-4 inline mr-1' /> Lưu Sale
                                        </button>
                                        {isInSale && (
                                            <button
                                                onClick={() => handleRemove(product.id)}
                                                className="px-3 py-1 rounded text-white bg-red-600 hover:bg-red-700 text-xs"
                                            >
                                                <XCircleIcon className='w-4 h-4 inline mr-1' /> Xóa Sale
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            
            {products.length === 0 && !loading && <p className="text-center py-6 text-gray-600">Không tìm thấy sản phẩm nào khớp với tiêu chí.</p>}
            
            {/* 💡 Pagination control sẽ được thêm vào đây */}
        </div>
    );
}