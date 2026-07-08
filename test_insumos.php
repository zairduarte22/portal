<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    echo json_encode(\App\Models\InsumoTasca::with('lotes.proveedor')->get());
} catch (\Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
