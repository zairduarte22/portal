<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$dbs = \Illuminate\Support\Facades\DB::select('SELECT datname FROM pg_database WHERE datistemplate = false;');
foreach ($dbs as $db) {
    echo $db->datname . "\n";
}
