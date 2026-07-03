<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pagos_carnets', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('id_miembro');
            $table->date('fecha');
            $table->decimal('monto', 10, 2);
            $table->decimal('monto_bs', 10, 2);
            $table->decimal('tasa_cambio', 10, 4);
            $table->decimal('precio_unitario', 10, 2);
            $table->string('metodo_pago');
            $table->string('referencia')->nullable();
            $table->integer('cantidad_carnets');
            $table->string('estado')->default('Pendiente');
            $table->timestamps();

            $table->foreign('id_miembro')->references('id')->on('miembros')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pagos_carnets');
    }
};
