<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$file = __DIR__ . '/CONCILIACION_DIVISAS.sql';
if (!file_exists($file)) {
    die("No se encontro el archivo CONCILIACION_DIVISAS.sql\n");
}

$content = file_get_contents($file);
preg_match_all('/INSERT INTO `CONCILIACION_DIVISAS` \([^)]+\) VALUES\s*(.+?);/is', $content, $matches);

if (empty($matches[1])) {
    die("No se encontraron sentencias INSERT.\n");
}

$count = 0;
DB::beginTransaction();

try {
    foreach ($matches[1] as $block) {
        $tuples = preg_split('/\),\s*\(/', $block);
        
        foreach ($tuples as $tuple) {
            $tuple = trim($tuple, " \t\n\r\0\x0B()");
            
            preg_match_all("/(?:'((?:[^']|'')*)'|NULL|([a-zA-Z0-9\.\-\/]+))/", $tuple, $valuesMatches);
            
            $fields = [];
            foreach ($valuesMatches[0] as $idx => $val) {
                if (trim($val) === 'NULL') {
                    $fields[] = null;
                } elseif (isset($valuesMatches[1][$idx]) && $valuesMatches[1][$idx] !== '') {
                    $fields[] = str_replace("''", "'", $valuesMatches[1][$idx]);
                } else {
                    $fields[] = $valuesMatches[2][$idx];
                }
            }

            if (count($fields) >= 12) {
                $id_mov_divisas = $fields[0] ?? null;
                $id_ingresos = $fields[1] ?? null;
                $id_factura = $fields[2] ?? null;
                $id_egreso = $fields[3] ?? null;
                $fecha = $fields[4] ?? null;
                $cuenta_contable = $fields[5] ?? null;
                $tipo_operacion = $fields[6] ?? null;
                $referencia = $fields[7] ?? null;
                $beneficiario = $fields[8] ?? null;
                $descripcion = $fields[9] ?? null;
                $ingreso = $fields[10] ?? null;
                $egreso = $fields[11] ?? null;
                $metodo_pago = $fields[12] ?? null;
                $titular = $fields[13] ?? null;
                
                $descripcion_extra = '';
                if ($cuenta_contable) $descripcion_extra .= ' | Cta: ' . $cuenta_contable;
                if ($id_factura) $descripcion_extra .= ' | ID_Factura: ' . $id_factura;
                if ($id_egreso) $descripcion_extra .= ' | ID_Egreso: ' . $id_egreso;
                if ($metodo_pago) $descripcion_extra .= ' | Método: ' . $metodo_pago;
                if ($titular) $descripcion_extra .= ' | Titular: ' . $titular;
                
                DB::table('cuenta_moneda_extranjera')->insert([
                    'id_banco' => null, // No asignamos banco específico, es cuenta general divisas
                    'fecha' => $fecha,
                    'tipo_operacion' => $tipo_operacion,
                    'referencia' => $referencia,
                    'beneficiario' => $beneficiario,
                    'descripcion' => $descripcion . $descripcion_extra,
                    'debe' => $ingreso, // Lo que entra
                    'haber' => $egreso, // Lo que sale
                ]);
                $count++;
            }
        }
    }
    DB::commit();
    echo "¡Exito! Se han importado $count registros a cuenta_moneda_extranjera.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error importando: " . $e->getMessage() . "\n";
}
