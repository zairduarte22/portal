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
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->unsignedBigInteger('id_persona')->nullable();
            $table->foreign('id_persona')->references('id')->on('personas')->onDelete('set null');
        });

        // Backfill: Asignar a las ventas pasadas la persona representante del miembro asociado
        \DB::statement("
            UPDATE ventas_tasca
            SET id_persona = (
                SELECT id_persona
                FROM vinculacion
                WHERE vinculacion.id_miembro = ventas_tasca.id_cliente_miembro
                  AND vinculacion.representante = true
                LIMIT 1
            )
            WHERE id_cliente_miembro IS NOT NULL AND id_persona IS NULL
        ");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->dropForeign(['id_persona']);
            $table->dropColumn('id_persona');
        });
    }
};
