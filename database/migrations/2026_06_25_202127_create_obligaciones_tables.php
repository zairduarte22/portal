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
        Schema::create('obligaciones', function (Blueprint $table) {
            $table->id();
            $table->enum('tipo_obligacion', ['COBRAR', 'PAGAR']);
            $table->string('categoria');
            $table->string('tercero');
            $table->text('descripcion')->nullable();
            $table->decimal('monto_original', 12, 2);
            $table->decimal('monto_abonado', 12, 2)->default(0);
            $table->enum('moneda', ['VES', 'USD']);
            $table->date('fecha_emision');
            $table->date('fecha_limite')->nullable();
            $table->unsignedBigInteger('banco_origen_id')->nullable();
            $table->enum('estado', ['PENDIENTE', 'PARCIAL', 'PAGADA', 'ANULADA'])->default('PENDIENTE');
            $table->timestamps();

            $table->foreign('banco_origen_id')->references('id')->on('bancos')->onDelete('set null');
        });

        Schema::create('abonos_obligaciones', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('obligacion_id');
            $table->date('fecha');
            $table->decimal('monto_abonado', 12, 2);
            $table->decimal('monto_banco', 12, 2);
            $table->enum('moneda_pago', ['VES', 'USD']);
            $table->decimal('tasa_cambio', 12, 2)->nullable();
            $table->unsignedBigInteger('banco_id');
            $table->string('referencia');
            $table->timestamps();

            $table->foreign('obligacion_id')->references('id')->on('obligaciones')->onDelete('cascade');
            $table->foreign('banco_id')->references('id')->on('bancos')->onDelete('restrict');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('abonos_obligaciones');
        Schema::dropIfExists('obligaciones');
    }
};
