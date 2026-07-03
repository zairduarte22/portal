<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();
DB::statement("ALTER TABLE miembros DROP COLUMN IF EXISTS carnets_disponibles");
echo "Done";
