<?php
$zip = new ZipArchive;
if ($zip->open('sigama.zip') === TRUE) {
    for($i = 0; $i < $zip->numFiles; $i++) {
        $filename = $zip->getNameIndex($i);
        if(strpos($filename, 'app/Models/ProductoTasca.php') !== false || 
           strpos($filename, 'app/Models/InsumoTasca.php') !== false || 
           strpos($filename, 'app/Http/Controllers/InventarioTascaController.php') !== false ||
           strpos($filename, 'app/Http/Controllers/TascaController.php') !== false) {
            file_put_contents('server_' . basename($filename), $zip->getFromIndex($i));
            echo 'Extracted ' . basename($filename) . "\n";
        }
    }
    $zip->close();
} else {
    echo 'Failed to open zip';
}
