<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            if (!Schema::hasColumn('products', 'slug')) {
                $table->string('slug')->nullable()->unique()->after('name');
            }
        });

        // Backfill slug cho sản phẩm cũ
        DB::table('products')->select('id', 'name', 'slug')->orderBy('id')
            ->chunkById(200, function ($rows) {
                foreach ($rows as $row) {
                    if ($row->slug) continue;
                    $base = Str::slug($row->name ?? 'product');
                    $slug = $base;

                    // đảm bảo unique
                    $i = 1;
                    while (DB::table('products')->where('slug', $slug)->exists()) {
                        $slug = $base.'-'.$row->id.'-'.$i;
                        $i++;
                    }
                    DB::table('products')->where('id', $row->id)->update(['slug' => $slug]);
                }
            });
    }

    public function down(): void
    {
        if (Schema::hasColumn('products', 'slug')) {
            Schema::table('products', function (Blueprint $table) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            });
        }
    }
};
