<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Clear existing pagos_tasca to avoid foreign key issues since they are tests
        DB::table('pagos_tasca')->truncate();

        // 2. Drop id_venta from pagos_tasca
        Schema::table('pagos_tasca', function (Blueprint $table) {
            $table->dropForeign(['id_venta']);
            $table->dropColumn('id_venta');
        });

        // 3. Create pivot table
        Schema::create('pago_venta_tasca', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_pago');
            $table->unsignedBigInteger('id_venta');
            $table->decimal('monto_abonado_usd', 10, 2);
            $table->timestamps();

            $table->foreign('id_pago')->references('id')->on('pagos_tasca')->onDelete('cascade');
            $table->foreign('id_venta')->references('id')->on('ventas_tasca')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pago_venta_tasca');
        
        Schema::table('pagos_tasca', function (Blueprint $table) {
            $table->unsignedBigInteger('id_venta')->nullable();
            $table->foreign('id_venta')->references('id')->on('ventas_tasca')->onDelete('cascade');
        });
    }
};
