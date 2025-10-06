export default function Contact() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="bg-red-600 text-white py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-3">Liên hệ với chúng tôi</h1>
        <p className="text-lg opacity-90">
          Đội ngũ Cellphones luôn sẵn sàng hỗ trợ bạn 24/7
        </p>
      </section>

      {/* Contact Info */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-xl font-bold mb-2">📞 Hotline</h3>
          <p className="text-gray-600">Mua hàng: 1800.xxx</p>
          <p className="text-gray-600">Bảo hành: 1800.yyy</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-xl font-bold mb-2">📧 Email</h3>
          <p className="text-gray-600">support@cellphones.vn</p>
          <p className="text-gray-600">contact@cellphones.vn</p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow hover:shadow-md transition">
          <h3 className="text-xl font-bold mb-2">📍 Địa chỉ</h3>
          <p className="text-gray-600">123 Nguyễn Trãi, Quận 1, TP.HCM</p>
          <p className="text-gray-600">Giờ làm việc: 8h00 - 21h00</p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Gửi tin nhắn cho chúng tôi</h2>
        <form className="grid grid-cols-1 gap-6 bg-white p-8 rounded-lg shadow">
          <input
            type="text"
            placeholder="Họ và tên"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <input
            type="email"
            placeholder="Email"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <textarea
            rows="5"
            placeholder="Nội dung tin nhắn"
            className="border p-3 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          ></textarea>
          <button className="bg-red-600 text-white py-3 rounded hover:bg-red-700 transition">
            Gửi ngay
          </button>
        </form>
      </section>

      {/* Google Map */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <h2 className="text-2xl font-bold mb-4 text-center">📍 Vị trí cửa hàng</h2>
        <div className="rounded-lg overflow-hidden shadow-lg">
          <iframe
            title="Cellphones Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.509343955769!2d106.67998327477223!3d10.772215589380768!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f409e7be8a9%3A0xadc177a64e1242d!2zQ2VsbHBob25lUw!5e0!3m2!1svi!2s!4v1700000000000"
            width="100%"
            height="400"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  );
}
