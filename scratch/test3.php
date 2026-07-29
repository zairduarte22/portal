<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$c = new \App\Http\Controllers\TascaController();
$res = $c->getClientes();
echo json_encode($res->getData(), JSON_PRETTY_PRINT);
