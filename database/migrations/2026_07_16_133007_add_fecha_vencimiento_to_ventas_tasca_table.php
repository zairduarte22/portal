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
            $table->date('fecha_vencimiento')->nullable()->after('fecha');
        });

        // Backfill: para las ventas de crédito existentes, sumar 10 días a la fecha.
        \DB::statement("UPDATE ventas_tasca SET fecha_vencimiento = fecha + INTERVAL '10 days' WHERE estado = 'Credito'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->dropColumn('fecha_vencimiento');
        });
    }
};
