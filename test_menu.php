<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/tasca/menu-publico', 'GET');
$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$response = $httpKernel->handle($request);
echo $response->getStatusCode() . "\n";
echo substr($response->getContent(), 0, 500);
