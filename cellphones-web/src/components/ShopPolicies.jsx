// src/components/ShopPolicies.jsx
import React from "react";
import { ShieldCheck, Truck, RefreshCcw, CreditCard, Headphones } from "lucide-react";

const policies = [
  {
    icon: <ShieldCheck className="w-6 h-6 text-red-600" />,
    title: "Hàng chính hãng 100%",
    desc: "Cam kết sản phẩm chính hãng từ nhà sản xuất",
  },
  {
    icon: <RefreshCcw className="w-6 h-6 text-red-600" />,
    title: "Đổi trả trong 7 ngày",
    desc: "Nếu sản phẩm lỗi do nhà sản xuất",
  },
  {
    icon: <Truck className="w-6 h-6 text-red-600" />,
    title: "Giao hàng toàn quốc",
    desc: "Miễn phí nội thành với đơn hàng trên 1 triệu",
  },
  {
    icon: <CreditCard className="w-6 h-6 text-red-600" />,
    title: "Thanh toán linh hoạt",
    desc: "Chuyển khoản, COD, trả góp 0%",
  },
  {
    icon: <Headphones className="w-6 h-6 text-red-600" />,
    title: "Hỗ trợ 24/7",
    desc: "Liên hệ hotline hoặc chat trực tuyến",
  },
];

export default function ShopPolicies() {
  return (
    <div className="mt-14 bg-gray-50 border-t border-gray-200 py-8 rounded-lg">
      <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
        🏷️ Cam kết & Chính sách của Cellphones
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 px-6">
        {policies.map((p, i) => (
          <div key={i} className="flex flex-col items-center text-center">
            <div className="p-3 bg-white rounded-full shadow">{p.icon}</div>
            <h3 className="font-medium mt-3">{p.title}</h3>
            <p className="text-sm text-gray-500">{p.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
