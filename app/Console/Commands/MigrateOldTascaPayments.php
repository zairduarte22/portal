<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class MigrateOldTascaPayments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'migrate:old-tasca-payments';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Migra los pagos antiguos de la tasca hacia las nuevas tablas de cuenta_banco y cuenta_moneda_extranjera';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando migración de pagos antiguos de la Tasca...');

        DB::beginTransaction();
        try {
            // 1. Crear bancos temporales si no existen
            $bancoVesId = DB::table('bancos')->insertGetId([
                'nombre' => 'Banco Temporal Tasca VES',
                'titular' => 'Tasca Default',
                'divisa' => 'VES',
                'propietario' => 'TASCA',
                'para_membresias' => false
            ]);

            DB::table('banco_tienda')->insert([
                'banco_id' => $bancoVesId,
                'tienda_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $bancoUsdId = DB::table('bancos')->insertGetId([
                'nombre' => 'Banco Temporal Tasca USD',
                'titular' => 'Tasca Default',
                'divisa' => 'USD',
                'propietario' => 'TASCA',
                'para_membresias' => false
            ]);

            DB::table('banco_tienda')->insert([
                'banco_id' => $bancoUsdId,
                'tienda_id' => 1,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            $this->info("Bancos temporales creados: VES($bancoVesId), USD($bancoUsdId)");

            // 2. Iterar sobre pagos_tienda
            $pagos = DB::table('pagos_tienda')->get();
            $countVes = 0;
            $countUsd = 0;

            foreach ($pagos as $pago) {
                // Métodos en USD
                $isUsd = in_array(strtolower($pago->metodo_pago), ['zelle', 'efectivo divisas']);
                $isVes = !$isUsd; // Todo lo demás a VES

                if ($isVes) {
                    // Verificar si ya existe
                    $existe = DB::table('cuenta_banco')->where('id_pago_tienda', $pago->id)->exists();
                    if (!$existe) {
                        DB::table('cuenta_banco')->insert([
                            'id_banco' => $bancoVesId,
                            'id_pago_tienda' => $pago->id,
                            'fecha' => $pago->fecha_pago,
                            'tipo_operacion' => 'Ingreso',
                            'referencia' => $pago->referencia,
                            'beneficiario' => 'Ingreso por Venta Tasca (Antiguo)',
                            'descripcion' => "Pago mediante {$pago->metodo_pago}",
                            'debe' => 0,
                            'haber' => $pago->monto_bs > 0 ? $pago->monto_bs : ($pago->monto_usd * $pago->tasa)
                        ]);
                        $countVes++;
                    }
                } else {
                    $existe = DB::table('cuenta_moneda_extranjera')->where('id_pago_tienda', $pago->id)->exists();
                    if (!$existe) {
                        DB::table('cuenta_moneda_extranjera')->insert([
                            'id_banco' => $bancoUsdId,
                            'id_pago_tienda' => $pago->id,
                            'fecha' => $pago->fecha_pago,
                            'tipo_operacion' => 'Ingreso',
                            'referencia' => $pago->referencia,
                            'beneficiario' => 'Ingreso por Venta Tasca (Antiguo)',
                            'descripcion' => "Pago mediante {$pago->metodo_pago}",
                            'debe' => 0,
                            'haber' => $pago->monto_usd
                        ]);
                        $countUsd++;
                    }
                }
            }

            DB::commit();
            $this->info("Migración completada. Registros en VES: $countVes, Registros en USD: $countUsd");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error en migración: " . $e->getMessage());
        }
    }
}
