<?php

namespace App\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use App\Models\Miembro;
use App\Models\Factura;
use Carbon\Carbon;

#[Signature('invoices:generate-monthly')]
#[Description('Genera la factura de membresía mensual de $25 para todos los miembros')]
class GenerateMonthlyInvoices extends Command
{
    public function handle()
    {
        $this->info('Generando facturas mensuales...');
        $today = Carbon::now()->toDateString();
        $miembros = Miembro::where(function($query) use ($today) {
            $query->where('congelado', false)
                  ->orWhere(function($q) use ($today) {
                      $q->where('congelado', true)
                        ->whereNotNull('congelado_hasta')
                        ->where('congelado_hasta', '<', $today);
                  });
        })->get();
        $mesCuota = Carbon::now()->startOfMonth()->toDateString();
        $count = 0;

        foreach ($miembros as $miembro) {
            // Verificar si ya tiene factura este mes
            $exists = Factura::where('id_miembro', $miembro->id)
                ->where('mes_cuota', $mesCuota)
                ->exists();

            if (!$exists) {
                Factura::create([
                    'id_miembro' => $miembro->id,
                    'fecha' => Carbon::now()->toDateString(),
                    'mes_cuota' => $mesCuota,
                    'monto' => 25.00,
                    'pendiente' => 25.00
                ]);
                
                // No need to manually update $miembro->saldo_pendiente
                // The DB trigger trg_actualizar_saldo_miembro handles it automatically!
                $count++;
            }
        }

        $this->info("Se han generado {$count} facturas exitosamente.");
    }
}
