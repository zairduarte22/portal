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
        Schema::table('facturas', function (Blueprint $table) {
            $table->decimal('monto', 10, 2)->nullable()->after('mes_cuota');
        });

        // Backfill monto with the correct original amount
        \Illuminate\Support\Facades\DB::statement('
            UPDATE facturas f
            SET monto = f.pendiente + COALESCE((
                SELECT SUM(monto_aplicado + COALESCE(descuento, 0))
                FROM vinculacion_pagos v
                WHERE v.id_factura = f.id
            ), 0)
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('facturas', function (Blueprint $table) {
            $table->dropColumn('monto');
        });
    }
};
