<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$users = \App\Models\User::all();
foreach ($users as $u) {
    if (!$u->modules) continue;
    $mods = json_decode($u->modules, true);
    if (!is_array($mods)) continue;
    $newMods = [];
    foreach ($mods as $m) {
        if ($m === 'VentasTascaPanel') {
            $newMods = array_merge($newMods, ['UgaviBarVentas', 'UgaviBarCreditos', 'UgaviBarClientes']);
        } elseif ($m === 'GestionTascaPanel') {
            $newMods = array_merge($newMods, ['UgaviBarInventario', 'UgaviBarCatalogo', 'UgaviBarGastos', 'UgaviBarCompras']);
        } elseif ($m === 'ReportesTascaPanel') {
            $newMods[] = 'UgaviBarReportes';
        } else {
            $newMods[] = $m;
        }
    }
    $newMods = array_values(array_unique($newMods));
    $u->modules = json_encode($newMods);
    $u->save();
}
echo "Users updated successfully.\n";
