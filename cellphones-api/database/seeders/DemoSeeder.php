<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            // BRANDS
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
            foreach ($brands as &$b) {
                $b['created_at'] = now();
                $b['updated_at'] = now();
            }
            DB::table('brands')->upsert($brands, ['slug'], ['name','updated_at']);
            $brandIds = DB::table('brands')->pluck('id','slug');

            // CATEGORIES
            $categories = [
                ['name'=>'Smartphones & Tablets','slug'=>'smartphones'],
                ['name'=>'Laptops','slug'=>'laptops'],
                ['name'=>'Audio & Accessories','slug'=>'accessories'],
            ];
            foreach ($categories as &$c) {
                $c['created_at'] = now();
                $c['updated_at'] = now();
            }
            DB::table('categories')->upsert($categories, ['slug'], ['name','updated_at']);
            $catIds = DB::table('categories')->pluck('id','slug');

            // fallback ảnh nếu link chết
            $FALLBACK = 'https://cdn2.cellphones.com.vn/358x/media/wysiwyg/placehoder.png';

            $now = now();

            // PRODUCTS
            $products = [
                [
                    'name'=>'iPhone 17 Pro 256GB',
                    'brand_slug'=>'apple','category_slug'=>'smartphones',
                    'price'=>32990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/358x/media/catalog/product/i/p/iphone-17-pro-256-gb.png',
                    'description'=>'iPhone 17 Pro 256GB sở hữu chip A19 Pro tiến trình 3nm, GPU cực mạnh cho trải nghiệm game console-level. Cụm camera nâng cấp gồm cảm biến chính 48MP, camera tele 6× zoom quang, chụp thiếu sáng xuất sắc. Khung titan siêu bền nhẹ, màn ProMotion 120Hz, Always-On Display, cổng USB-C tốc độ cao. Pin dùng cả ngày, hỗ trợ Wi-Fi 7, Face ID và hệ sinh thái Apple.'
                ],
                [
                    'name'=>'iPhone 15 Pro Max 256GB',
                    'brand_slug'=>'apple','category_slug'=>'smartphones',
                    'price'=>29990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs%3Afill%3A0%3A0/q%3A90/plain/https%3A//cellphones.com.vn/media/wysiwyg/Phone/Apple/iphone_15/dien-thoai-iphone-15-pro-max-3.jpg',
                    'description'=>'iPhone 15 Pro Max khung titan siêu nhẹ, chip A17 Pro với GPU chuyên dụng cho gaming. Camera chính 48MP, tele 5×, quay phim ProRes, màn hình 120Hz mượt mà. Tối ưu pin, sạc nhanh USB-C và kết nối 5G tốc độ cao.'
                ],
                [
                    'name'=>'MacBook Pro 16” M3 Max',
                    'brand_slug'=>'apple','category_slug'=>'laptops',
                    'price'=>74990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/m/a/macbook-pro-16-inch-m3-max-2023_1__1.png',
                    'description'=>'MacBook Pro 16 inch M3 Max với CPU 16 nhân, GPU 40 nhân cực mạnh, lý tưởng cho dân đồ họa, AI, dựng phim. Màn Liquid Retina XDR 16” độ sáng 1600 nits, gam màu P3, ProMotion 120Hz. Pin dài, hệ sinh thái Apple tối ưu.'
                ],
                [
                    'name'=>'Asus ROG Zephyrus G14',
                    'brand_slug'=>'asus','category_slug'=>'laptops',
                    'price'=>39990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/2/_/2_53_1_1.png',
                    'description'=>'Laptop gaming mỏng nhẹ, thiết kế tinh tế. Trang bị RTX 4070, CPU AMD Ryzen mạnh, cân mọi tựa game AAA. Hệ thống tản nhiệt hiệu quả, màn 2K 165Hz sắc nét, loa Dolby Atmos.'
                ],
                [
                    'name'=>'AirPods Pro 2 (USB-C)',
                    'brand_slug'=>'apple','category_slug'=>'accessories',
                    'price'=>5990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/x/media/catalog/product/a/i/airpods_pro_2_sep24_pdp_image_position_2__vn-vi.jpg',
                    'description'=>'Tai nghe AirPods Pro 2 trang bị chip H2, chống ồn ANC thế hệ mới, Adaptive Transparency, Spatial Audio cá nhân hóa. Hỗ trợ sạc USB-C, kết nối liền mạch với hệ sinh thái Apple, pin tới 6h nghe nhạc.'
                ],
                [
                    'name'=>'Samsung Galaxy S24+',
                    'brand_slug'=>'samsung','category_slug'=>'smartphones',
                    'price'=>22990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-s24-plus.png',
                    'description'=>'Galaxy S24+ với màn 6.7” Dynamic AMOLED 2X 120Hz, vi xử lý Snapdragon Gen mới, camera AI tối ưu chụp đêm, quay 8K. Pin 5000mAh, sạc nhanh 45W, hỗ trợ One UI 7 mượt mà.'
                ],
                [
                    'name'=>'Xiaomi 14 Ultra',
                    'brand_slug'=>'xiaomi','category_slug'=>'smartphones',
                    'price'=>25990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/x/i/xiaomi-14-ultra_3.png',
                    'description'=>'Xiaomi 14 Ultra hợp tác Leica, cụm camera 1 inch, hỗ trợ quay 8K. Snapdragon 8 Gen 3 mạnh mẽ, màn AMOLED 120Hz, sạc nhanh 120W. Thiết kế khung hợp kim siêu bền.'
                ],
                [
                    'name'=>'Dell XPS 13',
                    'brand_slug'=>'dell','category_slug'=>'laptops',
                    'price'=>32990000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/g/r/group_659_40.png',
                    'description'=>'Dell XPS 13 ultrabook cao cấp, thiết kế viền màn hình siêu mỏng InfinityEdge, chất liệu nhôm nguyên khối sang trọng. Trang bị CPU Intel Core Gen mới, SSD siêu nhanh, pin bền bỉ cho công việc văn phòng di động.'
                ],
                [
                    'name'=>'Sony WH-1000XM5',
                    'brand_slug'=>'sony','category_slug'=>'accessories',
                    'price'=>7990000,'is_featured'=>true,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-chup-tai-sony-wh-1000xm6-_9_.png',
                    'description'=>'Tai nghe chống ồn WH-1000XM5 với công nghệ ANC hàng đầu, chip xử lý âm thanh QN1, micro beamforming. Chất âm cân bằng, hỗ trợ LDAC, pin 30h, sạc nhanh 10 phút nghe 5h.'
                ],
                [
                    'name'=>'Logitech MX Master 3S',
                    'brand_slug'=>'logitech','category_slug'=>'accessories',
                    'price'=>2390000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-chup-tai-sony-wh-1000xm6-_9_.png',
                    'description'=>'Chuột Logitech MX Master 3S với nút cuộn MagSpeed siêu mượt, độ nhạy 8000 DPI, hỗ trợ kết nối đa thiết bị, lý tưởng cho lập trình viên, designer, dân văn phòng chuyên nghiệp.'
                ],
                [
                    'name'=>'Pin sạc dự phòng Anker 737 Powercore 24000 140W A1289',
                    'brand_slug'=>'anker','category_slug'=>'accessories',
                    'price'=>1290000,'is_featured'=>false,
                    'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/i/pin-sac-du-phong-anker-powercore-a1384-2c1a-30w-20000mah_1_.png',
                    'description'=>'Pin dự phòng Anker 737 dung lượng 24.000mAh, hỗ trợ sạc nhanh PD 140W, sạc cùng lúc laptop, tablet, điện thoại. Thiết kế nhỏ gọn, vỏ chống cháy, bảo vệ đa lớp an toàn.'
                ],
                  [
        'name'=>'Samsung Galaxy S24 Ultra 12GB 256GB',
        'brand_slug'=>'samsung','category_slug'=>'smartphones',
        'price'=>22290000,'is_featured'=>true,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/s/ss-s24-ultra-xam-222.png',
        'description'=>'S24 Ultra khung titan, Snapdragon 8 Gen 3 for Galaxy, camera 200MP + tele 5x, tích hợp S-Pen, màn AMOLED 120Hz.'
    ],
    [
        'name'=>'Samsung Galaxy A55 5G 8GB 128GB',
        'brand_slug'=>'samsung','category_slug'=>'smartphones',
        'price'=>7590000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/m/sm-a556_galaxy_a55_awesome_lilac_ui_2_1.png',
        'description'=>'Galaxy A55 5G màn Super AMOLED 6.6" 120Hz, camera 50MP OIS, pin 5000mAh, IP67, trải nghiệm mượt ổn định.'
    ],
    [
        'name'=>'Samsung Galaxy Tab A9+ Wi-Fi 8GB 128GB',
        'brand_slug'=>'samsung','category_slug'=>'smartphones',
        'price'=>6490000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/s/a/samsung-galaxy-tab-a9-plus_1.png',
        'description'=>'Tablet 11", 4 loa Dolby Atmos, đa nhiệm mượt, phù hợp học tập – giải trí cho gia đình.'
    ],
    [
        'name'=>'iPhone 15 128GB | Chính hãng VN/A',
        'brand_slug'=>'apple','category_slug'=>'smartphones',
        'price'=>15990000,'is_featured'=>true,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/i/p/iphone-15-plus_1__1.png',
        'description'=>'iPhone 15 Dynamic Island, chip A16 Bionic, camera 48MP, USB-C, màn OLED 6.1" sắc nét, 5G.'
    ],
    [
        'name'=>'MacBook Air 13" M3 256GB',
        'brand_slug'=>'apple','category_slug'=>'laptops',
        'price'=>26990000,'is_featured'=>true,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/m/a/macbook_11_1.png',
        'description'=>'MacBook Air M3 mỏng nhẹ, pin bền, màn Retina, hiệu năng tốt cho học tập – văn phòng – code.'
    ],
    [
        'name'=>'ASUS TUF Gaming A15 FA507 (Ryzen 7/RTX 4060)',
        'brand_slug'=>'asus','category_slug'=>'laptops',
        'price'=>26990000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_d_i_4_4.png',
        'description'=>'Laptop gaming hiệu năng cao, màn 144Hz, tản nhiệt tối ưu, độ bền chuẩn quân đội.'
    ],
    [
        'name'=>'Lenovo IdeaPad Slim 5 14AKP10 (Ryzen AI 7/32GB/1TB)',
        'brand_slug'=>'lenovo','category_slug'=>'laptops',
        'price'=>19990000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_12__8_21.png',
        'description'=>'IdeaPad Slim 5 mỏng nhẹ, Ryzen AI 7 đa nhiệm mạnh, SSD 1TB, màn 14" WUXGA/OLED sắc nét.'
    ],
    [
        'name'=>'OPPO Reno12 Pro 5G 12GB 512GB',
        'brand_slug'=>'oppo','category_slug'=>'smartphones',
        'price'=>14990000,'is_featured'=>true,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/e/text_ng_n_5__7_72_2.png',
        'description'=>'Chân dung AI đẹp tự nhiên, màn cong 120Hz, sạc nhanh, thiết kế mỏng nhẹ thời trang.'
    ],
    [
        'name'=>'vivo X100 Pro 12GB 256GB',
        'brand_slug'=>'vivo','category_slug'=>'smartphones',
        'price'=>22990000,'is_featured'=>true,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/d/i/dien-thoai-vivo-x100-pro_1_.png',
        'description'=>'Camera ZEISS mạnh mẽ, chụp đêm xuất sắc, hiệu năng flagship, pin lớn sạc nhanh.'
    ],
    [
        'name'=>'realme 12 Pro+ 5G 12GB 256GB',
        'brand_slug'=>'realme','category_slug'=>'smartphones',
        'price'=>12990000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/r/e/realme-13-plus-5g_6__2.jpg',
        'description'=>'Thiết kế mặt lưng da sang, camera periscope 3x, màn 120Hz, pin 5000mAh sạc nhanh.'
    ],
    [
        'name'=>'Sony WF-1000XM5 True Wireless',
        'brand_slug'=>'sony','category_slug'=>'accessories',
        'price'=>5250000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/t/a/tai-nghe-khong-day-sony-wf-1000xm5.png',
        'description'=>'Tai nghe chống ồn TWS cao cấp, LDAC, đàm thoại rõ, pin ~8h + hộp 24h, đeo êm.'
    ],
    [
        'name'=>'Anker 735 Charger GaNPrime 65W (A2667)',
        'brand_slug'=>'anker','category_slug'=>'accessories',
        'price'=>1190000,'is_featured'=>false,
        'image_url'=>'https://cdn2.cellphones.com.vn/insecure/rs:fill:358:358/q:90/plain/https://cellphones.com.vn/media/catalog/product/p/i/pin-sac-du-phong-anker-733-ganprime-a1651-10000mah-65w-2c1a.png',
        'description'=>'Sạc GaN 3 cổng (2 USB-C + 1 USB-A) 65W, sạc nhanh laptop/điện thoại, an toàn MultiProtect.'
    ],
            ];

            $rows = [];
            foreach ($products as $p) {
                $brand_id = $brandIds[$p['brand_slug']] ?? null;
                $category_id = $catIds[$p['category_slug']] ?? null;
                if (!$brand_id || !$category_id) {
                    continue;
                }
                $rows[] = [
                    'name' => $p['name'],
                    'slug' => Str::slug($p['name']),
                    'price' => $p['price'],
                    'description' => $p['description'],
                    'brand_id' => $brand_id,
                    'category_id' => $category_id,
                    'image_url' => $p['image_url'],
                    'is_featured' => (bool) ($p['is_featured'] ?? false),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            DB::table('products')->insert($rows);
        });
    }
}
