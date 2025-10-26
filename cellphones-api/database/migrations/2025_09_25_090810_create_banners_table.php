<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
public function up(): void
{
Schema::create('banners', function (Blueprint $table) {
$table->id();
$table->string('title')->nullable();
$table->string('image_url');
$table->string('link_url')->nullable();
$table->enum('position', ['home_hero','home_deal','sidebar'])->default('home_hero');
$table->boolean('is_active')->default(true);
$table->timestamps();
});
}

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banners');
    }
};
