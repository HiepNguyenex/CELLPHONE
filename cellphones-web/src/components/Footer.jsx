import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t bg-gray-50 text-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        
        {/* Logo / Thương hiệu */}
        <div>
          <h2 className="text-xl font-bold text-blue-600 mb-4">Cellphones</h2>
          <p>
            Mang công nghệ đến gần hơn với bạn.<br />
            Cam kết chính hãng & giá tốt nhất.
          </p>
        </div>

        {/* Liên kết nhanh */}
        <div>
          <h3 className="font-semibold mb-3">Liên kết nhanh</h3>
          <ul className="space-y-2">
            <li><Link to="/about" className="hover:text-blue-600">Giới thiệu</Link></li>
            <li><Link to="/contact" className="hover:text-blue-600">Liên hệ</Link></li>
            <li><Link to="/blog" className="hover:text-blue-600">Blog</Link></li>
            <li><Link to="/faq" className="hover:text-blue-600">FAQ</Link></li>
            <li><Link to="/wishlist" className="hover:text-blue-600">Yêu thích</Link></li>
          </ul>
        </div>

        {/* Chính sách */}
        <div>
          <h3 className="font-semibold mb-3">Chính sách</h3>
          <ul className="space-y-2">
            <li><Link to="/terms" className="hover:text-blue-600">Điều khoản dịch vụ</Link></li>
            <li><Link to="/privacy" className="hover:text-blue-600">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        {/* Kết nối */}
        <div>
          <h3 className="font-semibold mb-3">Kết nối với chúng tôi</h3>
          <div className="flex space-x-4">
            {/* Facebook */}
            <a
              href="https://www.facebook.com/wu.hipe"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M22.675 0h-21.35C.597 0 0 .597 0 1.333v21.334C0 23.403.597 24 1.325 24H12.82v-9.294H9.692V11.41h3.128V8.797c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.505 0-1.797.716-1.797 1.764v2.312h3.59l-.467 3.296h-3.123V24h6.116C23.403 24 24 23.403 24 22.667V1.333C24 .597 23.403 0 22.675 0z" />
              </svg>
            </a>

            {/* Zalo */}
            <a
              href="https://zalo.me/yourzaloid"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 flex items-center justify-center rounded-full bg-green-500 text-white hover:bg-green-600 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M2 3c-1.1 0-2 .9-2 2v11c0 1.1.9 2 2 2h4v4l5.33-4H22c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2H2z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t py-4 text-center text-xs text-gray-500">
        © 2025 Cellphones. All rights reserved.
      </div>
    </footer>
  );
}
