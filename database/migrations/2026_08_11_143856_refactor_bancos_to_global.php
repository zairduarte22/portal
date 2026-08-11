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
        // Drop banco_tienda
        Schema::dropIfExists('banco_tienda');

        // Modificar bancos (eliminar propietario y para_membresias)
        Schema::table('bancos', function (Blueprint $table) {
            $table->dropColumn(['propietario', 'para_membresias']);
        });

        // Agregar tienda_id a cuenta_banco y cuenta_moneda_extranjera
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->unsignedBigInteger('tienda_id')->default(0)->nullable()->after('id_banco');
            $table->index('tienda_id');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->unsignedBigInteger('tienda_id')->default(0)->nullable()->after('id_banco');
            $table->index('tienda_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->dropIndex(['tienda_id']);
            $table->dropColumn('tienda_id');
        });

        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->dropIndex(['tienda_id']);
            $table->dropColumn('tienda_id');
        });

        Schema::table('bancos', function (Blueprint $table) {
            $table->string('propietario')->default('FONDO');
            $table->boolean('para_membresias')->default(false);
        });

        Schema::create('banco_tienda', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('banco_id');
            $table->unsignedBigInteger('tienda_id');
            $table->timestamps();

            $table->foreign('banco_id')->references('id')->on('bancos')->onDelete('cascade');
            $table->foreign('tienda_id')->references('id')->on('tiendas')->onDelete('cascade');
        });
    }
};
