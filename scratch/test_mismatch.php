<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$start = now()->toDateString();
$end = now()->toDateString();

$ventasHoy = \App\Models\VentaTasca::with('pagos')->whereBetween('fecha', [$start, $end])
    ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
    ->get();

$totalVentasHoy = $ventasHoy->sum(function($v) { return $v->total - $v->descuento_real + $v->cargo_servicio; });

$pagosHoy = DB::table('pago_venta_tasca')
    ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
    ->join('ventas_tasca', 'pago_venta_tasca.id_venta', '=', 'ventas_tasca.id')
    ->whereBetween('pagos_tasca.fecha_pago', [$start, $end])
    ->select('pagos_tasca.metodo_pago', 'ventas_tasca.fecha as fecha_venta', 'pago_venta_tasca.monto_abonado_usd')
    ->get();

$startRange = \Carbon\Carbon::parse($start)->startOfDay();
$endRange = \Carbon\Carbon::parse($end)->endOfDay();

$desglose = 0;
foreach ($pagosHoy as $p) {
    if (\Carbon\Carbon::parse($p->fecha_venta)->between($startRange, $endRange)) {
        $desglose += $p->monto_abonado_usd;
    }
}

$creditoHoy = 0;
foreach ($ventasHoy as $v) {
    if ($v->estado === 'Credito' || $v->estado === 'Parcial') {
        $creditoHoy += $v->pendiente;
    }
}

echo "Total Ventas: {$totalVentasHoy}\n";
echo "Desglose: {$desglose}\n";
echo "Credito: {$creditoHoy}\n";
echo "Suma: " . ($desglose + $creditoHoy) . "\n";

foreach ($ventasHoy as $v) {
    $pagado = $v->pagos->sum('pivot.monto_abonado_usd');
    $vTotal = $v->total - $v->descuento_real + $v->cargo_servicio;
    $cred = ($v->estado === 'Credito' || $v->estado === 'Parcial') ? $v->pendiente : 0;
    
    if (round($vTotal, 2) !== round($pagado + $cred, 2)) {
        echo "Mismatch Venta {$v->id}: Total=$vTotal, Pagado=$pagado, Cred=$cred, Estado={$v->estado}\n";
    }
}
