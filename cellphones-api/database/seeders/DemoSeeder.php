<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // ===== BRANDS =====
            $brands = [
                ['name'=>'Apple','slug'=>'apple'],
                ['name'=>'Samsung','slug'=>'samsung'],
                ['name'=>'Asus','slug'=>'asus'],
                ['name'=>'Dell','slug'=>'dell'],
                ['name'=>'HP','slug'=>'hp'],
                ['name'=>'Lenovo','slug'=>'lenovo'],
                ['name'=>'Xiaomi','slug'=>'xiaomi'],
                ['name'=>'OPPO','slug'=>'oppo'],
                ['name'=>'vivo','slug'=>'vivo'],
                ['name'=>'realme','slug'=>'realme'],
                ['name'=>'Sony','slug'=>'sony'],
                ['name'=>'Logitech','slug'=>'logitech'],
                ['name'=>'Anker','slug'=>'anker'],
            ];
            foreach ($brands as &$b) { $b['created_at'] = now(); $b['updated_at'] = now(); }
            DB::table('brands')->upsert($brands, ['slug'], ['name','updated_at']);

            // ===== CATEGORIES =====
            $categories = [
                ['name'=>'Smartphones & Tablets','slug'=>'smartphones'],
                ['name'=>'Laptops','slug'=>'laptops'],
                ['name'=>'Audio & Accessories','slug'=>'accessories'],
            ];
            foreach ($categories as &$c) { $c['created_at'] = now(); $c['updated_at'] = now(); }
            DB::table('categories')->upsert($categories, ['slug'], ['name','updated_at']);

            $now = now();

            // ===== PRODUCTS =====
            $products = [
                [
                    'name'=>'iPhone 17 Pro 256GB',
                    'brand_slug'=>'apple','category_slug'=>'smartphones',
                    'price'=>32990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png',
                    'description'=>'iPhone 17 Pro 256GB sở hữu chip A19 Pro tiến trình 3nm, GPU cực mạnh cho trải nghiệm game console-level. Cụm camera nâng cấp gồm cảm biến chính 48MP, camera tele 6× zoom quang, chụp thiếu sáng xuất sắc. Khung titan siêu bền nhẹ, màn ProMotion 120Hz, Always-On Display, cổng USB-C tốc độ cao. Pin dùng cả ngày, hỗ trợ Wi-Fi 7, Face ID và hệ sinh thái Apple.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Apple','Model'=>'iPhone 17 Pro','Năm ra mắt'=>'2024/2025'],
                        'Màn hình'=>['Công nghệ'=>'Super Retina XDR OLED','Kích thước'=>'~6.1–6.3 inch','Tần số quét'=>'120Hz ProMotion','Độ sáng tối đa'=>'>2000 nits'],
                        'Cấu hình & bộ nhớ'=>['Chip xử lý (CPU)'=>'Apple A19 Pro (3nm)','GPU'=>'Tích hợp Apple GPU','RAM'=>'8GB','Bộ nhớ trong'=>'256GB','Hệ điều hành'=>'iOS'],
                        'Kết nối & cổng'=>['SIM'=>'Nano SIM & eSIM','Wi-Fi'=>'Wi-Fi 7','Bluetooth'=>'5.3','Cổng sạc'=>'USB-C'],
                        'Tiện ích'=>['Chống nước'=>'IP68','Pin & sạc'=>'Sạc nhanh / MagSafe','Bảo mật'=>'Face ID'],
                    ],
                ],
                [
                    'name'=>'iPhone 15 Pro Max 256GB',
                    'brand_slug'=>'apple','category_slug'=>'smartphones',
                    'price'=>29990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs%3Afill%3A0%3A0/q%3A90/plain/https%3A//cellphones.com.vn/media/wysiwyg/Phone/Apple/iphone_15/dien-thoai-iphone-15-pro-max-3.jpg',
                    'description'=>'iPhone 15 Pro Max khung titan siêu nhẹ, chip A17 Pro với GPU chuyên dụng cho gaming. Camera chính 48MP, tele 5×, quay phim ProRes, màn hình 120Hz mượt mà. Tối ưu pin, sạc nhanh USB-C và kết nối 5G tốc độ cao.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Apple','Model'=>'iPhone 15 Pro Max','Năm ra mắt'=>'2023'],
                        'Màn hình'=>['Công nghệ màn hình'=>'Super Retina XDR OLED','Kích thước'=>'6.7 inch','Tần số quét'=>'120Hz','Độ sáng tối đa'=>'2000 nits'],
                        'Cấu hình & bộ nhớ'=>['Chip xử lý (CPU)'=>'Apple A17 Pro (3nm)','GPU'=>'Apple GPU 6 nhân','RAM'=>'8GB','Bộ nhớ trong'=>'256GB','Hệ điều hành'=>'iOS'],
                        'Kết nối & cổng'=>['SIM'=>'Nano SIM & eSIM','Wi-Fi'=>'Wi-Fi 6E','Bluetooth'=>'5.3','Cổng sạc'=>'USB-C'],
                        'Tiện ích'=>['Chống nước'=>'IP68','Âm thanh'=>'Spatial Audio, Dolby Atmos','Bảo mật'=>'Face ID','Pin & sạc'=>'Sạc nhanh / sạc MagSafe'],
                    ],
                ],
                [
                    'name'=>'MacBook Pro 16” M3 Max',
                    'brand_slug'=>'apple','category_slug'=>'laptops',
                    'price'=>74990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/m/a/macbook-pro-16-inch-m3-max-2023_1__1.png',
                    'description'=>'MacBook Pro 16 inch M3 Max với CPU 16 nhân, GPU 40 nhân cực mạnh, lý tưởng cho đồ họa/AI/dựng phim. Liquid Retina XDR 1600 nits, ProMotion 120Hz.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Apple','Model'=>'MacBook Pro 16 (M3 Max)','Năm ra mắt'=>'2023'],
                        'Màn hình'=>['Kích thước'=>'16 inch','Công nghệ'=>'Liquid Retina XDR','Tần số quét'=>'120Hz (ProMotion)','Độ sáng'=>'1600 nits (HDR)'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Apple M3 Max (16 nhân)','GPU'=>'40 nhân GPU','RAM'=>'32GB','SSD'=>'1TB','Hệ điều hành'=>'macOS'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6E','Bluetooth'=>'5.3','Cổng'=>'MagSafe 3, 3× TB4, HDMI, SDXC, Audio'],
                        'Tiện ích'=>['Pin'=>'~22 giờ','Webcam'=>'1080p','Bàn phím'=>'Magic Keyboard + Touch ID','Trọng lượng'=>'~2.14 kg'],
                    ],
                ],
                [
                    'name'=>'Asus ROG Zephyrus G14',
                    'brand_slug'=>'asus','category_slug'=>'laptops',
                    'price'=>39990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/2/_/2_53_1_1.png',
                    'description'=>'Laptop gaming mỏng nhẹ RTX 4070 + Ryzen 9 7940HS, màn 14" QHD+ 165Hz, Dolby Atmos.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'ASUS','Model'=>'ROG Zephyrus G14','Dòng máy'=>'Gaming mỏng nhẹ'],
                        'Màn hình'=>['Kích thước'=>'14 inch','Độ phân giải'=>'QHD+','Tần số quét'=>'165Hz','Tấm nền'=>'IPS, 100% DCI-P3'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Ryzen 9 7940HS','GPU'=>'RTX 4070 8GB','RAM'=>'32GB DDR5','SSD'=>'1TB PCIe 4.0','Hệ điều hành'=>'Windows 11'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6E','Bluetooth'=>'5.3','Cổng'=>'USB-C (PD), USB-A, HDMI, Audio'],
                        'Tiện ích'=>['Tản nhiệt'=>'Vapor Chamber, 2 quạt Arc Flow','Âm thanh'=>'Dolby Atmos','Trọng lượng'=>'~1.65 kg'],
                    ],
                ],
                [
                    'name'=>'AirPods Pro 2 (USB-C)',
                    'brand_slug'=>'apple','category_slug'=>'accessories',
                    'price'=>5990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/a/i/airpods_pro_2_sep24_pdp_image_position_2__vn-vi.jpg',
                    'description'=>'AirPods Pro 2 chip H2, ANC/Transparency, Spatial Audio, USB-C, pin ~6h.',
                    'specs'=>[
                        'Tổng quan'=>['Loại'=>'TWS In-ear','Chip âm thanh'=>'Apple H2','Chống ồn'=>'ANC + Transparency'],
                        'Âm thanh'=>['Spatial Audio'=>'Personalized','Codec'=>'AAC','Mic'=>'Beamforming'],
                        'Kết nối & cổng'=>['Bluetooth'=>'5.3','Sạc'=>'USB-C / MagSafe','Kháng nước'=>'IP54'],
                        'Tiện ích'=>['Pin tai nghe'=>'~6 giờ','Pin kèm hộp'=>'~30 giờ','Find My'=>'Có'],
                    ],
                ],
                [
                    'name'=>'Samsung Galaxy S24+',
                    'brand_slug'=>'samsung','category_slug'=>'smartphones',
                    'price'=>22990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-plus.png',
                    'description'=>'S24+ 6.7” 120Hz, Snapdragon 8 Gen 3, camera AI, pin ~5000mAh sạc 45W.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Samsung','Model'=>'Galaxy S24+','Năm ra mắt'=>'2024'],
                        'Màn hình'=>['Công nghệ'=>'Dynamic AMOLED 2X','Kích thước'=>'6.7 inch','Tần số quét'=>'120Hz','Độ sáng'=>'~2600 nits'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Snapdragon 8 Gen 3','RAM'=>'8–12GB','ROM'=>'256GB','OS'=>'Android / One UI'],
                        'Kết nối & cổng'=>['SIM'=>'2 SIM (tuỳ thị trường)','Wi-Fi'=>'Wi-Fi 7/6E','BT'=>'5.3','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'~4900–5000 mAh','Sạc nhanh'=>'45W','IP'=>'IP68','Bảo mật'=>'Vân tay siêu âm + Face Unlock'],
                    ],
                ],
                [
                    'name'=>'Xiaomi 14 Ultra',
                    'brand_slug'=>'xiaomi','category_slug'=>'smartphones',
                    'price'=>25990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_3.png',
                    'description'=>'14 Ultra hợp tác Leica, cảm biến 1", 8K, Snapdragon 8 Gen 3, LTPO 120Hz, sạc 120W.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Xiaomi','Model'=>'14 Ultra','Leica'=>'Tối ưu quang học'],
                        'Màn hình'=>['Công nghệ'=>'AMOLED LTPO','Kích thước'=>'6.73 inch','Tần số quét'=>'120Hz','Độ sáng'=>'~3000 nits'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Snapdragon 8 Gen 3','RAM'=>'12GB','ROM'=>'256GB','OS'=>'Android / HyperOS'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 7','BT'=>'5.4','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'~5000 mAh','Sạc nhanh'=>'120W/80W','Kháng nước'=>'IP68'],
                    ],
                ],
                [
                    'name'=>'Dell XPS 13',
                    'brand_slug'=>'dell','category_slug'=>'laptops',
                    'price'=>32990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_659_40.png',
                    'description'=>'XPS 13 viền mỏng, Intel Core Gen mới, SSD nhanh, pin bền.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Dell','Model'=>'XPS 13','Dòng máy'=>'Ultrabook'],
                        'Màn hình'=>['Kích thước'=>'13.4 inch','Độ phân giải'=>'FHD+/3.5K/OLED','Tần số quét'=>'60–120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Intel Core Gen mới','GPU'=>'Intel iGPU','RAM'=>'16GB','SSD'=>'512GB','OS'=>'Windows 11'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6E','BT'=>'5.3','Cổng'=>'2× TB4 (USB-C), Audio'],
                        'Tiện ích'=>['Trọng lượng'=>'~1.17 kg','Webcam'=>'1080p','Vật liệu'=>'Nhôm nguyên khối'],
                    ],
                ],
                [
                    'name'=>'Sony WH-1000XM5',
                    'brand_slug'=>'sony','category_slug'=>'accessories',
                    'price'=>7990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-chup-tai-sony-wh-1000xm6-_9_.png',
                    'description'=>'ANC đầu bảng, LDAC, pin 30h, sạc 10’ nghe ~5h.',
                    'specs'=>[
                        'Tổng quan'=>['Loại'=>'Over-ear','Chống ồn'=>'ANC','Codec'=>'LDAC/AAC/SBC'],
                        'Âm thanh'=>['Driver'=>'Dynamic 30–40mm','Tính năng'=>'DSEE Extreme, Adaptive Sound'],
                        'Kết nối & cổng'=>['BT'=>'5.x','USB'=>'USB-C','Audio'=>'3.5mm (tuỳ gói)'],
                        'Tiện ích'=>['Pin'=>'~30 giờ','Sạc nhanh'=>'10 phút ~5 giờ','Đàm thoại'=>'Multi-mic beamforming'],
                    ],
                ],
                [
                    'name'=>'Logitech MX Master 3S',
                    'brand_slug'=>'logitech','category_slug'=>'accessories',
                    'price'=>2390000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-chup-tai-sony-wh-1000xm6-_9_.png',
                    'description'=>'Chuột MX Master 3S: MagSpeed siêu mượt, 8000 DPI, đa thiết bị.',
                    'specs'=>[
                        'Tổng quan'=>['Loại'=>'Chuột không dây','Thiết kế'=>'Ergonomic, 7 nút'],
                        'Cảm biến'=>['Độ phân giải'=>'8000 DPI','Bề mặt hỗ trợ'=>'Kể cả kính'],
                        'Kết nối & cổng'=>['Kết nối'=>'Bluetooth / Logi Bolt','Sạc'=>'USB-C','Đa thiết bị'=>'Easy-Switch (3 thiết bị)'],
                        'Tiện ích'=>['Pin'=>'Nhiều tuần','Cuộn'=>'MagSpeed'],
                    ],
                ],
                [
                    'name'=>'Pin sạc dự phòng Anker 737 Powercore 24000 140W A1289',
                    'brand_slug'=>'anker','category_slug'=>'accessories',
                    'price'=>1290000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/i/pin-sac-du-phong-anker-powercore-a1384-2c1a-30w-20000mah_1_.png',
                    'description'=>'Anker 737: 24000mAh, PD 140W, 2×USB-C + 1×USB-A, MultiProtect.',
                    'specs'=>[
                        'Tổng quan'=>['Dung lượng'=>'24000 mAh','Công suất tối đa'=>'140W PD'],
                        'Cổng sạc'=>['Số cổng'=>'2× USB-C + 1× USB-A','Chuẩn'=>'PD/PPS/Quick Charge'],
                        'Tiện ích'=>['An toàn'=>'MultiProtect','Màn hình'=>'Hiển thị %/công suất (tuỳ bản)'],
                    ],
                ],
                [
                    'name'=>'Samsung Galaxy S24 Ultra 12GB 256GB',
                    'brand_slug'=>'samsung','category_slug'=>'smartphones',
                    'price'=>22290000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png',
                    'description'=>'S24 Ultra titan, Snapdragon 8 Gen 3 for Galaxy, 200MP + tele 5x, S-Pen, LTPO 120Hz.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Samsung','Model'=>'Galaxy S24 Ultra','Bút'=>'S-Pen tích hợp'],
                        'Màn hình'=>['Công nghệ'=>'Dynamic AMOLED 2X','Kích thước'=>'6.8 inch','Tần số quét'=>'1–120Hz','Độ sáng'=>'~2600–3000 nits'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Snapdragon 8 Gen 3 for Galaxy','RAM'=>'12GB','ROM'=>'256GB','OS'=>'Android / One UI'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 7','BT'=>'5.3','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'~5000 mAh','Sạc nhanh'=>'45W','IP'=>'IP68','Camera'=>'200MP + Tele'],
                    ],
                ],
                [
                    'name'=>'Samsung Galaxy A55 5G 8GB 128GB',
                    'brand_slug'=>'samsung','category_slug'=>'smartphones',
                    'price'=>7590000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/sm-a556_galaxy_a55_awesome_lilac_ui_2_1.png',
                    'description'=>'A55 5G: Super AMOLED 6.6" 120Hz, 50MP OIS, 5000mAh, IP67.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Samsung','Model'=>'Galaxy A55 5G'],
                        'Màn hình'=>['Công nghệ'=>'Super AMOLED','Kích thước'=>'6.6 inch','Tần số quét'=>'120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Exynos 1480','RAM'=>'8GB','ROM'=>'128GB','OS'=>'Android / One UI'],
                        'Kết nối & cổng'=>['5G'=>'Hỗ trợ','Wi-Fi'=>'Wi-Fi 6','BT'=>'5.3','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'5000 mAh','Sạc nhanh'=>'25W','IP'=>'IP67','Camera'=>'50MP OIS'],
                    ],
                ],
                [
                    'name'=>'Samsung Galaxy Tab A9+ Wi-Fi 8GB 128GB',
                    'brand_slug'=>'samsung','category_slug'=>'smartphones',
                    'price'=>6490000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-tab-a9-plus_1.png',
                    'description'=>'Tablet 11", 4 loa Dolby Atmos, đa nhiệm mượt.',
                    'specs'=>[
                        'Tổng quan'=>['Thiết bị'=>'Tablet (Wi-Fi)','Model'=>'Galaxy Tab A9+'],
                        'Màn hình'=>['Kích thước'=>'11 inch','Tần số quét'=>'120Hz (tuỳ bản)','Tấm nền'=>'LCD/IPS'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Snapdragon dòng 6/7','RAM'=>'8GB','ROM'=>'128GB','OS'=>'Android / One UI for Tab'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Dual-band','BT'=>'5.x','USB'=>'USB-C'],
                        'Tiện ích'=>['Loa'=>'4 loa Dolby Atmos','Pin'=>'Dung lượng lớn','Samsung Kids'=>'Hỗ trợ'],
                    ],
                ],
                [
                    'name'=>'iPhone 15 128GB | Chính hãng VN/A',
                    'brand_slug'=>'apple','category_slug'=>'smartphones',
                    'price'=>15990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-plus_1__1.png',
                    'description'=>'iPhone 15: Dynamic Island, A16, 48MP, USB-C, OLED 6.1", 5G.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Apple','Model'=>'iPhone 15','Bản VN/A'=>'Chính hãng'],
                        'Màn hình'=>['Công nghệ'=>'Super Retina XDR OLED','Kích thước'=>'6.1 inch','Tần số quét'=>'60Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'A16 Bionic','RAM'=>'6GB','ROM'=>'128GB','OS'=>'iOS'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6','BT'=>'5.3','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin & sạc'=>'Sạc nhanh','Bảo mật'=>'Face ID','Tính năng'=>'Dynamic Island'],
                    ],
                ],
                [
                    'name'=>'MacBook Air 13" M3 256GB',
                    'brand_slug'=>'apple','category_slug'=>'laptops',
                    'price'=>26990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook_11_1.png',
                    'description'=>'MBA M3 mỏng nhẹ, pin bền, Liquid Retina, hiệu năng tốt học tập – văn phòng – code.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Apple','Model'=>'MacBook Air 13 M3'],
                        'Màn hình'=>['Kích thước'=>'13.6 inch','Công nghệ'=>'Liquid Retina','Độ phân giải'=>'2560×1664'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Apple M3','GPU'=>'Tích hợp','RAM'=>'8GB','SSD'=>'256GB','OS'=>'macOS'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6E','BT'=>'5.3','Cổng'=>'MagSafe 3, 2× TB/USB-C'],
                        'Tiện ích'=>['Pin'=>'Cả ngày','Trọng lượng'=>'~1.24 kg','Bảo mật'=>'Touch ID'],
                    ],
                ],
                [
                    'name'=>'ASUS TUF Gaming A15 FA507 (Ryzen 7/RTX 4060)',
                    'brand_slug'=>'asus','category_slug'=>'laptops',
                    'price'=>26990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_d_i_4_4.png',
                    'description'=>'TUF A15: 144Hz, tản nhiệt tốt, độ bền MIL-STD, RTX 4060.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'ASUS','Model'=>'TUF A15 FA507','Độ bền'=>'MIL-STD'],
                        'Màn hình'=>['Kích thước'=>'15.6 inch','Độ phân giải'=>'FHD','Tần số quét'=>'144Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Ryzen 7 (7xxx)','GPU'=>'RTX 4060 8GB','RAM'=>'16/32GB DDR5','SSD'=>'512GB/1TB','OS'=>'Windows 11'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6','BT'=>'5.2/5.3','Cổng'=>'USB-C, USB-A, HDMI, LAN, Audio'],
                        'Tiện ích'=>['Tản nhiệt'=>'Ống đồng + quạt kép','Âm thanh'=>'DTS:X Ultra','Bàn phím'=>'RGB'],
                    ],
                ],
                [
                    'name'=>'Lenovo IdeaPad Slim 5 14AKP10 (Ryzen AI 7/32GB/1TB)',
                    'brand_slug'=>'lenovo','category_slug'=>'laptops',
                    'price'=>19990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_12__8_21.png',
                    'description'=>'Slim 5 mỏng nhẹ, Ryzen AI 7, SSD 1TB, màn 14" WUXGA/OLED.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'Lenovo','Model'=>'IdeaPad Slim 5 14AKP10'],
                        'Màn hình'=>['Kích thước'=>'14 inch','Độ phân giải'=>'WUXGA/OLED','Tần số quét'=>'60–120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Ryzen AI 7 (7xxx)','GPU'=>'iGPU/tuỳ chọn','RAM'=>'32GB','SSD'=>'1TB','OS'=>'Windows 11'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 6/6E','BT'=>'5.x','Cổng'=>'USB-C, USB-A, HDMI, Audio'],
                        'Tiện ích'=>['Trọng lượng'=>'~1.4 kg','Bảo mật'=>'Shutter/vân tay (tuỳ)'],
                    ],
                ],
                [
                    'name'=>'OPPO Reno12 Pro 5G 12GB 512GB',
                    'brand_slug'=>'oppo','category_slug'=>'smartphones',
                    'price'=>14990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_5__7_72_2.png',
                    'description'=>'Chân dung AI tự nhiên, màn cong 120Hz, SUPERVOOC, thiết kế mỏng nhẹ.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'OPPO','Model'=>'Reno12 Pro 5G'],
                        'Màn hình'=>['Kích thước'=>'~6.7 inch cong','Công nghệ'=>'AMOLED','Tần số quét'=>'120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Dimensity 7xxx','RAM'=>'12GB','ROM'=>'512GB','OS'=>'Android / ColorOS'],
                        'Kết nối & cổng'=>['5G'=>'Hỗ trợ','Wi-Fi'=>'Dual-band','BT'=>'5.x','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'~5000 mAh','Sạc nhanh'=>'SUPERVOOC','Chống nước'=>'IP65 (tuỳ)'],
                    ],
                ],
                [
                    'name'=>'vivo X100 Pro 12GB 256GB',
                    'brand_slug'=>'vivo','category_slug'=>'smartphones',
                    'price'=>22990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-vivo-x100-pro_1_.png',
                    'description'=>'Camera ZEISS, chụp đêm xuất sắc, Dimensity 9300, pin lớn sạc nhanh.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'vivo','Model'=>'X100 Pro','Hợp tác'=>'ZEISS'],
                        'Màn hình'=>['Công nghệ'=>'AMOLED LTPO','Kích thước'=>'~6.78 inch','Tần số quét'=>'1–120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Dimensity 9300','RAM'=>'12GB','ROM'=>'256GB','OS'=>'Android / FuntouchOS'],
                        'Kết nối & cổng'=>['Wi-Fi'=>'Wi-Fi 7','BT'=>'5.4','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'~5400 mAh','Sạc nhanh'=>'120W (tuỳ)','IP'=>'IP68'],
                    ],
                ],
                [
                    'name'=>'realme 12 Pro+ 5G 12GB 256GB',
                    'brand_slug'=>'realme','category_slug'=>'smartphones',
                    'price'=>12990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/e/realme-13-plus-5g_6__2.jpg',
                    'description'=>'Mặt lưng da, tele periscope 3x, 120Hz, 5000mAh sạc nhanh.',
                    'specs'=>[
                        'Tổng quan'=>['Thương hiệu'=>'realme','Model'=>'12 Pro+ 5G'],
                        'Màn hình'=>['Kích thước'=>'~6.7 inch','Công nghệ'=>'AMOLED','Tần số quét'=>'120Hz'],
                        'Cấu hình & bộ nhớ'=>['CPU'=>'Snapdragon/Dimensity TMT','RAM'=>'12GB','ROM'=>'256GB','OS'=>'Android / realme UI'],
                        'Kết nối & cổng'=>['5G'=>'Hỗ trợ','Wi-Fi'=>'Dual-band','BT'=>'5.x','USB'=>'USB-C'],
                        'Tiện ích'=>['Pin'=>'5000 mAh','Sạc nhanh'=>'67/80W','Camera'=>'Tele periscope 3x'],
                    ],
                ],
                [
                    'name'=>'Sony WF-1000XM5 True Wireless',
                    'brand_slug'=>'sony','category_slug'=>'accessories',
                    'price'=>5250000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-sony-wf-1000xm5.png',
                    'description'=>'TWS cao cấp, LDAC, pin ~8h + hộp 24h, đeo êm.',
                    'specs'=>[
                        'Tổng quan'=>['Loại'=>'TWS In-ear','Chống ồn'=>'ANC','Codec'=>'LDAC/AAC/SBC'],
                        'Âm thanh'=>['Driver'=>'Dynamic nhỏ gọn','Chế độ'=>'Ambient / Adaptive Sound'],
                        'Kết nối & cổng'=>['BT'=>'5.3','Sạc'=>'USB-C / không dây','Kháng nước'=>'IPX4'],
                        'Tiện ích'=>['Pin tai nghe'=>'~8 giờ','Pin kèm hộp'=>'~24 giờ','Sạc nhanh'=>'3’ ~1 giờ'],
                    ],
                ],
                [
                    'name'=>'Anker 735 Charger GaNPrime 65W (A2667)',
                    'brand_slug'=>'anker','category_slug'=>'accessories',
                    'price'=>1190000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/i/pin-sac-du-phong-anker-733-ganprime-a1651-10000mah-65w-2c1a.png',
                    'description'=>'Sạc GaN 65W (2C+1A), PD/PPS/QC, MultiProtect.',
                    'specs'=>[
                        'Tổng quan'=>['Công nghệ'=>'GaNPrime','Công suất cực đại'=>'65W'],
                        'Cổng sạc'=>['Số cổng'=>'2× USB-C + 1× USB-A','Chuẩn'=>'PD/PPS/QC'],
                        'Tiện ích'=>['Bảo vệ'=>'MultiProtect','Tương thích'=>'Laptop / Phone / Tablet'],
                    ],
                ],
            ];

            // Build + upsert products (không xóa)
            $rows = [];
            foreach ($products as $p) {
                $brand_id    = DB::table('brands')->where('slug', $p['brand_slug'])->value('id');
                $category_id = DB::table('categories')->where('slug', $p['category_slug'])->value('id');
                if (!$brand_id || !$category_id) continue;

                $rows[] = [
                    'name'        => $p['name'],
                    'slug'        => Str::slug($p['name']),
                    'price'       => $p['price'],
                    'description' => $p['description'] ?? null,
                    'specs'       => array_key_exists('specs', $p) ? json_encode($p['specs'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                    'promotions'  => array_key_exists('promotions', $p) ? json_encode($p['promotions'], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) : null,
                    'brand_id'    => $brand_id,
                    'category_id' => $category_id,
                    'image_url'   => $p['image_url'] ?? null,
                    'is_featured' => (bool) ($p['is_featured'] ?? false),
                    'stock'       => 10,
                    'created_at'  => $now,
                    'updated_at'  => $now,
                ];
            }
            DB::table('products')->upsert(
                $rows,
                ['slug'],
                ['price','description','specs','promotions','brand_id','category_id','image_url','is_featured','stock','updated_at']
            );

            // =====================================================================
            // ======================  BỔ SUNG SEED PHẦN MỚI  ======================
            // =====================================================================

            // -------- STORES --------
            if (Schema::hasTable('stores')) {
                $storeActiveCol = Schema::hasColumn('stores', 'is_active')
                    ? 'is_active'
                    : (Schema::hasColumn('stores', 'active') ? 'active' : null);

                $baseStores = [
                    ['name' => 'CPS Nguyễn Trãi, Q.1',    'city' => 'HCM'],
                    ['name' => 'CPS Quang Trung, Gò Vấp', 'city' => 'HCM'],
                    ['name' => 'CPS Cầu Giấy',            'city' => 'HN'],
                    ['name' => 'CPS Đà Nẵng',             'city' => 'DN'],
                    ['name' => 'CPS Nguyễn Huệ, Q.1',     'city' => 'HCM'],
                ];

                $stores = [];
                foreach ($baseStores as $s) {
                    $row = [
                        'name'       => $s['name'],
                        'city'       => $s['city'],
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                    if ($storeActiveCol) $row[$storeActiveCol] = 1;
                    $stores[] = $row;
                }

                DB::table('stores')->upsert(
                    $stores,
                    ['name'],
                    array_values(array_filter(['city',$storeActiveCol,'updated_at']))
                );

                $storeIdsByName = DB::table('stores')->pluck('id','name');

                // -------- INVENTORIES / STORE_INVENTORIES --------
                $invTable = Schema::hasTable('inventories')
                    ? 'inventories'
                    : (Schema::hasTable('store_inventories') ? 'store_inventories' : null);

                if ($invTable) {
                    $fastFlagCol = Schema::hasColumn($invTable, 'fast_2h')
                        ? 'fast_2h'
                        : (Schema::hasColumn($invTable, 'fast_delivery') ? 'fast_delivery' : null);

                    $productIds = DB::table('products')->orderBy('id')->limit(12)->pluck('id')->all();

                    $fast2hStoreIds = collect(['CPS Nguyễn Trãi, Q.1', 'CPS Quang Trung, Gò Vấp', 'CPS Đà Nẵng'])
                        ->map(fn($n) => $storeIdsByName[$n] ?? null)->filter()->values()->all();

                    $invRows = [];
                    foreach ($storeIdsByName as $storeName => $storeId) {
                        foreach ($productIds as $pid) {
                            $row = [
                                'store_id'   => (int)$storeId,
                                'product_id' => (int)$pid,
                                'stock'      => random_int(0, 7),
                                'created_at' => $now,
                                'updated_at' => $now,
                            ];
                            if ($fastFlagCol) {
                                $row[$fastFlagCol] = in_array($storeId, $fast2hStoreIds, true) ? (random_int(0,1) ? 1 : 0) : 0;
                            }
                            $invRows[] = $row;
                        }
                    }

                    DB::table($invTable)->upsert(
                        $invRows,
                        ['store_id','product_id'],
                        array_values(array_filter(['stock',$fastFlagCol,'updated_at']))
                    );
                }
            }

            // -------- WARRANTY PLANS --------
            if (Schema::hasTable('warranty_plans')) {
                $warranties = [
                    ['slug'=>'ex12','name'=>'Bảo hành mở rộng 12 tháng','type'=>'extended','months'=>12,'price'=>399000,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    ['slug'=>'ex24','name'=>'Bảo hành mở rộng 24 tháng','type'=>'extended','months'=>24,'price'=>699000,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    ['slug'=>'break','name'=>'Bảo hiểm rơi vỡ / vào nước 12 tháng','type'=>'accident','months'=>12,'price'=>499000,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                ];
                DB::table('warranty_plans')->upsert(
                    $warranties,
                    ['slug'],
                    ['name','type','months','price','active','updated_at']
                );
            }

            // -------- INSTALLMENT PLANS --------
            if (Schema::hasTable('installment_plans')) {
                $installments = [
                    // credit 0%
                    ['method'=>'credit','months'=>3,'interest_monthly'=>0.00,'min_down_percent'=>0.00,'zero_percent'=>1,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    ['method'=>'credit','months'=>6,'interest_monthly'=>0.00,'min_down_percent'=>0.00,'zero_percent'=>1,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    ['method'=>'credit','months'=>12,'interest_monthly'=>0.00,'min_down_percent'=>0.00,'zero_percent'=>1,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    // finance 1.7%/tháng
                    ['method'=>'finance','months'=>12,'interest_monthly'=>0.017,'min_down_percent'=>30.00,'zero_percent'=>0,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                    ['method'=>'finance','months'=>24,'interest_monthly'=>0.017,'min_down_percent'=>30.00,'zero_percent'=>0,'active'=>1,'created_at'=>$now,'updated_at'=>$now],
                ];
                DB::table('installment_plans')->upsert(
                    $installments,
                    ['method','months','zero_percent'],
                    ['interest_monthly','min_down_percent','active','updated_at']
                );
            }

            // -------- PRODUCT BUNDLES (tùy schema) --------
            $bundleTable = Schema::hasTable('product_bundle')
                ? 'product_bundle'
                : (Schema::hasTable('product_bundles') ? 'product_bundles' : null);

            if ($bundleTable) {
                $bundleActiveCol = Schema::hasColumn($bundleTable, 'active')
                    ? 'active'
                    : (Schema::hasColumn($bundleTable, 'is_active') ? 'is_active' : null);

                $smartphonesCatId = DB::table('categories')->where('slug','smartphones')->value('id');
                $accessoriesCatId = DB::table('categories')->where('slug','accessories')->value('id');

                if ($smartphonesCatId && $accessoriesCatId) {
                    $smartphoneIds = DB::table('products')
                        ->where('category_id', $smartphonesCatId)
                        ->orderBy('id')->limit(5)->pluck('id')->all();

                    $accessoryIds = DB::table('products')
                        ->where('category_id', $accessoriesCatId)
                        ->inRandomOrder()->limit(6)->pluck('id')->all();

                    $bundleRows = [];
                    foreach ($smartphoneIds as $pid) {
                        $picked = array_slice($accessoryIds, 0, 2);
                        shuffle($picked);
                        foreach ($picked as $bp) {
                            $row = [
                                'product_id'        => (int)$pid,
                                'bundle_product_id' => (int)$bp,
                                'discount_percent'  => random_int(5, 12), // 5–12%
                                'created_at'        => $now,
                                'updated_at'        => $now,
                            ];
                            if ($bundleActiveCol) $row[$bundleActiveCol] = 1;
                            $bundleRows[] = $row;
                        }
                        shuffle($accessoryIds);
                    }

                    DB::table($bundleTable)->upsert(
                        $bundleRows,
                        ['product_id','bundle_product_id'],
                        array_values(array_filter(['discount_percent',$bundleActiveCol,'updated_at']))
                    );
                }
            }
        });
    }
}
