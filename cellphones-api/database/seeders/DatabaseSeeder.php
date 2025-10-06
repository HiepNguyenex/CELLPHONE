<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            DemoSeeder::class,
            UserSeeder::class,
            FaqSeeder::class,
            CategorySeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
