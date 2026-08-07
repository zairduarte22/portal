<?php

$files = [
    __DIR__ . '/../app/Http/Controllers/InventarioTiendaController.php',
    __DIR__ . '/../app/Http/Controllers/TiendaGastosController.php',
    __DIR__ . '/../app/Http/Controllers/ClienteTiendaController.php',
    __DIR__ . '/../routes/api.php'
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        $content = str_replace('Tasca', 'Tienda', $content);
        $content = str_replace('tasca', 'tienda', $content);
        
        file_put_contents($file, $content);
        echo "Updated $file\n";
    }
}
