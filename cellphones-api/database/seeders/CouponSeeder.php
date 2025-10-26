<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Coupon;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            [
                'code'       => 'WELCOME10',
                'discount'   => 10,
                'max_uses'   => 1000,
                'used'       => 0,
                'starts_at'  => now()->subDay(),
                'expires_at' => now()->addYear(),
                'status'     => 'active',
            ],
            [
                'code'       => 'FLASH20',
                'discount'   => 20,
                'max_uses'   => 100,
                'used'       => 0,
                'starts_at'  => now()->subHour(),
                'expires_at' => now()->addWeeks(2),
                'status'     => 'active',
            ],
            [
                'code'       => 'SIEUSALE',
                'discount'   => 10,
                'max_uses'   => null,
                'used'       => 0,
                'starts_at'  => now()->subHours(2),
                'expires_at' => now()->addWeeks(2),
                'status'     => 'active',
            ],
        ];

        foreach ($data as $row) {
            Coupon::updateOrCreate(['code' => $row['code']], $row);
        }
    }
}
