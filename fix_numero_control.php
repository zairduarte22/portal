<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

\Illuminate\Support\Facades\DB::statement("UPDATE libro_ventas SET numero_control = CONCAT('00-0', numero_control) WHERE numero_control NOT LIKE '00-0%' AND numero_control IS NOT NULL");
echo "OK\n";
