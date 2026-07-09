<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->unsignedBigInteger('id_autorizador')->nullable()->after('estado');
            $table->foreign('id_autorizador')->references('id')->on('personas')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::table('ventas_tasca', function (Blueprint $table) {
            $table->dropForeign(['id_autorizador']);
            $table->dropColumn('id_autorizador');
        });
    }
};
