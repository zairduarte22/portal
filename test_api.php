<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$request = Illuminate\Http\Request::create('/api/tasca/reportes/rendimiento', 'GET');
$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

$user = \App\Models\User::first();
\Illuminate\Support\Facades\Auth::login($user);

$response = $httpKernel->handle($request);
echo $response->getStatusCode() . "\n";
if ($response->getStatusCode() != 200) {
    echo $response->getContent();
} else {
    echo "OK: " . strlen($response->getContent());
}
