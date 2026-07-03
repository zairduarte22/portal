<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carnets_emitidos', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->unsignedBigInteger('id_persona');
            $table->unsignedBigInteger('id_miembro');
            $table->date('fecha_emision');
            $table->date('fecha_vencimiento')->nullable();
            $table->string('estado')->default('Activo');
            $table->timestamps();

            $table->foreign('id_persona')->references('id')->on('personas')->onDelete('cascade');
            $table->foreign('id_miembro')->references('id')->on('miembros')->onDelete('cascade');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carnets_emitidos');
    }
};
