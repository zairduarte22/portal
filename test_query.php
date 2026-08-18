<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Simulate TiendaContext
app(\App\Services\TiendaContext::class)->setTiendaId(2);

$query = \App\Models\VentaTienda::query();
echo $query->toSql();
echo "\n";
print_r($query->getBindings());
