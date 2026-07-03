<?php

$csvPath = 'c:\proyectos\fondo2\importaciones\INGRESOS.csv';
$csv = array_map('str_getcsv', file($csvPath));
$header = array_shift($csv);
$titularIndex = array_search('TITULAR', $header);

// Load all member IDs
$pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=fondo2', 'postgres', 'postgres');
$stmt = $pdo->query('SELECT id FROM miembros');
$miembros = $stmt->fetchAll(PDO::FETCH_COLUMN);

$missing = [];
foreach ($csv as $row) {
    if (count($row) == count($header)) {
        $t = $row[$titularIndex];
        if (is_numeric($t) && !in_array($t, $miembros)) {
            $missing[] = $t;
        }
    }
}
$missing = array_unique($missing);
echo json_encode(array_values($missing));
