// src/components/ProductGrid.jsx
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white p-3 ring-1 ring-gray-100 shadow-sm">
      <div className="aspect-square w-full rounded-xl bg-gray-100 animate-pulse" />
      <div className="mt-3 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
      <div className="mt-2 h-4 w-1/3 rounded bg-gray-100 animate-pulse" />
    </div>
  );
}

export default function ProductGrid({
  title,
  subtitle,
  products = [],
  to, // link "Xem tất cả"
  loading = false,
  skeletonCount = 8,
  className = "",
}) {
  const hasItems = Array.isArray(products) && products.length > 0;

  return (
    <section className={`mt-8 ${className}`}>
      {/* Header */}
      {(title || subtitle || to) && (
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            {title && (
              <h2 className="text-xl md:text-2xl font-bold tracking-tight">{title}</h2>
            )}
            {subtitle && (
              <p className="text-sm text-gray-600 mt-0.5">{subtitle}</p>
            )}
          </div>
          {to && (
            <Link to={to} className="text-sm text-blue-600 hover:underline">
              Xem tất cả
            </Link>
          )}
        </div>
      )}

      {/* Grid with mobile horizontal-scroll */}
      <div
        className={
          "grid gap-4 md:grid-cols-4 sm:grid-cols-3 " +
          "grid-flow-col auto-cols-[minmax(180px,1fr)] overflow-x-auto md:overflow-visible md:grid-flow-row"
        }
      >
        {loading
          ? Array.from({ length: skeletonCount }).map((_, i) => (
              <div key={i} className="snap-start">
                <CardSkeleton />
              </div>
            ))
          : hasItems
          ? products.map((p) => (
              <div key={p.id} className="snap-start">
                <ProductCard product={p} />
              </div>
            ))
          : (
              <div className="col-span-full">
                <div className="rounded-2xl bg-white p-8 text-center text-gray-600 ring-1 ring-gray-100 shadow-sm">
                  Chưa có sản phẩm phù hợp.
                </div>
              </div>
            )}
      </div>
    </section>
  );
}
