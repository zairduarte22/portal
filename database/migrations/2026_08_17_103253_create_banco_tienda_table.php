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
        Schema::create('banco_tienda', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('banco_id');
            $table->unsignedBigInteger('tienda_id');
            $table->timestamps();

            $table->foreign('banco_id')->references('id')->on('bancos')->onDelete('cascade');
            $table->foreign('tienda_id')->references('id')->on('tiendas')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('banco_tienda');
    }
};
