import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useViewed } from "../context/ViewedContext";

import {
  getProduct as getProductDetail,
  getRelatedProducts,
  getReviews,
  addReview,
} from "../services/api";

import WishlistButton from "../components/WishlistButton";
import ProductGrid from "../components/ProductGrid";
import RatingStars from "../components/RatingStars";
import RecentlyViewed from "../components/RecentlyViewed";
import RecommendationSection from "../components/RecommendationSection";
import ProductGallery from "../components/ProductGallery";
import VariantsPicker from "../components/VariantsPicker";
import ProductSpecs from "../components/product/ProductSpecs";
import SkeletonProductDetail from "../components/SkeletonProductDetail";
import ReviewStats from "../components/product/ReviewStats";
import ReviewList from "../components/product/ReviewList";
import ReviewForm from "../components/product/ReviewForm";
import ProductBundles from "../components/product/ProductBundles";
import ShopPolicies from "../components/ShopPolicies";

import InstallmentBox from "../components/product/InstallmentBox";
import WarrantyUpsell from "../components/product/WarrantyUpsell";
import StoreAvailability from "../components/product/StoreAvailability";

const resolveImg = (u) => {
  if (!u) return "";
  if (/^https?:\/\//i.test(u)) return u;
  const base = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api")
    .replace(/\/api$/, "")
    .replace(/\/+$/, "");
  return `${base}/${String(u).replace(/^\/+/, "")}`;
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const { addViewed } = useViewed();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(0);
  const [count, setCount] = useState(0);
  const [breakdown, setBreakdown] = useState({});
  const [reviewFilter, setReviewFilter] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [selectedAttrs, setSelectedAttrs] = useState({});
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [warrantyPicked, setWarrantyPicked] = useState([]);
  const [warrantyTotal, setWarrantyTotal] = useState(0);

  const [showStickyBar, setShowStickyBar] = useState(false);
  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // =============== LOAD DATA ===============
  useEffect(() => {
    const ac = new AbortController();
    setLoading(true);

    Promise.all([
      getProductDetail(id, ac.signal),
      getRelatedProducts(id, ac.signal),
      getReviews(id, {}, ac.signal),
    ])
      .then(([p, rel, r]) => {
        const data = p?.data || null;

        setProduct(data);
        setRelated(Array.isArray(rel?.data) ? rel.data : []);

        const d = r?.data;
        setReviews(d?.data || []);
        setAvg(d?.stats?.avg_rating || 0);
        setCount(d?.stats?.count || 0);
        setBreakdown(d?.stats?.breakdown || {});
        setHasMore(d?.meta?.has_more || false);

        if (data) addViewed(data);

        if (data?.selected_variant?.attrs) {
          setSelectedAttrs(data.selected_variant.attrs);
          setSelectedVariant(data.selected_variant);
        } else {
          setSelectedAttrs({});
          setSelectedVariant(null);
        }

        if (data?.name) document.title = `${data.name} | Cellphones Clone`;
      })
      .catch((err) => {
        if (err?.name !== "CanceledError") console.error("Lỗi khi tải sản phẩm:", err);
      })
      .finally(() => !ac.signal.aborted && setLoading(false));

    return () => ac.abort();
  }, [id, addViewed]);

  // =============== REVIEWS ===============
  const fetchReviews = (pageNum = 1, ratingFilter = null) => {
    const ac = new AbortController();
    getReviews(id, { page: pageNum, rating: ratingFilter }, ac.signal)
      .then((r) => {
        const d = r.data;
        if (pageNum === 1) setReviews(d?.data || []);
        else setReviews((prev) => [...prev, ...(d?.data || [])]);
        setAvg(d?.stats?.avg_rating || 0);
        setCount(d?.stats?.count || 0);
        setBreakdown(d?.stats?.breakdown || {});
        setHasMore(d?.meta?.has_more || false);
      })
      .catch((e) => {
        if (e?.name !== "CanceledError") console.error(e);
      });
    return () => ac.abort();
  };

  useEffect(() => {
    fetchReviews(1, reviewFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, reviewFilter]);

  const handleSubmitReview = (payload) => {
    if (!user) return alert("Bạn cần đăng nhập để đánh giá.");
    setSubmitting(true);
    addReview(id, payload)
      .then(() => {
        setSubmitting(false);
        fetchReviews(1, reviewFilter);
      })
      .catch((err) => {
        setSubmitting(false);
        const msg =
          err?.response?.data?.message ||
          (err?.response?.status === 422
            ? "Bạn đã đánh giá sản phẩm này rồi."
            : "Không thể gửi đánh giá");
        alert(msg);
      });
  };

  // =============== VARIANTS ===============
  const matchedVariant = useMemo(() => {
    if (!product?.variants?.length) return null;
    const keys = Object.keys(selectedAttrs || {});
    if (!keys.length) return selectedVariant || null;
    const found = product.variants.find((v) => {
      const a = v.attrs || {};
      return keys.every((k) => a[k] === selectedAttrs[k]);
    });
    return found || selectedVariant || null;
  }, [product, selectedAttrs, selectedVariant]);

  // =============== PRICES ===============
  const basePrice = useMemo(() => {
    if (!product) return 0;
    if (matchedVariant)
      return Number(matchedVariant.price_override ?? product.price ?? 0);
    return Number(product.price ?? 0);
  }, [product, matchedVariant]);

  const salePrice = useMemo(() => {
    if (!product) return null;
    if (matchedVariant) {
      const p = matchedVariant.sale_price_override ?? product.sale_price ?? null;
      return p !== null ? Number(p) : null;
    }
    return product.sale_price !== null ? Number(product.sale_price) : null;
  }, [product, matchedVariant]);

  const displayPrice = useMemo(() => {
    if (!product) return 0;
    if (matchedVariant) {
      const p =
        matchedVariant.sale_price_override ??
        matchedVariant.price_override ??
        product.final_price ??
        0;
      return Number(p || 0);
    }
    return Number(product.final_price || 0);
  }, [product, matchedVariant]);

  const discountPercent = useMemo(() => {
    if (salePrice === null) return null;
    if (!basePrice || basePrice <= salePrice) return null;
    return Math.round(((basePrice - salePrice) / basePrice) * 100);
  }, [basePrice, salePrice]);

  // =============== CTA state ===============
  const stock = (matchedVariant?.stock ?? product?.stock ?? 0) || 0;
  const requireVariant = Array.isArray(product?.variants) && product.variants.length > 0;
  const canAddToCart = (!requireVariant || !!matchedVariant) && stock > 0;

  // =============== CART ===============
  const handleAddToCart = () => {
    if (!product) return;
    if (requireVariant && !matchedVariant) {
      alert("Vui lòng chọn biến thể trước khi thêm vào giỏ.");
      return;
    }
    const payload = {
      ...product,
      image_url: resolveImg(product.image_url),
      price: basePrice,
      sale_price: salePrice,
      final_price: displayPrice,
      variant_id: matchedVariant?.id || null,
      variant_sku: matchedVariant?.sku || null,
      variant_name: matchedVariant?.name || null,
      variant_attrs: matchedVariant?.attrs || null,
      services: {
        warranty_options: warrantyPicked,
        warranty_amount: warrantyTotal,
      },
    };
    addToCart(payload);
    navigate("/cart");
  };

  if (loading) return <SkeletonProductDetail />;

  if (!product) {
    return <p className="text-center mt-10 text-gray-600">❌ Không tìm thấy sản phẩm.</p>;
  }

  const gallery = product?.images?.length
    ? product.images
    : product.image_url
    ? [{ url: resolveImg(product.image_url), is_primary: true, position: 0 }]
    : [];

  const StockBadge = () => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1 ring-1 ${
        stock > 0
          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
          : "bg-gray-50 text-gray-600 ring-gray-200"
      }`}
    >
      <span className={`inline-block size-1.5 rounded-full ${stock > 0 ? "bg-emerald-500" : "bg-gray-400"}`} />
      {stock > 0 ? `Còn hàng (${stock})` : "Tạm hết hàng"}
    </span>
  );

  return (
    <div className="w-full max-w-[1280px] mx-auto px-4 md:px-6 py-6">
      {/* BREADCRUMB */}
      <nav aria-label="Breadcrumb" className="text-sm text-gray-500 mb-4">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link to="/" className="hover:text-red-600">Trang chủ</Link>
          </li>
          {product.category && (
            <li className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <Link to={`/search?category_id=${product.category.id}`} className="hover:text-red-600">
                {product.category.name}
              </Link>
            </li>
          )}
          {product.brand && (
            <li className="flex items-center gap-1">
              <span className="text-gray-400">/</span>
              <Link to={`/search?brand_id=${product.brand.id}`} className="hover:text-red-600">
                {product.brand.name}
              </Link>
            </li>
          )}
          <li className="flex items-center gap-1 text-gray-700">
            <span className="text-gray-400">/</span> {product.name}
          </li>
        </ol>
      </nav>

      {/* MAIN */}
      <div className="grid grid-cols-1 lg:grid-cols-[560px_minmax(0,1fr)] gap-8 lg:gap-10 items-start">
        {/* LEFT */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100">
            <div className="lg:sticky top-24 p-3 md:p-4">
              <ProductGallery images={gallery} alt={product.name} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 md:p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-500">#{product?.sku || product?.id}</span>
            </div>
            <ProductSpecs product={product} matchedVariant={matchedVariant} />
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-4 md:p-6">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
              <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
                {product.name}
              </span>
            </h1>

            <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-3">
              <div className="flex items-center gap-2">
                <RatingStars value={Math.round(avg)} readOnly />
                <span className="text-sm text-gray-600">
                  {avg ? `${avg}/5` : "Chưa có đánh giá"} · {count} đánh giá
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("reviews");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Xem đánh giá
                </button>
              </div>
              <StockBadge />
            </div>

            <div className="text-sm text-gray-600 mb-4 flex flex-wrap gap-3">
              {product.brand && (
                <span>
                  Thương hiệu:{" "}
                  <Link to={`/search?brand_id=${product.brand.id}`} className="font-medium text-blue-600 hover:underline">
                    {product.brand.name}
                  </Link>
                </span>
              )}
              {product.category && (
                <span>
                  Danh mục:{" "}
                  <Link to={`/search?category_id=${product.category.id}`} className="font-medium text-blue-600 hover:underline">
                    {product.category.name}
                  </Link>
                </span>
              )}
            </div>

            {Array.isArray(product.variants) && product.variants.length > 0 && (
              <div className="mt-2 mb-4">
                <VariantsPicker
                  variants={product.variants}
                  selected={selectedAttrs}
                  onChange={setSelectedAttrs}
                />
                <div className="mt-3 text-sm text-gray-600 rounded-lg bg-gray-50 p-3 flex flex-wrap gap-4">
                  {matchedVariant ? (
                    <>
                      <div>SKU: <span className="font-medium">{matchedVariant.sku || "—"}</span></div>
                      <div>Biến thể: <span className="font-medium">{matchedVariant.name || "—"}</span></div>
                      <div>Tồn kho: <span className="font-medium">{matchedVariant.stock}</span></div>
                    </>
                  ) : (
                    <div>Hãy chọn đủ các tuỳ chọn bên trên.</div>
                  )}
                </div>
              </div>
            )}

            {/* PRICE + CTA */}
            <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-3">
                {salePrice !== null ? (
                  <>
                    <p className="text-red-600 text-3xl font-semibold leading-none">
                      {Number(salePrice).toLocaleString("vi-VN")} ₫
                    </p>
                    <div className="flex flex-col">
                      <p className="text-gray-500 line-through leading-none">
                        {Number(basePrice).toLocaleString("vi-VN")} ₫
                      </p>
                      {discountPercent !== null && (
                        <span className="mt-1 inline-flex w-fit items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600 ring-1 ring-red-200">
                          -{discountPercent}%
                        </span>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-red-600 text-3xl font-semibold">
                    {Number(basePrice).toLocaleString("vi-VN")} ₫
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3 self-stretch sm:self-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`inline-flex items-center justify-center px-6 py-3 rounded-xl text-white shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 ${
                    canAddToCart ? "bg-red-600 hover:bg-red-700 active:scale-[0.99]" : "bg-red-300 cursor-not-allowed"
                  }`}
                  title={
                    !canAddToCart
                      ? requireVariant && !matchedVariant
                        ? "Vui lòng chọn biến thể"
                        : "Tạm hết hàng"
                      : "Thêm vào giỏ hàng"
                  }
                >
                  Thêm vào giỏ hàng
                </button>
                <WishlistButton productId={product.id} />
              </div>
            </div>

            {product.description && (
              <p className="mt-4 text-gray-700 leading-relaxed">{product.description}</p>
            )}
          </div>

          <InstallmentBox price={displayPrice} productId={product.id} />

          <WarrantyUpsell
            productId={product.id}
            onChange={(ids, total) => {
              setWarrantyPicked(ids);
              setWarrantyTotal(total);
            }}
          />

          <StoreAvailability productId={product.id} />
        </div>
      </div>

      {/* Bundles */}
      <section className="mt-10">
        <ProductBundles productId={product.id} />
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <ProductGrid title="Sản phẩm tương tự" products={related} />
        </section>
      )}

      {/* Recently viewed & Reco */}
      <section className="mt-10">
        <RecentlyViewed />
      </section>
      <section className="mt-6">
        <RecommendationSection brandId={product.brand_id} categoryId={product.category_id} />
      </section>

      {/* Reviews */}
      <section id="reviews" className="mt-12">
        <ReviewStats
          avg={avg}
          count={count}
          breakdown={breakdown}
          onFilter={(r) => {
            setReviewFilter(r);
            setPage(1);
            fetchReviews(1, r);
          }}
        />
        <ReviewList
          reviews={reviews}
          hasMore={hasMore}
          onLoadMore={() => {
            const next = page + 1;
            setPage(next);
            fetchReviews(next, reviewFilter);
          }}
          onRefresh={() => fetchReviews(1, reviewFilter)}
        />
        <ReviewForm onSubmit={handleSubmitReview} submitting={submitting} />
      </section>

      {/* Policies */}
      <section className="mt-10">
        <ShopPolicies />
      </section>

      {/* Sticky mobile bar */}
      <div
        className={`lg:hidden fixed bottom-0 inset-x-0 z-40 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-lg transition-transform ${
          showStickyBar ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="mx-auto max-w-[1280px] px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-red-600">
              {Number((salePrice ?? basePrice) || 0).toLocaleString("vi-VN")} ₫
            </span>
            {salePrice !== null && (
              <span className="text-sm text-gray-500 line-through">
                {Number(basePrice).toLocaleString("vi-VN")} ₫
              </span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={!canAddToCart}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-medium shadow-sm ${
              canAddToCart ? "bg-red-600" : "bg-red-300 cursor-not-allowed"
            }`}
          >
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
}
