<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "Pagos: " . implode(', ', \Illuminate\Support\Facades\Schema::getColumnListing('pagos')) . "\n";
echo "Vinculacion: " . implode(', ', \Illuminate\Support\Facades\Schema::getColumnListing('vinculacion_pagos')) . "\n";
