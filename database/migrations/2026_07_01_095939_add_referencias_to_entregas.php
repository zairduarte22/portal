<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entregas', function (Blueprint $table) {
            $table->string('referencia_ugavi_usd')->nullable();
            $table->string('referencia_ugavi_bs')->nullable();
            $table->string('referencia_club_usd')->nullable();
            $table->string('referencia_club_bs')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entregas', function (Blueprint $table) {
            $table->dropColumn(['referencia_ugavi_usd', 'referencia_ugavi_bs', 'referencia_club_usd', 'referencia_club_bs']);
        });
    }
};
