<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Miembro;
use App\Models\Factura;
use Carbon\Carbon;

class ImportarSaldosCsvCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:importar-saldos-csv';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa los saldos iniciales desde el archivo EXPORT_MIEMBROS - MIEMBROS.csv creando facturas por mes';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $csvPath = base_path('EXPORT_MIEMBROS - MIEMBROS.csv');
        if (!file_exists($csvPath)) {
            $this->error("No se encontro el archivo CSV en la ruta: {$csvPath}");
            return Command::FAILURE;
        }

        $file = fopen($csvPath, 'r');
        $header = fgetcsv($file); // Saltar la primera linea (encabezados)

        $this->info("Iniciando importación de saldos...");

        $cuota = 25.00;
        $countDeudas = 0;
        $countFavor = 0;

        while (($row = fgetcsv($file)) !== false) {
            $idMiembro = trim($row[0]);
            $razonSocial = trim($row[1]);
            $saldoCsv = floatval(trim($row[3]));

            // Mapeo especial pedido por el usuario
            if ($idMiembro == '394') {
                $idMiembro = '426'; // LA FLOR
            } elseif ($idMiembro == '410') {
                $idMiembro = '427'; // AVICOLAS DEL SOL
            }

            if ($saldoCsv == 0) {
                continue; // No debe nada, saltar
            }

            $miembro = Miembro::find($idMiembro);
            if (!$miembro) {
                $this->warn("Miembro ID {$idMiembro} ({$razonSocial}) no encontrado en BD. Saltando...");
                continue;
            }

            if ($saldoCsv < 0) {
                // Es deuda. Ejemplo: -50 significa que debe 50
                $montoDeuda = abs($saldoCsv);
                $meses = $montoDeuda / $cuota;
                
                $mesesEnteros = floor($meses);
                $resto = $montoDeuda - ($mesesEnteros * $cuota);

                // Empezar a cobrar siempre desde Julio 2026 hacia el futuro.
                $mesInicio = Carbon::create(2026, 7, 1);

                for ($i = 0; $i < $mesesEnteros; $i++) {
                    Factura::create([
                        'id_miembro' => $idMiembro,
                        'fecha' => $mesInicio->copy()->endOfMonth()->toDateString(),
                        'mes_cuota' => $mesInicio->toDateString(),
                        'monto' => $cuota,
                        'pendiente' => $cuota
                    ]);
                    $mesInicio->addMonth();
                }

                // Si hay un saldo sobrante que no es múltiplo exacto de 25
                if ($resto > 0) {
                    Factura::create([
                        'id_miembro' => $idMiembro,
                        'fecha' => $mesInicio->copy()->endOfMonth()->toDateString(),
                        'mes_cuota' => $mesInicio->toDateString(),
                        'monto' => $resto,
                        'pendiente' => $resto
                    ]);
                }
                
                $countDeudas++;
            } else {
                // Es saldo a favor (Positivo). Ejemplo: +50
                // Lo cargamos en Agosto 2026 como saldo a favor
                Factura::create([
                    'id_miembro' => $idMiembro,
                    'fecha' => Carbon::create(2026, 8, 1)->toDateString(),
                    'mes_cuota' => Carbon::create(2026, 8, 1)->toDateString(),
                    'monto' => -$saldoCsv,
                    'pendiente' => -$saldoCsv
                ]);
                $countFavor++;
            }

            // Actualizar el saldo del miembro explicitamente
            $miembro->actualizarSaldoPendiente();
        }

        fclose($file);
        
        $this->info("Importación completada con éxito.");
        $this->info("Miembros con deuda procesados: {$countDeudas}");
        $this->info("Miembros con saldo a favor procesados: {$countFavor}");

        return Command::SUCCESS;
    }
}
