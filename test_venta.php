<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$request = Illuminate\Http\Request::create('/api/tienda/ventas', 'POST', [], [], [], ['HTTP_X-Tienda-Id' => '2', 'HTTP_ACCEPT' => 'application/json'], json_encode([
    'id_cliente_tienda' => 1
]));
$request->headers->set('X-Tienda-Id', '2');
$request->headers->set('Content-Type', 'application/json');
$request->headers->set('Accept', 'application/json');

$response = $kernel->handle($request);
echo "Status: " . $response->getStatusCode() . "\n";
echo "Content: " . $response->getContent() . "\n";
