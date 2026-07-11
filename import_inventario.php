<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\InsumoTasca;
use App\Models\LoteTasca;
use App\Models\ProductoTasca;
use Illuminate\Support\Facades\DB;

$file = fopen('c:/Proyectos/fondo2/inventario.csv', 'r');
if (!$file) {
    die("No se pudo abrir el archivo inventario.csv\n");
}

DB::beginTransaction();
try {
    fgetcsv($file, 1000, ';'); // Saltar cabecera

    $count = 0;
    while (($row = fgetcsv($file, 1000, ';')) !== false) {
        if (empty(trim($row[0]))) continue;
        
        $nombre = trim($row[0]);
        $cantidad = (float) trim($row[1]);
        
        $precioStr = trim($row[2]);
        $precioStr = str_replace(',', '.', $precioStr);
        $precioStr = preg_replace('/[^0-9.]/', '', $precioStr);
        $precio = (float) $precioStr;

        // Crear Insumo
        $insumo = InsumoTasca::firstOrCreate(
            ['nombre' => $nombre],
            ['categoria' => 'Licores'] // Categoria por defecto
        );

        // Crear Lote (Inventario inicial)
        if ($cantidad > 0) {
            LoteTasca::create([
                'id_insumo' => $insumo->id,
                'codigo_lote' => 'LOTE-INICIAL-' . uniqid(),
                'cantidad_comprada' => $cantidad,
                'stock_actual' => $cantidad,
                'costo_unitario' => 0,
                'fecha_compra' => now(),
                'estado' => 'Activo'
            ]);
        }

        // Crear Producto (Para ventas)
        ProductoTasca::updateOrCreate(
            ['id_insumo' => $insumo->id, 'nombre' => 'Unidad'],
            [
                'precio' => $precio,
                'medida_descuento' => 1
            ]
        );
        $count++;
    }
    
    DB::commit();
    echo "¡Importación completada con éxito! Se procesaron $count productos.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error en la importación: " . $e->getMessage() . "\n";
}
fclose($file);
