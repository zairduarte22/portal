<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

$path = __DIR__.'/LIBRO_VENTAS_ABRIL_JUNIO2026.csv';

echo "Importando $path...\n";
if (!file_exists($path)) {
    echo "El archivo $path no existe.\n";
    exit(1);
}

$file = fopen($path, 'r');
$header = fgetcsv($file);

$count = 0;
$miembrosValidos = DB::table('miembros')->pluck('id')->toArray();
DB::beginTransaction();
try {
    while (($row = fgetcsv($file)) !== false) {
        if (count($header) !== count($row)) {
            continue;
        }
        $data = array_combine($header, $row);

        // Normalizar método de pago
        $metodo = 'Pago Movil/Transferencia';
        $mp_raw = strtolower($data['METODO_PAGO']);
        if (str_contains($mp_raw, 'zelle')) $metodo = 'Zelle';
        elseif (str_contains($mp_raw, 'efectivo')) $metodo = 'Efectivo Divisas';
        elseif (str_contains($mp_raw, 'cruces')) $metodo = 'Cruces';
        
        // Normalizar montos
        $monto_bs = floatval(str_replace(',', '', $data['MONTO'] ?? '0'));
        $monto_divisas = floatval(str_replace(',', '', $data['MONTO_DIVISAS'] ?? '0'));
        
        $id_miembro = is_numeric($data['TITULAR']) ? intval($data['TITULAR']) : null;
        if ($id_miembro && !in_array($id_miembro, $miembrosValidos)) {
            $id_miembro = null; 
        }

        // Avoid duplicate insertion if we are rerunning
        $exists = DB::table('libro_ventas')->where('id', $data['ID_INGRESO'])->exists();
        if ($exists) {
            continue; // Skip if already exists to make it idempotent
        }

        DB::table('libro_ventas')->insert([
            'id' => $data['ID_INGRESO'],
            'fecha' => $data['FECHA'] ? Carbon::parse($data['FECHA'])->format('Y-m-d') : null,
            'id_miembro' => $id_miembro,
            'monto' => $monto_divisas,
            'monto_bs' => $monto_bs,
            'tipo' => $data['TIPO_INGRESO'] === 'NULL' ? null : $data['TIPO_INGRESO'],
            'metodo_pago' => $metodo,
            'referencia' => $data['REFERENCIA'] === 'NULL' ? null : $data['REFERENCIA'],
            'numero_factura' => $data['NUMERO_FACTURA'] === 'NULL' ? null : $data['NUMERO_FACTURA'],
            'numero_control' => $data['NUMERO_CONTROL'] === 'NULL' ? null : ('00-0' . $data['NUMERO_CONTROL']),
        ]);
        $count++;
    }
    DB::commit();
    echo "-> $count registros insertados en libro_ventas.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error importando Libro de Ventas: " . $e->getMessage() . "\n";
}
fclose($file);
