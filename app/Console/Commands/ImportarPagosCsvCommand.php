<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Factura;
use App\Models\Pago;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class ImportarPagosCsvCommand extends Command
{
    protected $signature = 'app:importar-pagos-csv';
    protected $description = 'Importa pagos desde facturas07.csv y los enlaza a las facturas del sistema';

    public function handle()
    {
        $facturasCsvPath = base_path('facturas sistema.csv');
        $pagosCsvPath = base_path('facturas07.csv');

        if (!file_exists($pagosCsvPath)) {
            $this->error("No se encontró el archivo $pagosCsvPath.");
            return Command::FAILURE;
        }

        // 1. Cargar el mapa de facturas del sistema (si existe)
        $facturasMap = [];
        if (file_exists($facturasCsvPath)) {
            $this->info("Cargando diccionario de facturas del archivo facturas sistema.csv...");
            $file = fopen($facturasCsvPath, 'r');
            fgetcsv($file); // Saltar encabezados
            while (($row = fgetcsv($file)) !== false) {
                if (count($row) < 4) continue;
                $id = $row[0];
                $idMiembro = $row[1];
                $mesCuota = $row[3]; // ej. '2026-02-01'
                $facturasMap[$idMiembro][$mesCuota] = $id;
            }
            fclose($file);
        } else {
            $this->warn("No se encontró facturas sistema.csv. Se buscarán en la BD.");
        }

        // 2. Procesar Pagos
        $this->info("Procesando pagos desde facturas07.csv...");
        $file = fopen($pagosCsvPath, 'r');
        fgetcsv($file); // Saltar encabezados
        
        $pagoController = app(\App\Http\Controllers\PagoController::class);
        $countExitos = 0;
        $countErrores = 0;

        while (($row = fgetcsv($file)) !== false) {
            if (count($row) < 12) continue;

            $idCsv = trim($row[0]);
            $idMiembro = trim($row[1]);
            
            // Mapeo especial pedido por el usuario
            if ($idMiembro == '394') $idMiembro = '426';
            if ($idMiembro == '410') $idMiembro = '427';
            
            $fecha = trim($row[2]);
            $montoBs = floatval(trim($row[3]));
            $montoDivisas = floatval(trim($row[4]));
            $metodoPago = trim($row[5]);
            $factUgavi = trim($row[6]);
            $factFondo = trim($row[7]);
            $mensualidadesText = trim($row[8]);
            $referencia = trim($row[9]);
            $estado = trim($row[10]);
            $impresa = trim($row[11]);

            // Evitar procesar pagos duplicados por factura_fondo (que es única generalmente)
            if (!empty($factFondo)) {
                $existingPago = Pago::where('factura_fondo', $factFondo)->first();
                if ($existingPago) {
                    $this->warn("Fila $idCsv: El pago con Factura Fondo $factFondo ya fue importado. Saltando.");
                    continue;
                }
            }

            // Extraer meses del texto
            $mesesExtraidos = $this->extractMonths($mensualidadesText);

            if (empty($mesesExtraidos)) {
                $this->error("Fila $idCsv (Miembro $idMiembro): No se pudo entender los meses en el texto '$mensualidadesText'");
                $countErrores++;
                continue;
            }

            // Buscar las facturas correspondientes
            $facturasAPagar = [];
            foreach ($mesesExtraidos as $mesStr) {
                if (isset($facturasMap[$idMiembro][$mesStr])) {
                    $facturasAPagar[] = $facturasMap[$idMiembro][$mesStr];
                } else {
                    // Buscar en la base de datos si no está en el CSV de mapeo
                    $dbFactura = Factura::where('id_miembro', $idMiembro)->where('mes_cuota', $mesStr)->first();
                    if ($dbFactura) {
                        $facturasAPagar[] = $dbFactura->id;
                    }
                }
            }

            if (empty($facturasAPagar)) {
                $this->error("Fila $idCsv (Miembro $idMiembro): No se encontraron facturas en el sistema para los meses deducidos: " . implode(', ', $mesesExtraidos) . " (Original: $mensualidadesText)");
                $countErrores++;
                continue;
            }

            // Distribución de montos y pronto pago
            $facturasPayload = [];
            $numFacturas = count($facturasAPagar);
            
            // Lógica de "pagos regulares" para activar pronto pago
            // Si el monto total pagado en divisas equivale exactamente a $20 dólares por cada mes extraído
            $isRegular = ($montoDivisas == ($numFacturas * 20.00));

            if ($isRegular) {
                // Pagos regulares (e.g. 1 mes y pagó 20, o 2 meses y pagó 40)
                foreach ($facturasAPagar as $fid) {
                    $facturasPayload[] = [
                        'id' => $fid,
                        'monto_aplicado' => 20.00,
                        'descuento' => 5.00
                    ];
                }
            } else {
                // Pagos irregulares o parciales: Distribuimos el monto sin pronto pago
                $montoRestante = $montoDivisas;
                foreach ($facturasAPagar as $fid) {
                    $factura = Factura::find($fid);
                    $pendiente = $factura ? floatval($factura->pendiente) : 25.00;
                    
                    if ($pendiente <= 0) continue;
                    
                    $aplicar = min($montoRestante, $pendiente);
                    $facturasPayload[] = [
                        'id' => $fid,
                        'monto_aplicado' => $aplicar,
                        'descuento' => 0.00
                    ];
                    $montoRestante -= $aplicar;
                    
                    if ($montoRestante <= 0) break;
                }
                
                // Si sobró dinero y ya repasamos todas las facturas extraídas, 
                // se lo sumamos a la última factura de la lista como "saldo a favor temporal" o excedente
                if ($montoRestante > 0 && count($facturasPayload) > 0) {
                    $facturasPayload[count($facturasPayload) - 1]['monto_aplicado'] += $montoRestante;
                }
            }

            $tasaCambio = $montoDivisas > 0 ? round($montoBs / $montoDivisas, 2) : 1;

            // Construir el Request virtual para el Controlador de Pagos
            $pagoRequest = new Request();
            $pagoRequest->replace([
                'monto' => $montoDivisas,
                'monto_bs' => $montoBs,
                'tasa_cambio' => $tasaCambio,
                'fecha' => $fecha,
                'metodo_pago' => $metodoPago,
                'referencia' => $referencia,
                'factura_ugavi' => $factUgavi,
                'factura_fondo' => $factFondo,
                'facturas' => $facturasPayload,
                'force_duplicate_reference' => true // Evita bloqueo por referencia duplicada
            ]);

            // Llamar al Controlador
            try {
                $response = $pagoController->store($pagoRequest);
                $responseData = json_decode($response->getContent(), true);

                if ($response->getStatusCode() == 201 && isset($responseData['pago'])) {
                    $pagoModel = Pago::find($responseData['pago']['id']);
                    
                    // Manejar impresión
                    if ($impresa == '1' || $impresa === 1) {
                        try {
                            $pagoModel->impreso = true;
                            $pagoModel->save();
                        } catch (\Exception $e) {
                            // Ignorar si la BD no tiene la columna impreso
                        }
                    }

                    // Manejar anulación (Para que aplique la reversión contable correctamente)
                    if (strtoupper($estado) === 'ANULADA') {
                        $pagoController->anular($pagoModel->id);
                    }

                    $countExitos++;
                } else {
                    $this->error("Fila $idCsv: Error al guardar desde el controlador. " . json_encode($responseData));
                    $countErrores++;
                }
            } catch (\Exception $e) {
                $this->error("Fila $idCsv: Excepción al guardar - " . $e->getMessage());
                $countErrores++;
            }
        }

        fclose($file);

        $this->info("====================================");
        $this->info(" Importación de Pagos Completada");
        $this->info("====================================");
        $this->info("Pagos exitosos: $countExitos");
        $this->info("Pagos con error o ignorados: $countErrores");

        return Command::SUCCESS;
    }

    /**
     * Extrae de forma inteligente los meses mencionados en un texto y los convierte a formato fecha
     */
    private function extractMonths($text) {
        $months = [
            'enero' => '01', 'febrero' => '02', 'marzo' => '03', 'abril' => '04',
            'mayo' => '05', 'junio' => '06', 'julio' => '07', 'agosto' => '08',
            'septiembre' => '09', 'octubre' => '10', 'noviembre' => '11', 'diciembre' => '12'
        ];
        $matches = [];
        
        // 1. Buscar Mes + Año (Ej. "Julio 2026")
        if (preg_match_all('/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)\s*(20\d\d)/i', $text, $found)) {
            for ($i = 0; $i < count($found[0]); $i++) {
                $m = strtolower($found[1][$i]);
                $y = $found[2][$i];
                $matches[] = $y . '-' . $months[$m] . '-01';
            }
        } 
        
        // 2. Si no encontró combinaciones con año, buscar solo los meses y asumir 2026
        if (empty($matches)) {
            if (preg_match_all('/(enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre)/i', $text, $found)) {
                for ($i = 0; $i < count($found[0]); $i++) {
                    $m = strtolower($found[1][$i]);
                    $matches[] = '2026-' . $months[$m] . '-01';
                }
            }
        }
        
        return array_values(array_unique($matches));
    }
}
