<?php
require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$file = __DIR__ . '/FACT_CUOTAS.sql';
if (!file_exists($file)) {
    die("No se encontro el archivo FACT_CUOTAS.sql\n");
}

$content = file_get_contents($file);
preg_match_all('/INSERT INTO `FACT_CUOTAS` \([^)]+\) VALUES\s*(.+?);/is', $content, $matches);

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
            
            // Extraer strings o numeros. 
            // Manejamos 'texto' o numero o NULL
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

            if (count($fields) >= 11) {
                $id_factura = $fields[0];
                $id_miembro = $fields[1];
                $fecha = $fields[2];
                $monto_bs = $fields[3];
                $monto_divisas = $fields[4];
                $metodo_pago = $fields[5];
                $mensualidades = $fields[8];
                $referencia = $fields[9];
                $estado = $fields[10];
                
                if ($estado !== 'VIGENTE') {
                    continue; // Skip anuladas
                }

                $descripcion = "ID_FACTURA: $id_factura | Miembro: $id_miembro | $mensualidades | $metodo_pago | Ref: $referencia";
                
                DB::table('ingresos_historicos')->insert([
                    'fecha' => $fecha,
                    'monto' => $monto_divisas,
                    'descripcion' => $descripcion,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $count++;
            }
        }
    }
    DB::commit();
    echo "¡Exito! Se han importado $count registros a ingresos_historicos.\n";
} catch (\Exception $e) {
    DB::rollBack();
    echo "Error importando: " . $e->getMessage() . "\n";
}
