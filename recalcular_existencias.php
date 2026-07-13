<?php
/**
 * SCRIPT PARA RECALCULAR EXISTENCIAS (Lotes Tasca)
 * 
 * Instrucciones de uso para el servidor en producción (cPanel):
 * 1. Sube este archivo a la carpeta principal de tu proyecto (donde está el archivo .env y artisan).
 * 2. Ejecútalo desde la terminal de tu servidor cPanel con el comando:
 *    php recalcular_existencias.php
 * 3. Si no tienes acceso a la terminal, muévelo a la carpeta "public" y edita la ruta del autoload
 *    cambiando __DIR__.'/vendor/autoload.php' por __DIR__.'/../vendor/autoload.php'
 *    y entra desde el navegador a: tusitio.com/recalcular_existencias.php
 */

require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    DB::beginTransaction();

    // 1. Restaurar todos los lotes a su cantidad original
    DB::statement('UPDATE lotes_tasca SET stock_actual = cantidad_comprada');

    // 2. Obtener todo el consumo histórico de ventas_tasca_detalles
    $consumptions = DB::select("
        SELECT p.id_insumo, SUM(d.cantidad * p.medida_descuento) as total_consumed
        FROM ventas_tasca_detalles d
        JOIN productos_tasca p ON d.id_producto = p.id
        JOIN ventas_tasca v ON d.id_venta = v.id
        WHERE v.estado != 'anulada' AND v.estado != 'anulado'
        GROUP BY p.id_insumo
    ");

    foreach ($consumptions as $c) {
        $insumo_id = $c->id_insumo;
        $remaining_to_consume = (float)$c->total_consumed;

        // Obtener los lotes de este insumo (FIFO - Primero en entrar, primero en salir)
        $lotes = DB::table('lotes_tasca')
            ->where('id_insumo', $insumo_id)
            ->orderBy('fecha_compra', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        foreach ($lotes as $lote) {
            if ($remaining_to_consume <= 0) break;

            $stock = (float)$lote->stock_actual;
            if ($stock > 0) {
                if ($stock >= $remaining_to_consume) {
                    // Descontar parcialmente
                    DB::table('lotes_tasca')->where('id', $lote->id)->update([
                        'stock_actual' => $stock - $remaining_to_consume
                    ]);
                    $remaining_to_consume = 0;
                } else {
                    // Agotar el lote completo
                    DB::table('lotes_tasca')->where('id', $lote->id)->update([
                        'stock_actual' => 0
                    ]);
                    $remaining_to_consume -= $stock;
                }
            }
        }
    }

    DB::commit();
    echo "¡Éxito! Todas las existencias han sido recalculadas y sincronizadas con las ventas.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Ocurrió un error: " . $e->getMessage() . "\n";
}
