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
        Schema::create('compras_tasca', function (Blueprint $table) {
            $table->id();
            $table->date('fecha_compra');
            $table->string('referencia_factura')->nullable();
            $table->string('proveedor')->nullable();
            $table->decimal('total_usd', 10, 2)->default(0);
            $table->string('estado')->default('Procesada'); // Procesada, Anulada
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('compras_tasca');
    }
};
