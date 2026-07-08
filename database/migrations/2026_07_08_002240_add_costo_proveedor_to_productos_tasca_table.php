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
        Schema::table('productos_tasca', function (Blueprint $table) {
            $table->decimal('costo', 10, 2)->nullable()->after('precio');
            $table->string('proveedor')->nullable()->after('categoria');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos_tasca', function (Blueprint $table) {
            $table->dropColumn(['costo', 'proveedor']);
        });
    }
};
