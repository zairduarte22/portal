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
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->decimal('tasa_bcv', 10, 2)->nullable()->after('fecha');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->dropColumn('tasa_bcv');
        });
    }
};
