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
        Schema::table('lotes_tasca', function (Blueprint $table) {
            $table->unsignedBigInteger('compra_id')->nullable()->after('id');
            $table->foreign('compra_id')->references('id')->on('compras_tasca')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('lotes_tasca', function (Blueprint $table) {
            $table->dropForeign(['compra_id']);
            $table->dropColumn('compra_id');
        });
    }
};
