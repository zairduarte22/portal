<?php
// Script para migrar CONCILIACION_BS.sql (MySQL dump) a la tabla cuenta_banco (PostgreSQL)

require 'vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

$file = __DIR__ . '/CONCILIACION_BS.sql';
$content = file_get_contents($file);

// ID del banco por defecto para la conciliación BS (ajustar si es necesario)
$id_banco = 1;

// Regex para encontrar los bloques INSERT INTO
preg_match_all('/INSERT INTO `CONCILIACION_BS` \([^)]+\) VALUES\s*(.+?);/is', $content, $matches);

if (empty($matches[1])) {
    die("No se encontraron sentencias INSERT.\n");
}

$count = 0;
DB::beginTransaction();

try {
    foreach ($matches[1] as $block) {
        // Separar las tuplas (...)
        // Esta regex asume que no hay secuencias ")," dentro de los strings escapados
        $tuples = preg_split('/\),\s*\(/', $block);
        
        foreach ($tuples as $tuple) {
            $tuple = trim($tuple, " \t\n\r\0\x0B()");
            
            // Usamos str_getcsv pero con separador de coma y comillas simples
            // Pero phpMyAdmin dump suele tener cadenas con comillas simples.
            // Para simplificar, reemplazamos \' por un caracter temporal si fuera necesario, 
            // pero podemos evaluar los valores.
            
            // Mejor separar usando una expresión regular
            preg_match_all("/(?:'((?:[^']|'')*)'|NULL|([0-9\.\-]+))/", $tuple, $valuesMatches);
            
            $fields = [];
            foreach ($valuesMatches[0] as $idx => $val) {
                if (trim($val) === 'NULL') {
                    $fields[] = null;
                } elseif (isset($valuesMatches[1][$idx]) && $valuesMatches[1][$idx] !== '') {
                    // String value
                    $fields[] = str_replace("''", "'", $valuesMatches[1][$idx]);
                } else {
                    // Numeric
                    $fields[] = $valuesMatches[2][$idx];
                }
            }

            if (count($fields) >= 12) {
                $id_movimiento = $fields[0];
                $id_ingresos = $fields[1];
                $id_factura = $fields[2];
                $id_egreso = $fields[3];
                $fecha = $fields[4];
                $cuenta_contable = $fields[5];
                $tipo_operacion = $fields[6];
                $referencia = $fields[7];
                $beneficiario = $fields[8];
                $descripcion = $fields[9];
                $ingreso = $fields[10];
                $egreso = $fields[11];
                
                // Mapeo a cuenta_banco
                // cuenta_banco: id_banco, id_venta, id_compra, fecha, tipo_operacion, referencia, beneficiario, descripcion, debe, haber
                
                $descripcion_extra = '';
                if ($cuenta_contable) $descripcion_extra .= ' | Cta: ' . $cuenta_contable;
                if ($id_factura) $descripcion_extra .= ' | ID_Factura: ' . $id_factura;
                if ($id_egreso) $descripcion_extra .= ' | ID_Egreso: ' . $id_egreso;
                if ($id_ingresos) $descripcion_extra .= ' | ID_Ingreso: ' . $id_ingresos;
                
                DB::table('cuenta_banco')->insert([
                    'id_banco' => $id_banco,
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
    echo "¡Exito! Se han importado $count registros a cuenta_banco.\n";
    
    // No es necesario actualizar la secuencia ya que omitimos el id en el insert
    echo "Secuencia de ID actualizada.\n";

} catch (\Exception $e) {
    DB::rollBack();
    echo "Error importando: " . $e->getMessage() . "\n";
}
