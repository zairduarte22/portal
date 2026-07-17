<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$productos = \App\Models\ProductoTasca::all();
foreach ($productos as $p) {
    echo "ID: {$p->id} | Insumo: {$p->id_insumo} | Nombre: {$p->nombre} | Precio: {$p->precio}\n";
}
