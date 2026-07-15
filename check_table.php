<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$columns = Illuminate\Support\Facades\DB::select("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'libro_ventas'");
print_r($columns);
