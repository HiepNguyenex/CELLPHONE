// File: src/components/product/StoreIframeMap.jsx

import React, { useMemo } from "react";

const containerStyle = {
  width: "100%",
  height: "250px", 
  border: 0,
};

// Vị trí mặc định (dự phòng)
const DEFAULT_LAT = 10.8231; 
const DEFAULT_LNG = 106.6297; 
const DEFAULT_ZOOM = 14;

export default function StoreIframeMap({ storeLocation, storeName }) {
    
    const lat = storeLocation?.lat || DEFAULT_LAT;
    const lng = storeLocation?.lng || DEFAULT_LNG;
    
    // Tạo URL nhúng Google Maps
    const mapEmbedUrl = useMemo(() => {
        // Tên cửa hàng và tọa độ được nhúng vào URL query
        const query = encodeURIComponent(`${storeName || 'Cửa hàng'} @ ${lat},${lng}`);
        
        // Cú pháp Google Maps Embed API: q=query&key=API_KEY (KEY là tùy chọn cho embed cơ bản)
        return `https://maps.google.com/maps?q=${query}&z=${DEFAULT_ZOOM}&output=embed`;
        
    }, [lat, lng, storeName]);

    return (
        <iframe
            title={`Map for ${storeName}`}
            src={mapEmbedUrl}
            width="100%"
            height="250"
            style={containerStyle}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
    );
}