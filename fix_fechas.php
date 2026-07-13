<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Factura;
use App\Models\Miembro;
use Carbon\Carbon;

$facturas = Factura::orderBy('id_miembro')->orderBy('id', 'asc')->get();

$grouped = $facturas->groupBy('id_miembro');

$countFixed = 0;

foreach ($grouped as $idMiembro => $memberFacturas) {
    // Filtrar solo las facturas que fueron generadas por el script (tienen fecha al final del mes y van hacia adelante)
    // Las del script empezaban en 2026-07-01 y la fecha de emision era fin de mes.
    $facturasScript = $memberFacturas->filter(function($f) {
        if (!$f->mes_cuota) return false;
        
        $fecha = Carbon::parse($f->fecha);
        $mesCuota = Carbon::parse($f->mes_cuota);
        
        // Identificador del script: La fecha de emisión es exactamente el final del mes de la cuota
        // O si fue hacia adelante (2026-08-01, etc)
        return $fecha->toDateString() === $mesCuota->copy()->endOfMonth()->toDateString() && $mesCuota->year == 2026 && $mesCuota->month >= 7;
    });

    if ($facturasScript->count() > 0) {
        $mesInicio = Carbon::create(2026, 7, 1);
        foreach ($facturasScript as $f) {
            $f->mes_cuota = $mesInicio->toDateString();
            $f->fecha = $mesInicio->copy()->endOfMonth()->toDateString();
            $f->save();
            $mesInicio->subMonth(); // En vez de addMonth, restamos para ir hacia atras
            $countFixed++;
        }
    }
}

echo "Se arreglaron las fechas de {$countFixed} facturas generadas por el script hacia atras.\n";
