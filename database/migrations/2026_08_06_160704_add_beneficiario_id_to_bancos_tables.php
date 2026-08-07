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
            $table->foreignId('beneficiario_id')->nullable()->constrained('beneficiarios_fondo')->onDelete('set null');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->foreignId('beneficiario_id')->nullable()->constrained('beneficiarios_fondo')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('cuenta_banco', function (Blueprint $table) {
            $table->dropForeign(['beneficiario_id']);
            $table->dropColumn('beneficiario_id');
        });

        Schema::table('cuenta_moneda_extranjera', function (Blueprint $table) {
            $table->dropForeign(['beneficiario_id']);
            $table->dropColumn('beneficiario_id');
        });
    }
};
