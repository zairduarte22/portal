<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$req = Illuminate\Http\Request::create('/api/tasca/reportes/rendimiento?start_date=2024-01-01&end_date=2026-12-31', 'GET');
$controller = app()->make(\App\Http\Controllers\TascaController::class);

$res = $controller->getReporteRendimiento($req);
$reporte = json_decode($res->getContent());
echo "Reporte: " . ($reporte->kpis->ingresos_totales ?? 'N/A') . "\n";

$res2 = $controller->getEstadisticas($req);
$estadisticas = json_decode($res2->getContent());
echo "Estadisticas: " . ($estadisticas->ventas_dia_usd ?? 'N/A') . "\n";
