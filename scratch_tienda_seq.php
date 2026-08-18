<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

DB::statement("SELECT setval('tiendas_id_seq', COALESCE((SELECT MAX(id)+1 FROM tiendas), 1), false)");
echo "Sequence updated.\n";
