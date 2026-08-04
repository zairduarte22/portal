<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$reqStart = '2026-08-01';
$reqEnd = '2026-08-31';

$ventasHoy = \App\Models\VentaTasca::with('pagos')->whereBetween('fecha', [$reqStart, $reqEnd])
    ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
    ->get();

$totalVentasHoy = $ventasHoy->sum(function($v) { return $v->total - $v->descuento_real + $v->cargo_servicio; });

$pagosHoy = DB::table('pago_venta_tasca')
    ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
    ->join('ventas_tasca', 'pago_venta_tasca.id_venta', '=', 'ventas_tasca.id')
    ->whereBetween('pagos_tasca.fecha_pago', [$reqStart, $reqEnd])
    ->select('pagos_tasca.metodo_pago', 'ventas_tasca.fecha as fecha_venta', 'pago_venta_tasca.monto_abonado_usd')
    ->get();

$startRange = \Carbon\Carbon::parse($reqStart)->startOfDay();
$endRange = \Carbon\Carbon::parse($reqEnd)->endOfDay();

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
echo "Desglose Pagos: {$desglose}\n";
echo "Credito: {$creditoHoy}\n";
echo "Diferencia: " . ($totalVentasHoy - ($desglose + $creditoHoy)) . "\n";
