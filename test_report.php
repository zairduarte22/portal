<?php 
require __DIR__.'/vendor/autoload.php'; 
$app = require_once __DIR__.'/bootstrap/app.php'; 
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class); 
$kernel->bootstrap(); 
$req = Illuminate\Http\Request::create('/api/pagos/exportar/general/json', 'GET', ['desde' => '2026-06-01', 'hasta' => '2026-08-31']); 
$ctrl = new App\Http\Controllers\ExportController(); 
echo $ctrl->reporteGeneralPagosJson($req)->getContent();
