<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    app(\App\Services\TiendaContext::class)->setTiendaId(1);
    $venta = \App\Models\VentaTienda::create([
        'id_cliente_tienda' => 1,
        'total' => 0,
        'descuento' => 0,
        'estado' => 'Pendiente',
        'fecha' => '2026-08-19',
        'tasa_bcv' => 36.5
    ]);
    echo "Created Venta ID: " . $venta->id . "\n";
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
