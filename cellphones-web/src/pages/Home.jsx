import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductGrid from "../components/ProductGrid";
import api from "../services/api";

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [hotSale, setHotSale] = useState([]);
  const [phones, setPhones] = useState([]);
  const [laptops, setLaptops] = useState([]);

useEffect(() => {
  api.get("/v1/products?featured=1&per_page=8").then(res => setFeatured(res.data.data || []));
  api.get("/v1/products?sort=price_desc&per_page=8").then(res => setHotSale(res.data.data || []));
  api.get("/v1/products?category_id=1&per_page=8").then(res => setPhones(res.data.data || []));
  api.get("/v1/products?category_id=2&per_page=8").then(res => setLaptops(res.data.data || []));
}, []);


  return (
    <div className="max-w-7xl mx-auto mt-6">
      <div className="flex gap-4">
        <Sidebar />
        <div className="flex-1">
          <BannerCarousel />
        </div>
      </div>

      <ProductGrid title="🔥 Sản phẩm nổi bật" products={featured} />
      <ProductGrid title="⚡ Hot Sale cuối tuần" products={hotSale} />
      <ProductGrid title="📱 Điện thoại nổi bật" products={phones} />
      <ProductGrid title="💻 Laptop Gaming" products={laptops} />
    </div>
  );
}
