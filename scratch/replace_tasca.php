<?php

$files = glob(__DIR__ . '/../app/Models/*Tienda*.php');
$files[] = __DIR__ . '/../app/Http/Controllers/TiendaController.php';

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Replace class names
    $content = str_replace('Tasca', 'Tienda', $content);
    $content = str_replace('tasca', 'tienda', $content);
    
    file_put_contents($file, $content);
}
echo "Replaced strings in " . count($files) . " files.\n";
