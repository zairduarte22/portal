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
        // 1. Clientes Tasca (Terceros)
        Schema::create('clientes_tasca', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('cedula')->nullable();
            $table->string('telefono')->nullable();
            $table->timestamps();
        });

        // 2. Productos Tasca
        Schema::create('productos_tasca', function (Blueprint $table) {
            $table->id();
            $table->string('codigo_barras')->nullable()->unique();
            $table->string('nombre');
            $table->decimal('precio', 10, 2); // USD
            $table->integer('stock')->default(0);
            $table->string('categoria')->nullable();
            $table->timestamps();
        });

        // 3. Ventas Tasca
        Schema::create('ventas_tasca', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_cliente_tasca')->nullable(); // Tercero
            $table->unsignedBigInteger('id_cliente_miembro')->nullable(); // Miembro
            $table->decimal('total', 10, 2)->default(0); // USD
            $table->decimal('descuento', 10, 2)->default(0); // USD
            $table->string('estado')->default('Pendiente'); // Pendiente, Pagada, Anulada, Credito
            $table->date('fecha');
            $table->timestamps();

            $table->foreign('id_cliente_tasca')->references('id')->on('clientes_tasca')->onDelete('set null');
            $table->foreign('id_cliente_miembro')->references('id')->on('miembros')->onDelete('set null');
        });

        // 4. Detalles de Ventas Tasca
        Schema::create('ventas_tasca_detalles', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_venta');
            $table->unsignedBigInteger('id_producto');
            $table->integer('cantidad');
            $table->decimal('precio_unitario', 10, 2); // USD
            $table->decimal('subtotal', 10, 2); // USD
            $table->timestamps();

            $table->foreign('id_venta')->references('id')->on('ventas_tasca')->onDelete('cascade');
            $table->foreign('id_producto')->references('id')->on('productos_tasca')->onDelete('restrict');
        });

        // 5. Pagos Tasca
        Schema::create('pagos_tasca', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_venta');
            $table->decimal('monto_usd', 10, 2);
            $table->decimal('tasa', 10, 2);
            $table->decimal('monto_bs', 10, 2)->nullable();
            $table->string('metodo_pago');
            $table->string('referencia')->nullable();
            $table->date('fecha_pago');
            $table->text('anotacion')->nullable();
            $table->timestamps();

            $table->foreign('id_venta')->references('id')->on('ventas_tasca')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tasca_tables');
    }
};
