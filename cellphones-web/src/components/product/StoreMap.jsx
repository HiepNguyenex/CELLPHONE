// File: src/components/product/StoreMap.jsx

import React, { useCallback, useState } from "react";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "250px", // Chiều cao tối ưu cho bản đồ inline
};

// ⚠️ BẮT BUỘC: Thay thế khóa API này bằng API Key Google Maps của bạn
const GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY";

export default function StoreMap({ storeLocation, storeName }) {
  const { isLoaded } = useJsApiLoader({
    id: "store-map-script", 
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  const [map, setMap] = useState(null);

  const onLoad = useCallback(function callback(map) {
    map.setZoom(14); // Mức zoom mặc định
    setMap(map);
  }, []);

  const onUnmount = useCallback(function callback(map) {
    setMap(null);
  }, []);

  // Vị trí mặc định (dự phòng)
  const center = storeLocation || { lat: 10.8231, lng: 106.6297 }; 
  const storeNameDisplay = storeName || "Vị trí Cửa hàng";

  if (!isLoaded) {
    return (
      <div style={containerStyle} className="flex items-center justify-center bg-gray-100 rounded-lg">
        Đang tải bản đồ...
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={14}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
        zoomControl: true,
      }}
    >
      <Marker
        position={center}
        title={storeNameDisplay}
      />
    </GoogleMap>
  );
}