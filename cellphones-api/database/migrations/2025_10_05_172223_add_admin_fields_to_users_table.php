<?php

// database/migrations/xxxx_xx_xx_xxxxxx_add_admin_fields_to_users_table.php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::table('users', function (Blueprint $table) {
      if (!Schema::hasColumn('users','role')) {
        $table->string('role',20)->default('user')->index();
      }
      if (!Schema::hasColumn('users','status')) {
        $table->string('status',20)->default('active')->index(); // active|banned
      }
      if (!Schema::hasColumn('users','banned_at')) {
        $table->timestamp('banned_at')->nullable()->index();
      }
      if (!Schema::hasColumn('users','last_login_at')) {
        $table->timestamp('last_login_at')->nullable()->index();
      }
    });
  }
  public function down(): void {
    Schema::table('users', function (Blueprint $table) {
      if (Schema::hasColumn('users','last_login_at')) $table->dropColumn('last_login_at');
      if (Schema::hasColumn('users','banned_at'))     $table->dropColumn('banned_at');
      if (Schema::hasColumn('users','status'))        $table->dropColumn('status');
      if (Schema::hasColumn('users','role'))          $table->dropColumn('role');
    });
  }
};
