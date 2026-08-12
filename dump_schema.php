<?php 
require 'vendor/autoload.php'; 
$app = require_once 'bootstrap/app.php'; 
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class); 
$kernel->bootstrap(); 
$cols = DB::select("SELECT table_name, column_name, data_type, character_maximum_length, column_default FROM information_schema.columns WHERE table_schema = 'public' ORDER BY table_name, ordinal_position"); 
file_put_contents('schema_fondo_main.json', json_encode($cols, JSON_PRETTY_PRINT)); 
echo 'Done';
