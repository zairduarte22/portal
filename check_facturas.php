<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
$facturas = \App\Models\Factura::all();
foreach($facturas as $f) {
    echo 'ID: ' . $f->id . ' Pendiente: ' . $f->pendiente . ' Monto: ' . $f->monto . PHP_EOL;
}
