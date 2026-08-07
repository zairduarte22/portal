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
        // 1. Reemplazar 'FONDO' por 'MEMBRESIA' en la tabla bancos
        DB::table('bancos')->where('propietario', 'FONDO')->update(['propietario' => 'MEMBRESIA', 'para_membresias' => true]);
        
        // Asignar los bancos de TASCA a banco_tienda para la tienda 1
        $bancosTasca = DB::table('bancos')->where('propietario', 'TASCA')->get();
        foreach ($bancosTasca as $b) {
            DB::table('banco_tienda')->insert([
                'banco_id' => $b->id,
                'tienda_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // Agregar FKs y id_pago_tienda a las tablas de cuentas
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->unsignedBigInteger('id_pago_tienda')->nullable();
            
            // Ya existe id_banco, agregaremos la FK (ignoramos error si ya existe)
            // Dado que PostgreSQL puede quejarse si hay huérfanos, primero limpiamos huérfanos si los hay
        });
        
        // Limpiar registros huérfanos de cuenta_banco (si id_banco no existe en bancos)
        DB::statement('DELETE FROM cuenta_banco WHERE id_banco IS NOT NULL AND id_banco NOT IN (SELECT id FROM bancos)');
        
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->foreign('id_banco')->references('id')->on('bancos')->onDelete('restrict');
            $table->foreign('id_pago_tienda')->references('id')->on('pagos_tienda')->onDelete('cascade');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->unsignedBigInteger('id_pago_tienda')->nullable();
        });
        
        // Limpiar registros huérfanos de cuenta_moneda_extranjera
        DB::statement('DELETE FROM cuenta_moneda_extranjera WHERE id_banco IS NOT NULL AND id_banco NOT IN (SELECT id FROM bancos)');
        
        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->foreign('id_banco')->references('id')->on('bancos')->onDelete('restrict');
            $table->foreign('id_pago_tienda')->references('id')->on('pagos_tienda')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        DB::table('bancos')->where('propietario', 'MEMBRESIA')->update(['propietario' => 'FONDO', 'para_membresias' => false]);
        DB::table('banco_tienda')->where('tienda_id', 1)->delete();

        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->dropForeign(['id_banco']);
            $table->dropForeign(['id_pago_tienda']);
            $table->dropColumn('id_pago_tienda');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->dropForeign(['id_banco']);
            $table->dropForeign(['id_pago_tienda']);
            $table->dropColumn('id_pago_tienda');
        });
    }
};
