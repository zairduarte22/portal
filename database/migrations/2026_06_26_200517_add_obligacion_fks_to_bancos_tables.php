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
            $table->unsignedBigInteger('id_obligacion')->nullable();
            $table->unsignedBigInteger('id_abono_obligacion')->nullable();
            
            $table->foreign('id_obligacion')->references('id')->on('obligaciones')->onDelete('cascade');
            $table->foreign('id_abono_obligacion')->references('id')->on('abonos_obligaciones')->onDelete('cascade');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->unsignedBigInteger('id_obligacion')->nullable();
            $table->unsignedBigInteger('id_abono_obligacion')->nullable();
            
            $table->foreign('id_obligacion')->references('id')->on('obligaciones')->onDelete('cascade');
            $table->foreign('id_abono_obligacion')->references('id')->on('abonos_obligaciones')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->dropForeign(['id_obligacion']);
            $table->dropForeign(['id_abono_obligacion']);
            $table->dropColumn(['id_obligacion', 'id_abono_obligacion']);
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->dropForeign(['id_obligacion']);
            $table->dropForeign(['id_abono_obligacion']);
            $table->dropColumn(['id_obligacion', 'id_abono_obligacion']);
        });
    }
};
