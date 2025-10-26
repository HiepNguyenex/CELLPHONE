import { useEffect, useState } from "react";
import { getFlashSales } from "../services/api";
import { Link } from "react-router-dom";

export default function FlashSaleSection() {
  const [sales, setSales] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    getFlashSales()
      .then((res) => {
        const data = res.data || [];
        setSales(data);
        if (data[0]?.end_time) {
          const end = new Date(data[0].end_time).getTime();
          const interval = setInterval(() => {
            const diff = end - Date.now();
            if (diff <= 0) {
              clearInterval(interval);
              setTimeLeft("Hết giờ");
            } else {
              const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
              const m = Math.floor((diff / (1000 * 60)) % 60);
              const s = Math.floor((diff / 1000) % 60);
              setTimeLeft(`${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}:${s.toString().padStart(2,"0")}`);
            }
          }, 1000);
          return () => clearInterval(interval);
        }
      })
      .catch(() => setSales([]));
  }, []);

  if (sales.length === 0) return null;

  return (
    <div className="mt-10 bg-red-50 p-5 rounded-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-red-600">🔥 Flash Sale</h2>
        <div className="text-lg font-semibold text-gray-700">
          {timeLeft && timeLeft !== "Hết giờ" ? (
            <>⏰ Kết thúc sau: <span className="text-red-600">{timeLeft}</span></>
          ) : (
            <span>Hết giờ</span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {sales.map((s) => (
          <Link
            to={`/product/${s.product.id}`}
            key={s.id}
            className="bg-white rounded-lg shadow hover:shadow-md p-3 transition"
          >
            <img
              src={s.product.image_url}
              alt={s.product.name}
              className="h-40 w-full object-cover rounded"
            />
            <div className="mt-2 text-sm line-clamp-2">{s.product.name}</div>
            <div className="text-red-600 font-semibold">
              {Math.round(s.product.price * (1 - s.discount_percent / 100)).toLocaleString("vi-VN")} ₫
            </div>
            <div className="text-gray-400 text-xs line-through">
              {s.product.price.toLocaleString("vi-VN")} ₫
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
