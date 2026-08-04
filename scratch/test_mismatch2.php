<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$ventasHoy = \App\Models\VentaTasca::with('pagos')->get();
foreach ($ventasHoy as $v) {
    $pagado = $v->pagos->sum('pivot.monto_abonado_usd');
    $vTotal = $v->total - $v->descuento_real + $v->cargo_servicio;
    $cred = ($v->estado === 'Credito' || $v->estado === 'Parcial') ? $v->pendiente : 0;
    
    if (round($vTotal, 2) !== round($pagado + $cred, 2)) {
        echo "Mismatch Venta {$v->id}: Total=$vTotal, Pagado=$pagado, Cred=$cred, Estado={$v->estado}\n";
    }
}
echo "Done.\n";
