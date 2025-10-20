import { useEffect, useMemo, useState } from "react";
import Sidebar from "../components/Sidebar";
import BannerCarousel from "../components/BannerCarousel";
import ProductGrid from "../components/ProductGrid";
import FlashSaleSection from "../components/FlashSaleSection";
import BrandCarousel from "../components/ui/BrandCarousel";
import api from "../services/api";
import { Link } from "react-router-dom";

// ===== Small skeletons (khung chờ) =====
function GridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white p-3 md:p-4 ring-1 ring-gray-100 shadow-sm">
          <div className="aspect-[4/3] w-full rounded-xl bg-gray-100 animate-pulse" />
          <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
          <div className="mt-2 h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
        </div>
      ))}
    </div>
  );
}

// ===== Section wrapper =====
function SectionCard({ title, subtitle, cta, children }) {
  return (
    <section className="mt-8">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
          {subtitle && <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>}
        </div>
        {cta}
      </div>
      <div className="rounded-2xl bg-white p-3 md:p-4 ring-1 ring-gray-100 shadow-sm">
        {children}
      </div>
    </section>
  );
}

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [hotSale, setHotSale] = useState([]);
  const [phones, setPhones] = useState([]);
  const [laptops, setLaptops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = "Trang chủ | Cellphones Clone";
    let mounted = true;
    (async () => {
      try {
        const [r1, r2, r3, r4] = await Promise.all([
          api.get("/v1/products?featured=1&per_page=8"),
          api.get("/v1/products?sort=price_desc&per_page=8"),
          api.get("/v1/products?category_id=1&per_page=8"),
          api.get("/v1/products?category_id=2&per_page=8"),
        ]);
        if (!mounted) return;
        setFeatured(r1?.data?.data || []);
        setHotSale(r2?.data?.data || []);
        setPhones(r3?.data?.data || []);
        setLaptops(r4?.data?.data || []);
      } catch (e) {
        setError("Không tải được dữ liệu trang chủ. Vui lòng thử lại.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const hasAny = useMemo(
    () => featured.length || hotSale.length || phones.length || laptops.length,
    [featured, hotSale, phones, laptops]
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 md:px-6 py-4">
      {/* ===== Hero: Sidebar + Banner ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 items-start">
        <aside className="hidden lg:block rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
          <Sidebar />
        </aside>
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm overflow-hidden">
          <BannerCarousel />
        </div>
      </div>

      {/* ===== Service strip ===== */}
      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: "🚚", title: "Giao nhanh 2h", sub: "Nội thành chọn shop" },
          { icon: "🛡️", title: "Bảo hành chính hãng", sub: "Trung tâm ủy quyền" },
          { icon: "💳", title: "Trả góp 0%", sub: "Thẻ tín dụng/qua thẻ" },
          { icon: "↩️", title: "Đổi trả dễ dàng", sub: "Trong 15 ngày" },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-3 md:p-4 flex items-center gap-3">
            <div className="text-2xl">{s.icon}</div>
            <div>
              <div className="font-semibold leading-tight">{s.title}</div>
              <div className="text-xs text-gray-600 leading-tight">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ===== Brands (carousel) ===== */}
      <div className="mt-6">
        <div className="rounded-2xl bg-white ring-1 ring-gray-100 shadow-sm p-3 md:p-4">
          <BrandCarousel title="Thương hiệu nổi bật" limit={18} />
        </div>
      </div>

      {/* ===== Flash Sale ===== */}
      <section className="mt-6">
        <div className="rounded-2xl overflow-hidden ring-1 ring-gray-100 shadow-sm bg-white">
          <FlashSaleSection />
        </div>
      </section>

      {error && (
        <div className="mt-6 rounded-2xl bg-red-50 text-red-700 ring-1 ring-red-200 p-4">
          {error}
        </div>
      )}

      {/* ===== Featured ===== */}
      <SectionCard
        title="🔥 Sản phẩm nổi bật"
        subtitle="Được nhiều người quan tâm nhất tuần qua"
        cta={<Link to="/search?featured=1" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>}
      >
        {loading ? <GridSkeleton /> : <ProductGrid products={featured} />}
      </SectionCard>

      {/* ===== Hot Sale ===== */}
      <SectionCard
        title="⚡ Hot Sale cuối tuần"
        subtitle="Giá tốt, số lượng có hạn"
        cta={<Link to="/search?sort=price_desc" className="text-sm text-blue-600 hover:underline">Xem thêm</Link>}
      >
        {loading ? <GridSkeleton /> : <ProductGrid products={hotSale} />}
      </SectionCard>

      {/* ===== Phones ===== */}
      <SectionCard
        title="📱 Điện thoại nổi bật"
        subtitle="Android, iPhone, giá tốt hôm nay"
        cta={<Link to="/search?category_id=1" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>}
      >
        {loading ? <GridSkeleton /> : <ProductGrid products={phones} />}
      </SectionCard>

      {/* ===== Laptops ===== */}
      <SectionCard
        title="💻 Laptop Gaming"
        subtitle="Hiệu năng cao, tản nhiệt xịn"
        cta={<Link to="/search?category_id=2" className="text-sm text-blue-600 hover:underline">Xem tất cả</Link>}
      >
        {loading ? <GridSkeleton /> : <ProductGrid products={laptops} />}
      </SectionCard>

      {/* ===== SEO footer note (optional) ===== */}
      <div className="mt-10 text-xs text-gray-500 leading-relaxed">
        Giá có thể thay đổi theo khu vực và chương trình khuyến mãi. Vui lòng chọn cửa hàng gần bạn để xem giá chính xác.
      </div>
    </div>
  );
}
