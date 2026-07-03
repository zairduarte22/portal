<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$csvPath = 'c:\proyectos\fondo2\importaciones\INGRESOS.csv';
$csv = array_map(function($line) {
    return str_getcsv($line, ',', '"', '');
}, file($csvPath));

$header = array_shift($csv);
$titularIndex = array_search('TITULAR', $header);

$miembros = \Illuminate\Support\Facades\DB::table('miembros')->pluck('id')->toArray();

$missing = [];
foreach ($csv as $row) {
    if (count($row) == count($header)) {
        $t = $row[$titularIndex];
        if (is_numeric($t) && !in_array($t, $miembros)) {
            $missing[] = $t;
        }
    }
}
echo json_encode(array_values(array_unique($missing)));
