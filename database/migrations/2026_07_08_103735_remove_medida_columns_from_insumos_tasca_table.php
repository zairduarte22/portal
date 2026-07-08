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
        Schema::table('insumos_tasca', function (Blueprint $table) {
            $table->dropColumn(['medida_base', 'contenido_por_unidad']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('insumos_tasca', function (Blueprint $table) {
            $table->string('medida_base', 10)->default('ML');
            $table->decimal('contenido_por_unidad', 10, 2)->default(1);
        });
    }
};
