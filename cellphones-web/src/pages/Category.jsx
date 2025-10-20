// // === src/pages/Category.jsx ===
// import { useParams, Link } from "react-router-dom";
// import { useEffect, useState } from "react";
// import api from "../services/api";
// import ProductGrid from "../components/ProductGrid";
// import { Helmet } from "react-helmet-async";

// export default function Category() {
//   const { slug } = useParams();
//   const [category, setCategory] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     setLoading(true);
//     Promise.all([
//       api.get(`/v1/categories/${slug}`),
//       api.get(`/v1/products?category=${slug}`),
//     ])
//       .then(([c, p]) => {
//         setCategory(c.data || null);
//         setProducts(p.data?.data || []);
//         if (c.data?.name) {
//           document.title = `${c.data.name} | Cellphones Clone`;
//         }
//       })
//       .catch((err) => console.error("Lỗi khi tải danh mục:", err))
//       .finally(() => setLoading(false));
//   }, [slug]);

//   if (loading)
//     return (
//       <div className="max-w-6xl mx-auto p-6 animate-pulse text-gray-400">
//         Đang tải sản phẩm...
//       </div>
//     );

//   if (!category)
//     return <p className="text-center mt-10 text-gray-600">❌ Không tìm thấy danh mục.</p>;

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       {/* ✅ SEO */}
//       <Helmet>
//         <title>{category.name} | Cellphones Clone</title>
//         <meta
//           name="description"
//           content={`Khám phá các sản phẩm trong danh mục ${category.name} trên Cellphones Clone.`}
//         />
//       </Helmet>

//       {/* ✅ Breadcrumb */}
//       <nav className="text-sm text-gray-600 mb-4" aria-label="Breadcrumb">
//         <ol className="flex flex-wrap items-center space-x-1">
//           <li>
//             <Link to="/" className="hover:text-red-600 font-medium">
//               Trang chủ
//             </Link>
//             <span className="mx-1">/</span>
//           </li>
//           <li aria-current="page" className="text-gray-800 font-medium">
//             {category.name}
//           </li>
//         </ol>
//       </nav>

//       {/* ✅ Tiêu đề */}
//       <h1 className="text-2xl font-bold mb-3">{category.name}</h1>
//       {category.description && (
//         <p className="text-gray-700 mb-6">{category.description}</p>
//       )}

//       {/* ✅ Danh sách sản phẩm */}
//       <ProductGrid products={products} title={`Sản phẩm ${category.name}`} />
//     </div>
//   );
// }
