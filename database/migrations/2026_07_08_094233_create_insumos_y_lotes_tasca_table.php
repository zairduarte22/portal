<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('insumos_tasca', function (Blueprint $table) {
            $table->id();
            $table->string('nombre');
            $table->string('categoria')->nullable();
            $table->string('medida_base')->default('UN');
            $table->decimal('contenido_por_unidad', 10, 2)->default(1);
            $table->timestamps();
        });

        Schema::create('lotes_tasca', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_insumo')->constrained('insumos_tasca')->onDelete('cascade');
            $table->string('codigo_lote')->nullable();
            $table->foreignId('proveedor_id')->nullable()->constrained('proveedor')->onDelete('set null');
            $table->decimal('cantidad_comprada', 10, 2);
            $table->decimal('costo_unitario', 12, 2)->default(0);
            $table->decimal('stock_actual', 10, 2)->default(0);
            $table->date('fecha_compra');
            $table->date('fecha_caducidad')->nullable();
            $table->string('estado')->default('Activo');
            $table->timestamps();
        });

        Schema::table('productos_tasca', function (Blueprint $table) {
            $table->foreignId('id_insumo')->nullable()->constrained('insumos_tasca')->onDelete('set null');
            $table->decimal('medida_descuento', 10, 2)->default(1);
        });

        // Migrate data
        $now = Carbon::now();
        $productos = DB::table('productos_tasca')->get();
        foreach($productos as $p) {
            $insumoId = DB::table('insumos_tasca')->insertGetId([
                'nombre' => $p->nombre,
                'categoria' => $p->categoria,
                'medida_base' => 'UN',
                'contenido_por_unidad' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
            
            DB::table('lotes_tasca')->insert([
                'id_insumo' => $insumoId,
                'codigo_lote' => 'INICIAL',
                'proveedor_id' => null,
                'cantidad_comprada' => $p->stock,
                'costo_unitario' => property_exists($p, 'costo') ? ($p->costo ?? 0) : 0,
                'stock_actual' => $p->stock,
                'fecha_compra' => $now->toDateString(),
                'fecha_caducidad' => null,
                'estado' => $p->stock > 0 ? 'Activo' : 'Agotado',
                'created_at' => $now,
                'updated_at' => $now,
            ]);

            DB::table('productos_tasca')->where('id', $p->id)->update([
                'id_insumo' => $insumoId,
                'medida_descuento' => 1
            ]);
        }

        Schema::table('productos_tasca', function (Blueprint $table) {
            $table->dropColumn(['stock', 'costo', 'proveedor']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('insumos_y_lotes_tasca');
    }
};
