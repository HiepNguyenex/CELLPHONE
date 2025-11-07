// File: src/components/product/StoreAvailability.jsx (Mã giả định đã sửa)

import React, { useState, useMemo } from 'react';
import StoreIframeMap from './StoreIframeMap'; // 🚀 Nhúng component Iframe Map

// 💡 DỮ LIỆU GIẢ ĐỊNH (Sẽ được thay thế bằng dữ liệu thực từ API)
const MOCK_STORES = [
    { 
        id: 1, 
        name: "CPS TPHCM (Quận 10)", 
        stock: 5, 
        lat: 10.7712, 
        lng: 106.6901,
        address: "123 Sư Vạn Hạnh, Q.10"
    },
    { 
        id: 2, 
        name: "CPS Hà Nội (Hoàn Kiếm)", 
        stock: 3, 
        lat: 21.0285, 
        lng: 105.8542,
        address: "456 Hàng Bài, Q.Hoàn Kiếm"
    },
    { 
        id: 3, 
        name: "CPS Đà Nẵng (Hải Châu)", 
        stock: 8, 
        lat: 16.0544, 
        lng: 108.2022,
        address: "789 Điện Biên Phủ, Q.Hải Châu"
    },
];

export default function StoreAvailability({ productId }) {
    // State lưu trữ id của cửa hàng đang được chọn (mặc định là cửa hàng đầu tiên)
    const [selectedStoreId, setSelectedStoreId] = useState(MOCK_STORES[0]?.id);

    // Tính toán cửa hàng được chọn
    const selectedStore = useMemo(() => {
        return MOCK_STORES.find(store => store.id === selectedStoreId);
    }, [selectedStoreId]);

    // Lấy tọa độ
    const storeLocation = selectedStore ? { lat: selectedStore.lat, lng: selectedStore.lng } : null;

    return (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 md:p-6 space-y-4">
            <h3 className="font-semibold text-lg">Kho hàng còn tại:</h3>
            
            {/* Danh sách cửa hàng (Click để chọn vị trí trên bản đồ) */}
            <div className="space-y-2 text-sm max-h-56 overflow-y-auto pr-2">
                {MOCK_STORES.map(store => (
                    <div 
                        key={store.id} 
                        // Thêm hiệu ứng chọn
                        className={`flex justify-between items-center p-2 rounded-lg cursor-pointer transition 
                                  ${store.id === selectedStoreId ? 'bg-red-50 ring-2 ring-red-400' : 'hover:bg-gray-50'}`}
                        onClick={() => setSelectedStoreId(store.id)}
                    >
                        <div className="flex flex-col">
                            <div className="font-medium text-gray-800">{store.name}</div>
                            <div className="text-gray-600 text-xs">{store.address}</div>
                        </div>
                        <div className={`font-semibold text-right ${store.stock > 0 ? 'text-emerald-600' : 'text-gray-500'}`}>
                            {store.stock > 0 ? `Còn (${store.stock})` : 'Hết'}
                        </div>
                    </div>
                ))}
            </div>

            {/* BẢN ĐỒ INLINE (Sử dụng Iframe Map) */}
            <div className="pt-4 border-t border-gray-100">
                <h4 className="font-semibold text-base mb-3 text-center text-gray-800">
                    {selectedStore ? `📍 Xem vị trí: ${selectedStore.name}` : 'Chọn cửa hàng để xem vị trí'}
                </h4>
                <div className="rounded-lg overflow-hidden shadow-md">
                    <StoreIframeMap 
                        storeLocation={storeLocation} 
                        storeName={selectedStore?.name} 
                    />
                </div>
            </div>
        </div>
    );
}