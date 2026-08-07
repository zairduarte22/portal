<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        // 1. Crear la tienda por defecto
        DB::table('tiendas')->insert([
            'id' => 1,
            'nombre' => 'La Tasca',
            'slug' => 'la-tasca',
            'tipo_negocio' => 'restaurante_bar',
            'activa' => true,
            'created_at' => now(),
            'updated_at' => now()
        ]);

        $tablesToRename = [
            'clientes_tasca' => 'clientes_tienda',
            'proveedores_tasca' => 'proveedores_tienda',
            'insumos_tasca' => 'insumos_tienda',
            'lotes_tasca' => 'lotes_tienda',
            'productos_tasca' => 'productos_tienda',
            'compras_tasca' => 'compras_tienda',
            'gastos_tasca' => 'gastos_tienda',
            'ventas_tasca' => 'ventas_tienda',
            'ventas_tasca_detalles' => 'ventas_tienda_detalles',
            'pagos_tasca' => 'pagos_tienda',
            'pago_venta_tasca' => 'pago_venta_tienda'
        ];

        // Renombrar tablas
        foreach ($tablesToRename as $old => $new) {
            Schema::rename($old, $new);
        }

        // Añadir tienda_id a las tablas principales
        // (Las tablas pivote o detalles como ventas_tienda_detalles o pago_venta_tienda no necesitan tienda_id
        // porque ya están enlazadas a su tabla padre, pero sí a las tablas maestras)
        $tablesWithTiendaId = [
            'clientes_tienda',
            'proveedores_tienda',
            'insumos_tienda',
            'productos_tienda',
            'compras_tienda',
            'gastos_tienda',
            'ventas_tienda',
            'pagos_tienda'
        ];

        foreach ($tablesWithTiendaId as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->unsignedBigInteger('tienda_id')->default(1);
            });
            
            // Separamos la FK para evitar problemas con default values en sqlite/postgres
            Schema::table($tableName, function (Blueprint $table) {
                $table->foreign('tienda_id')->references('id')->on('tiendas')->onDelete('cascade');
            });
        }
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        $tablesWithTiendaId = [
            'clientes_tienda',
            'proveedores_tienda',
            'insumos_tienda',
            'productos_tienda',
            'compras_tienda',
            'gastos_tienda',
            'ventas_tienda',
            'pagos_tienda'
        ];

        foreach ($tablesWithTiendaId as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropForeign(['tienda_id']);
                $table->dropColumn('tienda_id');
            });
        }

        $tablesToRename = [
            'clientes_tienda' => 'clientes_tasca',
            'proveedores_tienda' => 'proveedores_tasca',
            'insumos_tienda' => 'insumos_tasca',
            'lotes_tienda' => 'lotes_tasca',
            'productos_tienda' => 'productos_tasca',
            'compras_tienda' => 'compras_tasca',
            'gastos_tienda' => 'gastos_tasca',
            'ventas_tienda' => 'ventas_tasca',
            'ventas_tienda_detalles' => 'ventas_tasca_detalles',
            'pagos_tienda' => 'pagos_tasca',
            'pago_venta_tienda' => 'pago_venta_tasca'
        ];

        foreach ($tablesToRename as $new => $old) {
            Schema::rename($new, $old);
        }

        DB::table('tiendas')->where('id', 1)->delete();
    }
};
