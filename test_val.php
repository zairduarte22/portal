<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

try {
    app(\App\Services\TiendaContext::class)->setTiendaId(2);
    $req = new Illuminate\Http\Request(); 
    $req->merge(['id_cliente_tienda' => 1]); 
    $val = Validator::make($req->all(), ['id_cliente_tienda' => 'nullable|exists:clientes_tienda,id']); 
    if ($val->fails()) { 
        echo json_encode($val->errors()) . "\n"; 
    } else { 
        echo 'Valid' . "\n"; 
    }
} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
}
