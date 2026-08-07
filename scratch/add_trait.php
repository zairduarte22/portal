<?php

$files = [
    __DIR__ . '/../app/Models/ClienteTienda.php',
    __DIR__ . '/../app/Models/CompraTienda.php',
    __DIR__ . '/../app/Models/GastoTienda.php',
    __DIR__ . '/../app/Models/InsumoTienda.php',
    __DIR__ . '/../app/Models/LoteTienda.php', // Wait, lotes_tienda doesn't have tienda_id directly? Ah, wait, did I add tienda_id to lotes_tienda?
    __DIR__ . '/../app/Models/PagoTienda.php',
    __DIR__ . '/../app/Models/ProductoTienda.php',
    __DIR__ . '/../app/Models/ProveedorTienda.php',
    __DIR__ . '/../app/Models/VentaTienda.php',
];

foreach ($files as $file) {
    if (file_exists($file)) {
        $content = file_get_contents($file);
        
        // Ensure not already using the trait
        if (strpos($content, 'use \App\Traits\BelongsToTienda;') === false) {
            // Find "class Name extends Model\n{"
            $content = preg_replace('/(class\s+\w+\s+extends\s+Model(?:[^{]+)?\s*\{)/i', "$1\n    use \App\Traits\BelongsToTienda;\n", $content);
            file_put_contents($file, $content);
            echo "Added trait to $file\n";
        }
    }
}
