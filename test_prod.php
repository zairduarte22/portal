<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$prod = \App\Models\ProductoTasca::with('insumo')->first();
echo json_encode($prod->toArray(), JSON_PRETTY_PRINT);
