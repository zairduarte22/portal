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
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->unsignedBigInteger('categoria_id')->nullable();
            
            $table->foreign('categoria_id')
                  ->references('id')
                  ->on('categoria_fondos')
                  ->onDelete('set null');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->unsignedBigInteger('categoria_id')->nullable();
            
            $table->foreign('categoria_id')
                  ->references('id')
                  ->on('categoria_fondos')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropColumn('categoria_id');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->dropForeign(['categoria_id']);
            $table->dropColumn('categoria_id');
        });
    }
};
