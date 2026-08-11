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
        Schema::table('ventas_tienda', function (Blueprint $table) {
            if (Schema::hasColumn('ventas_tienda', 'id_cliente_tasca')) {
                $table->renameColumn('id_cliente_tasca', 'id_cliente_tienda');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ventas_tienda', function (Blueprint $table) {
            if (Schema::hasColumn('ventas_tienda', 'id_cliente_tienda')) {
                $table->renameColumn('id_cliente_tienda', 'id_cliente_tasca');
            }
        });
    }
};
