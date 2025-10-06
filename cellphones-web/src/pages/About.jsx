export default function About() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-red-600 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Giới thiệu về Cellphones
          </h1>
          <p className="text-lg md:text-xl opacity-90">
            Mang công nghệ đến gần hơn với mọi người – Chính hãng, Uy tín, Giá tốt.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div>
          <img
            src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
            alt="Cellphones Store"
            className="rounded-lg shadow-lg"
          />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-4">Chúng tôi là ai?</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cellphones là hệ thống bán lẻ công nghệ hàng đầu Việt Nam, chuyên
            cung cấp điện thoại, laptop, tablet và phụ kiện chính hãng. Với hơn
            10 năm kinh nghiệm, chúng tôi cam kết mang lại những sản phẩm chất
            lượng và dịch vụ tốt nhất cho khách hàng.
          </p>
          <p className="text-gray-700 leading-relaxed">
            Từ những ngày đầu thành lập, sứ mệnh của chúng tôi luôn là:{" "}
            <span className="font-semibold">
              "Đưa công nghệ đến gần hơn với cuộc sống".
            </span>
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-3 text-red-600">🎯 Sứ mệnh</h3>
            <p className="text-gray-600">
              Mang công nghệ đến gần hơn với tất cả mọi người, giúp khách hàng
              tiếp cận sản phẩm chính hãng dễ dàng.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-3 text-green-600">👁️ Tầm nhìn</h3>
            <p className="text-gray-600">
              Trở thành hệ thống bán lẻ công nghệ số 1 Việt Nam và mở rộng ra
              thị trường quốc tế.
            </p>
          </div>
          <div className="p-6 border rounded-lg shadow hover:shadow-md transition">
            <h3 className="text-xl font-bold mb-3 text-blue-600">💎 Giá trị</h3>
            <p className="text-gray-600">
              Chính hãng – Uy tín – Giá tốt – Dịch vụ tận tâm.
            </p>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-red-600">10+</h3>
            <p className="text-gray-600">Năm kinh nghiệm</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-red-600">100+</h3>
            <p className="text-gray-600">Cửa hàng toàn quốc</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-red-600">1 Triệu+</h3>
            <p className="text-gray-600">Khách hàng tin dùng</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-red-600">500+</h3>
            <p className="text-gray-600">Nhân viên tận tâm</p>
          </div>
        </div>
      </section>

      {/* Customer Service */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl font-bold mb-6">🤝 Dịch vụ khách hàng</h2>
        <p className="text-gray-700 max-w-3xl mx-auto mb-8">
          Chúng tôi không chỉ bán sản phẩm mà còn cung cấp giải pháp toàn diện
          cho khách hàng. Đội ngũ nhân viên tận tâm, nhiệt huyết luôn sẵn sàng
          hỗ trợ trước, trong và sau khi mua hàng.
        </p>
        <button className="bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 transition">
          Liên hệ với chúng tôi
        </button>
      </section>
    </div>
  );
}
