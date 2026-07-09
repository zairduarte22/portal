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
        // 1. Limpiar los datos para evitar problemas de compatibilidad
        \Illuminate\Support\Facades\DB::table('carnets_emitidos')->truncate();

        // 2. Eliminar la columna id actual (UUID)
        Schema::table('carnets_emitidos', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        // 3. Crear la nueva columna id (Serial/Auto-incremental)
        Schema::table('carnets_emitidos', function (Blueprint $table) {
            $table->id();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('carnets_emitidos', function (Blueprint $table) {
            $table->dropColumn('id');
        });

        Schema::table('carnets_emitidos', function (Blueprint $table) {
            $table->uuid('id')->primary();
        });
    }
};
