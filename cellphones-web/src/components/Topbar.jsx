// src/components/Topbar.jsx
export default function Topbar() {
  const notices = [
    "Sản phẩm chính hãng · Xuất VAT đầy đủ",
    "Giao nhanh · Miễn phí đơn trên 300k",
    "Đổi trả dễ dàng · Lên đời tiết kiệm",
  ];

  const Icon = ({ name, className = "size-4" }) => {
    switch (name) {
      case "map":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M9 2.25l-4.5 2a.75.75 0 00-.45.69v15.56c0 .56.57.94 1.09.73L9 19.5l6 1.78 4.41-1.96a.75.75 0 00.44-.69V3.06c0-.56-.57-.94-1.09-.73L15 4.5 9 2.25zM15 4.5v16.78M9 2.25v17.25" />
          </svg>
        );
      case "truck":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M3 6.75A.75.75 0 013.75 6h10.5a.75.75 0 01.75.75V15h1.69a2.25 2.25 0 011.72.81l1.49 1.78a.75.75 0 01-.58 1.23H18a2.25 2.25 0 11-4.5 0H9a2.25 2.25 0 11-4.5 0H3.75a.75.75 0 01-.75-.75V6.75zM6.75 19.5a.75.75 0 100-1.5.75.75 0 000 1.5zm9 0a.75.75 0 100-1.5.75.75 0 000 1.5zM18 12h2.25a.75.75 0 00.75-.75V9.6a1.5 1.5 0 00-.3-.9l-1.2-1.6A1.5 1.5 0 0018.75 6H18v6z" />
          </svg>
        );
      case "phone":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M2.25 5.25a2 2 0 012-2h2.1a1 1 0 01.98.78l.8 3.4a1 1 0 01-.3.98l-1.6 1.6a12 12 0 006.96 6.96l1.6-1.6a1 1 0 01.99-.3l3.39.8a1 1 0 01.78.98v2.1a2 2 0 01-2 2H17a16 16 0 01-14.75-14.75v-1.35z" />
          </svg>
        );
      case "search":
        return (
          <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
            <path d="M10.5 3a7.5 7.5 0 015.95 12.1l3.23 3.22a1 1 0 01-1.42 1.42l-3.22-3.23A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 100 11 5.5 5.5 0 000-11z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sticky top-0 z-40 bg-gradient-to-r from-red-700 to-red-600 text-white/95 text-[11px] md:text-xs">
      <div className="border-b border-white/10">
        <div className="mx-auto max-w-[1280px] px-4">
          <div className="flex h-9 items-center justify-between gap-3">
            {/* Left: notices (scrollable on mobile) */}
            <div className="flex min-w-0 items-center gap-3 overflow-x-auto whitespace-nowrap pr-2">
              {notices.map((t, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-2 opacity-95 hover:opacity-100"
                >
                  {i === 0 && <Icon name="truck" />}
                  {i === 1 && <Icon name="search" />}
                  {i === 2 && <Icon name="map" />}
                  <span>{t}</span>
                  {i < notices.length - 1 && (
                    <span className="hidden md:inline text-white/40">•</span>
                  )}
                </span>
              ))}
            </div>

            {/* Right: quick links */}
            <div className="hidden sm:flex items-center gap-3">
              <a href="#" className="inline-flex items-center gap-1 hover:underline decoration-white/60">
                <Icon name="map" /> Cửa hàng gần bạn
              </a>
              <a href="/orders" className="inline-flex items-center gap-1 hover:underline decoration-white/60">
                <Icon name="search" /> Tra cứu đơn hàng
              </a>
              <a
                href="tel:18002097"
                className="ml-2 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 font-semibold ring-1 ring-white/20 hover:bg-white/15"
              >
                <Icon name="phone" className="size-3.5" /> 1800 2097
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
