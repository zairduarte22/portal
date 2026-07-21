<?php
try {
    $insumos = app()->make('App\Http\Controllers\InventarioTascaController')->getInsumos()->getData();
    echo "SUCCESS\n";
    echo json_encode($insumos);
} catch (\Exception $e) {
    echo "ERROR\n";
    echo $e->getMessage() . "\n" . $e->getTraceAsString();
} catch (\Error $e) {
    echo "ERROR\n";
    echo $e->getMessage() . "\n" . $e->getTraceAsString();
}
