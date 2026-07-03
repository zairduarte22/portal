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
        Schema::create('entregas', function (Blueprint $table) {
            $table->id();
            $table->date('fecha');
            $table->date('rango_desde');
            $table->date('rango_hasta');
            $table->decimal('total_efectivo', 15, 2)->default(0);
            $table->decimal('total_cruces', 15, 2)->default(0);
            $table->decimal('ugavi_base', 15, 2)->default(0);
            $table->decimal('club_base', 15, 2)->default(0);
            $table->decimal('descuento_cruces', 15, 2)->default(0);
            $table->decimal('monto_pagado_ugavi', 15, 2)->default(0);
            $table->string('metodo_pago')->nullable();
            $table->string('referencia')->nullable();
            $table->decimal('tasa_cambio', 15, 2)->default(1);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('entregas');
    }
};
