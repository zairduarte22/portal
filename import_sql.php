<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

config(['database.connections.pgsql.database' => 'fondo_main_clean']);
DB::purge('pgsql');

$sql = file_get_contents('estructura.sql');
DB::unprepared($sql);
echo "Imported.\n";
