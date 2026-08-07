<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('tiendas', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('slug')->unique();
            $table->enum('tipo_negocio', ['restaurante_bar', 'tienda_general'])->default('restaurante_bar');
            $table->boolean('activa')->default(true);
            $table->timestamps();
        });

        Schema::create('banco_tienda', function (Blueprint $table) {
            $table->id();
            $table->foreignId('banco_id')->constrained('bancos')->onDelete('cascade');
            $table->foreignId('tienda_id')->constrained('tiendas')->onDelete('cascade');
            $table->timestamps();
        });

        // Modificamos la tabla bancos para añadir el campo 'para_membresias' y limpiar 'propietario'
        Schema::table('bancos', function (Blueprint $table) {
            $table->boolean('para_membresias')->default(false);
            // El campo propietario ya no será necesario después de la migración completa, pero lo mantendremos de momento.
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('bancos', function (Blueprint $table) {
            $table->dropColumn('para_membresias');
        });
        
        Schema::dropIfExists('banco_tienda');
        Schema::dropIfExists('tiendas');
    }
};
