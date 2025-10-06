import ProductCard from "./ProductCard";

export default function ProductGrid({ title, products = [] }) {
  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map(p => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
