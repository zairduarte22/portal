<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$request = \Illuminate\Http\Request::create('/api/pagos/reporte-general', 'POST');
$controller = app()->make(\App\Http\Controllers\ExportController::class);
try {
    $response = $controller->reporteGeneralPagos($request);
    echo "Success: " . get_class($response);
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n" . $e->getTraceAsString();
}
