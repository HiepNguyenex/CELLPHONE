<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Faq; // 👈 nhớ import

class FaqSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            ['question' => 'Làm sao để đặt hàng?', 'answer' => 'Chọn sản phẩm → Thêm vào giỏ → Thanh toán (cần đăng nhập).', 'sort_order' => 1],
            ['question' => 'Phí vận chuyển?', 'answer' => 'Tiêu chuẩn 30.000đ, hỏa tốc 50.000đ. Miễn phí đơn từ 2.000.000đ.', 'sort_order' => 2],
            ['question' => 'Thanh toán?', 'answer' => 'Hiện hỗ trợ COD. Online sẽ bổ sung sau.', 'sort_order' => 3],
            ['question' => 'Hủy đơn?', 'answer' => 'Hủy được khi đơn còn pending, tại trang chi tiết đơn.', 'sort_order' => 4],
        ];

        foreach ($rows as $r) {
            Faq::updateOrCreate(
                ['question' => $r['question']],
                ['answer' => $r['answer'], 'is_active' => true, 'sort_order' => $r['sort_order']]
            );
        }
    }
}
