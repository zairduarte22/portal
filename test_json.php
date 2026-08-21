<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$tienda = App\Models\Tienda::with('bancos')->first();
$bancosIds = $tienda->bancos->pluck('id')->toArray();
$tienda->unsetRelation('bancos');
$tienda->bancos_ids = $bancosIds;
$tienda->bancos = $bancosIds; 
echo json_encode($tienda);
