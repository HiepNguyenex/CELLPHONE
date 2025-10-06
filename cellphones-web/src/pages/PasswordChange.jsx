export default function PasswordChange() {
  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Đổi mật khẩu</h1>
      <form className="flex flex-col gap-4">
        <input type="password" placeholder="Mật khẩu cũ" className="border p-2 rounded" />
        <input type="password" placeholder="Mật khẩu mới" className="border p-2 rounded" />
        <button className="bg-red-600 text-white py-2 rounded hover:bg-red-700">
          Đổi mật khẩu
        </button>
      </form>
    </div>
  );
}
