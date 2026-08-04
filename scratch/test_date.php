<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$venta = \App\Models\VentaTasca::whereNotNull('fecha_vencimiento')->first();
if($venta) {
    echo json_encode(['fecha_vencimiento' => $venta->fecha_vencimiento]);
}
