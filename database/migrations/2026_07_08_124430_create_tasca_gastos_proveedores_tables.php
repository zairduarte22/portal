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
        Schema::create('proveedores_tasca', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('identificacion')->nullable(); // RIF o Cédula
            $table->string('telefono')->nullable();
            $table->string('direccion')->nullable();
            $table->timestamps();
        });

        Schema::create('gastos_tasca', function (Blueprint $table) {
            $table->id();
            $table->string('categoria'); // e.g. "Compra de Mercancia", "Servicios", etc.
            $table->string('descripcion');
            $table->decimal('monto_usd', 10, 2);
            $table->decimal('monto_bs', 10, 2)->nullable();
            $table->string('metodo_pago');
            $table->date('fecha');
            
            $table->unsignedBigInteger('proveedor_id')->nullable();
            $table->unsignedBigInteger('compra_id')->nullable(); // If it's a payment for a specific purchase
            
            $table->timestamps();

            $table->foreign('proveedor_id')->references('id')->on('proveedores_tasca')->onDelete('set null');
            $table->foreign('compra_id')->references('id')->on('compras_tasca')->onDelete('cascade');
        });

        Schema::table('compras_tasca', function (Blueprint $table) {
            // Delete old proveedor string, add proveedor_id foreign key
            $table->dropColumn('proveedor');
            $table->unsignedBigInteger('proveedor_id')->nullable()->after('referencia_factura');
            $table->foreign('proveedor_id')->references('id')->on('proveedores_tasca')->onDelete('set null');
            
            $table->decimal('abono_usd', 10, 2)->default(0)->after('total_usd');
            // 'estado' column already exists (Procesada, Anulada). We might want to use it for 'Pendiente', 'Parcial', 'Pagada'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('compras_tasca', function (Blueprint $table) {
            $table->dropForeign(['proveedor_id']);
            $table->dropColumn('proveedor_id');
            $table->dropColumn('abono_usd');
            $table->string('proveedor')->nullable();
        });

        Schema::dropIfExists('gastos_tasca');
        Schema::dropIfExists('proveedores_tasca');
    }
};
