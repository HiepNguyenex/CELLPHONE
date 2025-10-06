import { useEffect, useMemo, useState } from "react";
import { getFaqs } from "../services/api";
import EmptyState from "../components/EmptyState";

const DEFAULT_FAQS = [
  {
    q: "Làm sao để đặt hàng?",
    a: "Chọn sản phẩm → Thêm vào giỏ → Thanh toán. Bạn cần đăng nhập trước khi đặt hàng.",
  },
  {
    q: "Phí vận chuyển tính thế nào?",
    a: "Tiêu chuẩn 30.000đ, hỏa tốc 50.000đ. Miễn phí cho đơn từ 2.000.000đ.",
  },
  {
    q: "Có hình thức thanh toán nào?",
    a: "Hiện hỗ trợ COD. Thanh toán online sẽ được bổ sung sau.",
  },
  {
    q: "Đổi/trả thế nào?",
    a: "Liên hệ hỗ trợ trong 7 ngày, giữ nguyên hộp và phụ kiện. Xem trang Điều khoản để biết chi tiết.",
  },
  {
    q: "Tôi có thể hủy đơn?",
    a: "Nếu đơn ở trạng thái pending, bạn có thể hủy trong trang chi tiết đơn hàng.",
  },
];

export default function FAQ() {
  const [query, setQuery] = useState("");
  const [faqs, setFaqs] = useState(DEFAULT_FAQS);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await getFaqs(); // ✅ đúng endpoint /v1/faqs
        const list = Array.isArray(data?.data) ? data.data : [];
        if (list.length && mounted) {
          const mapped = list.map((x) => ({
            q: x.question ?? "",
            a: x.answer ?? "",
          }));
          setFaqs(mapped);
        }
      } catch (e) {
        // fallback mặc định nếu BE lỗi/không có dữ liệu
        setErr("");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return faqs;
    return faqs.filter(
      (x) =>
        (x.q || "").toLowerCase().includes(q) ||
        (x.a || "").toLowerCase().includes(q)
    );
  }, [faqs, query]);

  // JSON-LD FAQPage (SEO)
  useEffect(() => {
    const top = (filtered.length ? filtered : faqs).slice(0, 8);
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: top.map((x) => ({
        "@type": "Question",
        name: x.q,
        acceptedAnswer: { "@type": "Answer", text: x.a },
      })),
    };
    const s = document.createElement("script");
    s.type = "application/ld+json";
    s.text = JSON.stringify(jsonLd);
    document.head.appendChild(s);
    return () => document.head.removeChild(s);
  }, [filtered, faqs]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="text-center py-16 bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl">
          Đang tải FAQ…
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Câu hỏi thường gặp</h1>

      <div className="bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-4 mb-4">
        <input
          className="w-full border rounded-lg p-2"
          placeholder="Tìm câu hỏi (ví dụ: hủy đơn, phí ship, COD...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {!!err && (
        <div className="mb-3 text-sm text-orange-700 bg-orange-50 rounded-lg p-3">
          {err}
        </div>
      )}

      {!filtered.length ? (
        <EmptyState
          title="Không tìm thấy câu trả lời"
          desc="Hãy thử từ khóa khác hoặc liên hệ hỗ trợ."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((item, idx) => (
            <details
              key={idx}
              className="bg-white shadow-sm ring-1 ring-gray-100 rounded-2xl p-4 group"
            >
              <summary className="cursor-pointer font-semibold list-none flex items-center justify-between">
                <span>{item.q}</span>
                <span className="text-gray-400 group-open:rotate-180 transition">
                  ⌄
                </span>
              </summary>
              <div className="mt-2 text-gray-700 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
