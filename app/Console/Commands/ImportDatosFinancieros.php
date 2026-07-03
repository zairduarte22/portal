<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ImportDatosFinancieros extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'import:datos-financieros {--truncate : Eliminar los registros actuales antes de importar}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Importa datos financieros desde archivos CSV a las tablas libro_ventas, cuenta_banco y cuenta_moneda_extranjera.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Iniciando importación de datos financieros...');

        if ($this->option('truncate')) {
            if ($this->confirm('¿Estás seguro que deseas vaciar las tablas libro_ventas, cuenta_banco y cuenta_moneda_extranjera?', true)) {
                $this->info('Vaciando tablas...');
                // PostgreSQL: TRUNCATE CASCADE disables FK checks for the truncation
                DB::statement('TRUNCATE TABLE cuenta_banco, cuenta_moneda_extranjera, libro_ventas CASCADE;');
                $this->info('Tablas vaciadas correctamente.');
            }
        }

        $basePath = 'c:\proyectos\fondo2\importaciones';

        // 1. Importar Libro de Ventas (INGRESOS.csv)
        $this->importarLibroVentas("$basePath\INGRESOS.csv");

        // 2. Importar Conciliación Bs (CONCILIACION_BS (13).csv)
        $this->importarConciliacionBs("$basePath\CONCILIACION_BS (13).csv");

        // 3. Importar Conciliación Divisas (CONCILIACION_DIVISAS.csv)
        $this->importarConciliacionDivisas("$basePath\CONCILIACION_DIVISAS.csv");

        $this->info('Importación completada con éxito.');
        return Command::SUCCESS;
    }

    private function importarLibroVentas($path)
    {
        $this->info("Importando $path...");
        if (!file_exists($path)) {
            $this->error("El archivo $path no existe.");
            return;
        }

        $file = fopen($path, 'r');
        $header = fgetcsv($file);
        
        // "ID_INGRESO","ID_FACTURA","FECHA","CUENTA_CONTABLE","TIPO_INGRESO","BENEFICIARIO","METODO_PAGO","DETALLE","MONTO","MONTO_DIVISAS","REFERENCIA","NUMERO_FACTURA","NUMERO_CONTROL","TITULAR"
        
        $count = 0;
        $miembrosValidos = DB::table('miembros')->pluck('id')->toArray();
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                // Combina header y row, manejando casos donde puedan haber distintas cantidades de columnas
                if (count($header) !== count($row)) {
                    continue;
                }
                $data = array_combine($header, $row);

                // Normalizar método de pago
                $metodo = 'Pago Movil/Transferencia';
                $mp_raw = strtolower($data['METODO_PAGO']);
                if (str_contains($mp_raw, 'zelle')) $metodo = 'Zelle';
                elseif (str_contains($mp_raw, 'efectivo')) $metodo = 'Efectivo Divisas';
                elseif (str_contains($mp_raw, 'cruces')) $metodo = 'Cruces';
                
                // Normalizar montos
                $monto_bs = floatval(str_replace(',', '', $data['MONTO'] ?? '0'));
                $monto_divisas = floatval(str_replace(',', '', $data['MONTO_DIVISAS'] ?? '0'));
                
                // Calcular tasa de cambio asumiendo monto = monto_bs y monto_divisas = monto / tasa.
                // Si la base es divisas, $tasa = $monto_bs / $monto_divisas.
                $tasa = 1.0;
                if ($monto_divisas > 0) {
                    $tasa = $monto_bs / $monto_divisas;
                }

                $id_miembro = is_numeric($data['TITULAR']) ? intval($data['TITULAR']) : null;
                if ($id_miembro && !in_array($id_miembro, $miembrosValidos)) {
                    $id_miembro = null; // Set to null if member doesn't exist
                }

                DB::table('libro_ventas')->insert([
                    'id' => $data['ID_INGRESO'],
                    'fecha' => $data['FECHA'] ? Carbon::parse($data['FECHA'])->format('Y-m-d') : null,
                    'id_miembro' => $id_miembro,
                    'monto' => $monto_divisas,
                    'monto_bs' => $monto_bs,
                    'tipo' => $data['TIPO_INGRESO'] === 'NULL' ? null : $data['TIPO_INGRESO'],
                    'metodo_pago' => $metodo,
                    'referencia' => $data['REFERENCIA'] === 'NULL' ? null : $data['REFERENCIA'],
                    'numero_factura' => $data['NUMERO_FACTURA'] === 'NULL' ? null : $data['NUMERO_FACTURA'],
                    'numero_control' => $data['NUMERO_CONTROL'] === 'NULL' ? null : ('00-0' . $data['NUMERO_CONTROL']),
                ]);
                $count++;
            }
            DB::commit();
            $this->info("  -> $count registros insertados en libro_ventas.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error importando Libro de Ventas: " . $e->getMessage());
        }
        fclose($file);
    }

    private function importarConciliacionBs($path)
    {
        $this->info("Importando $path...");
        if (!file_exists($path)) {
            $this->error("El archivo $path no existe.");
            return;
        }

        $file = fopen($path, 'r');
        $header = fgetcsv($file);
        
        // "ID_MOVIMIENTO","ID_INGRESOS","ID_FACTURA","ID_EGRESO","FECHA","CUENTA_CONTABLE","TIPO_OPERACION","REFERENCIA","BENEFICIARIO","DESCRIPCION","INGRESO","EGRESO"

        $count = 0;
        $ventasValidas = DB::table('libro_ventas')->pluck('id')->toArray();
        $ventasInsertadas = [];
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                if (count($header) !== count($row)) continue;
                $data = array_combine($header, $row);

                $ingreso = floatval(str_replace(',', '', $data['INGRESO'] ?? '0'));
                $egreso = floatval(str_replace(',', '', $data['EGRESO'] ?? '0'));
                
                $id_venta = ($data['ID_INGRESOS'] && $data['ID_INGRESOS'] !== 'NULL') ? intval($data['ID_INGRESOS']) : null;
                if ($id_venta) {
                    if (!in_array($id_venta, $ventasValidas)) {
                        $id_venta = null;
                    } elseif (in_array($id_venta, $ventasInsertadas)) {
                        // Skip exact duplicates or log warning if another movement tries to link to same venta
                        continue;
                    }
                }

                DB::table('cuenta_banco')->insert([
                    'id' => $data['ID_MOVIMIENTO'],
                    'fecha' => $data['FECHA'] ? Carbon::parse($data['FECHA'])->format('Y-m-d') : null,
                    'id_banco' => 1, // BNC por defecto
                    'tipo_operacion' => $data['TIPO_OPERACION'] === 'NULL' ? null : $data['TIPO_OPERACION'],
                    'beneficiario' => $data['BENEFICIARIO'] === 'NULL' ? null : $data['BENEFICIARIO'],
                    'debe' => $ingreso,
                    'haber' => $egreso,
                    'descripcion' => $data['DESCRIPCION'] === 'NULL' ? null : $data['DESCRIPCION'],
                    'referencia' => $data['REFERENCIA'] === 'NULL' ? null : $data['REFERENCIA'],
                    'id_venta' => $id_venta,
                ]);
                if ($id_venta) {
                    $ventasInsertadas[] = $id_venta;
                }
                $count++;
            }
            DB::commit();
            $this->info("  -> $count registros insertados en cuenta_banco.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error importando cuenta_banco: " . $e->getMessage());
        }
        fclose($file);
    }

    private function importarConciliacionDivisas($path)
    {
        $this->info("Importando $path...");
        if (!file_exists($path)) {
            $this->error("El archivo $path no existe.");
            return;
        }

        $file = fopen($path, 'r');
        $header = fgetcsv($file);
        
        // "ID_MOV_DIVISAS","ID_INGRESOS","ID_FACTURA","ID_EGRESO","FECHA","CUENTA_CONTABLE","TIPO_OPERACION","REFERENCIA","BENEFICIARIO","DESCRIPCION","INGRESO","EGRESO","METODO_PAGO","TITULAR"

        $count = 0;
        $ventasValidas = DB::table('libro_ventas')->pluck('id')->toArray();
        $ventasInsertadas = [];
        DB::beginTransaction();
        try {
            while (($row = fgetcsv($file)) !== false) {
                if (count($header) !== count($row)) continue;
                $data = array_combine($header, $row);

                $ingreso = floatval(str_replace(',', '', $data['INGRESO'] ?? '0'));
                $egreso = floatval(str_replace(',', '', $data['EGRESO'] ?? '0'));

                $id_venta = ($data['ID_INGRESOS'] && $data['ID_INGRESOS'] !== 'NULL') ? intval($data['ID_INGRESOS']) : null;
                if ($id_venta) {
                    if (!in_array($id_venta, $ventasValidas)) {
                        $id_venta = null;
                    } elseif (in_array($id_venta, $ventasInsertadas)) {
                        // Skip exact duplicates or log warning if another movement tries to link to same venta
                        continue;
                    }
                }

                DB::table('cuenta_moneda_extranjera')->insert([
                    'id' => $data['ID_MOV_DIVISAS'],
                    'fecha' => $data['FECHA'] ? Carbon::parse($data['FECHA'])->format('Y-m-d') : null,
                    'id_banco' => 2, // Zelle (como cuenta en moneda extranjera o banco 2) Asumiremos 2 para Zelle si existe en `bancos`. De lo contrario, usaremos 2 de `cuenta_moneda_extranjera`
                    'tipo_operacion' => $data['TIPO_OPERACION'] === 'NULL' ? null : $data['TIPO_OPERACION'],
                    'beneficiario' => $data['BENEFICIARIO'] === 'NULL' ? null : $data['BENEFICIARIO'],
                    'debe' => $ingreso,
                    'haber' => $egreso,
                    'descripcion' => $data['DESCRIPCION'] === 'NULL' ? null : $data['DESCRIPCION'],
                    'referencia' => $data['REFERENCIA'] === 'NULL' ? null : $data['REFERENCIA'],
                    'id_venta' => $id_venta,
                ]);
                if ($id_venta) {
                    $ventasInsertadas[] = $id_venta;
                }
                $count++;
            }
            DB::commit();
            $this->info("  -> $count registros insertados en cuenta_moneda_extranjera.");
        } catch (\Exception $e) {
            DB::rollBack();
            $this->error("Error importando cuenta_moneda_extranjera: " . $e->getMessage());
        }
        fclose($file);
    }
}
