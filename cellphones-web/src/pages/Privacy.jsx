export default function Privacy() {
  return (
    <div className="max-w-5xl mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">🔒 Chính sách bảo mật</h1>
      <p>
        Chúng tôi cam kết bảo vệ thông tin cá nhân của khách hàng. Dữ liệu chỉ
        được sử dụng cho mục đích giao dịch và chăm sóc khách hàng.
      </p>
      <ul className="list-disc pl-6 mt-4 space-y-2">
        <li>Không chia sẻ thông tin cá nhân cho bên thứ ba nếu không có sự đồng ý.</li>
        <li>Mọi giao dịch được mã hóa để đảm bảo an toàn.</li>
        <li>Bạn có quyền yêu cầu chỉnh sửa hoặc xóa dữ liệu của mình.</li>
      </ul>
    </div>
  );
}
