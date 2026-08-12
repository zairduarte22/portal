<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Pago;
use App\Models\Obligacion;
use App\Models\Tasa;
use App\Models\Miembro;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardPagosController extends Controller
{
    public function getDashboardData(Request $request)
    {
        $tasaHoy = Tasa::orderBy('fecha', 'desc')->first();
        $tasaActual = $tasaHoy ? $tasaHoy->monto : 1;

        // 1. Ingresos y Flujo de Caja
        $pagos = Pago::where('estado', '!=', 'Anulada')->get();
        $ingresosTotalUsd = $pagos->sum('monto');
        $ingresos20 = $ingresosTotalUsd * 0.20;

        $devaluacionIngresos = 0;
        foreach ($pagos as $pago) {
            if ($pago->monto_bs > 0) {
                $currentUsdValue = $pago->monto_bs / $tasaActual;
                $devaluation = $pago->monto - $currentUsdValue;
                $devaluacionIngresos += $devaluation;
            }
        }

        // Saldos en Bancos (Simulado como suma de ingresos por metodo_pago)
        $saldosBancos = [
            'bs' => $pagos->where('monto_bs', '>', 0)->sum('monto_bs'),
            'divisas' => $pagos->where('monto_bs', 0)->sum('monto')
        ];

        // 2. Semáforo de Morosidad
        $miembros = Miembro::all();
        $solventes = 0;
        $mora1a3 = 0;
        $mora3a6 = 0;
        $moraMas6 = 0;

        $hoy = Carbon::now();

        foreach ($miembros as $miembro) {
            $facturaVieja = DB::table('facturas')
                ->where('id_miembro', $miembro->id)
                ->where('pendiente', '>', 0)
                ->orderBy('fecha', 'asc')
                ->first();

            if (!$facturaVieja) {
                $solventes++;
            } else {
                $fechaEmision = Carbon::parse($facturaVieja->fecha);
                $mesesMora = $fechaEmision->diffInMonths($hoy);
                
                if ($mesesMora <= 3) {
                    $mora1a3++;
                } elseif ($mesesMora <= 6) {
                    $mora3a6++;
                } else {
                    $moraMas6++;
                }
            }
        }

        $semaforo = [
            ['name' => 'Solventes', 'value' => $solventes, 'color' => '#22c55e'],
            ['name' => '1-3 Meses', 'value' => $mora1a3, 'color' => '#eab308'],
            ['name' => '3-6 Meses', 'value' => $mora3a6, 'color' => '#f97316'],
            ['name' => '> 6 Meses', 'value' => $moraMas6, 'color' => '#ef4444']
        ];

        // 3. Activos en Cuentas por Cobrar (Distribución)
        $cuentasCobrar = Obligacion::where('tipo_obligacion', 'COBRAR')
            ->where('estado', '!=', 'PAGADA')
            ->get();
            
        $cxcTotalDeudaUsd = 0;
        $devaluacionCxc = 0;
        $distribucionCxcRaw = [];
        
        foreach ($cuentasCobrar as $cxc) {
            $restante = $cxc->monto_original - $cxc->monto_abonado;
            $categoria = $cxc->categoria ?: 'General';
            
            $valorUsd = 0;
            if ($cxc->moneda === 'VES') {
                $fechaApi = Carbon::parse($cxc->fecha_emision)->format('Y/m/d');
                $fechaIso = Carbon::parse($cxc->fecha_emision)->format('Y-m-d');
                
                $tasaEmisionMonto = \Illuminate\Support\Facades\Cache::remember("tasa_dolarapi_{$fechaIso}", 86400, function() use ($fechaApi, $fechaIso, $tasaActual) {
                    try {
                        $response = \Illuminate\Support\Facades\Http::timeout(5)->get("https://ve.dolarapi.com/v1/historicos/dolares/oficial/{$fechaApi}");
                        if ($response->successful() && isset($response->json()['promedio'])) {
                            return $response->json()['promedio'];
                        }
                    } catch (\Exception $e) {}
                    
                    // Fallback to local DB if API fails
                    $tasaLocal = Tasa::where('fecha', '<=', $fechaIso)->orderBy('fecha', 'desc')->first();
                    return $tasaLocal ? $tasaLocal->monto : $tasaActual;
                });
                
                $originalUsdValue = $restante / $tasaEmisionMonto;
                $currentUsdValue = $restante / $tasaActual;
                
                $devaluation = $originalUsdValue - $currentUsdValue;
                $devaluacionCxc += $devaluation;
                $valorUsd = $originalUsdValue;
            } else {
                $valorUsd = $restante;
            }
            
            $cxcTotalDeudaUsd += $valorUsd;
            
            if (!isset($distribucionCxcRaw[$categoria])) {
                $distribucionCxcRaw[$categoria] = 0;
            }
            $distribucionCxcRaw[$categoria] += $valorUsd;
        }

        $distribucionCxc = [];
        $colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#14b8a6'];
        $i = 0;
        foreach ($distribucionCxcRaw as $cat => $val) {
            if ($val > 0) {
                $distribucionCxc[] = [
                    'name' => $cat,
                    'value' => round($val, 2),
                    'color' => $colors[$i % count($colors)]
                ];
                $i++;
            }
        }

        // 4. Ingresos por Mes (Gráfico de Barras)
        $ingresosPorMes = [];
        $pagosValidos = Pago::where('estado', '!=', 'ANULADO')->get();
        
        foreach ($pagosValidos as $pago) {
            $mes = Carbon::parse($pago->fecha)->format('M Y');
            if (!isset($ingresosPorMes[$mes])) {
                $ingresosPorMes[$mes] = 0;
            }
            
            // Valor USD del pago
            $valorUsd = 0;
            if ($pago->tasa_cambio && $pago->tasa_cambio > 0) {
                $valorUsd = $pago->monto_bs / $pago->tasa_cambio;
            } else {
                $valorUsd = $pago->monto; // Asumimos que si no hay tasa, el monto es en divisa o se maneja así
            }
            $ingresosPorMes[$mes] += $valorUsd;
        }

        // Agregar ingresos históricos (de meses anteriores al sistema)
        $ingresosHistoricos = \App\Models\IngresoHistorico::all();
        foreach ($ingresosHistoricos as $ingreso) {
            $mes = Carbon::parse($ingreso->fecha)->format('M Y');
            if (!isset($ingresosPorMes[$mes])) {
                $ingresosPorMes[$mes] = 0;
            }
            $ingresosPorMes[$mes] += $ingreso->monto;
        }

        $ingresosMensuales = [];
        foreach ($ingresosPorMes as $mes => $val) {
            $ingresosMensuales[] = [
                'name' => $mes,
                'ingresos' => round($val, 2)
            ];
        }

        // 5. Cuentas por Pagar (Enfocado en la de 9000 EUR u otras)
        $cuentasPagar = Obligacion::where('tipo_obligacion', 'PAGAR')
            ->where('estado', '!=', 'PAGADA')
            ->get();
            
        $cxpTotalDeudaUsd = 0;
        $devaluacionCxp = 0;
        
        $deudaEspecial = null;
        
        foreach ($cuentasPagar as $cxp) {
            $restante = $cxp->monto_original - $cxp->monto_abonado;
            $originalUsdValue = $restante;
            $currentUsdValue = $restante;
            
            if ($cxp->moneda === 'VES') {
                $fechaApi = Carbon::parse($cxp->fecha_emision)->format('Y/m/d');
                $fechaIso = Carbon::parse($cxp->fecha_emision)->format('Y-m-d');
                
                $tasaEmisionMonto = \Illuminate\Support\Facades\Cache::remember("tasa_dolarapi_{$fechaIso}", 86400, function() use ($fechaApi, $fechaIso, $tasaActual) {
                    try {
                        $url = "https://ve.dolarapi.com/v1/historicos/dolares/oficial/{$fechaApi}";
                        $response = \Illuminate\Support\Facades\Http::timeout(5)->get($url);
                        
                        if ($response->successful() && isset($response->json()['promedio'])) {
                            return $response->json()['promedio'];
                        }
                    } catch (\Exception $e) {
                        \Illuminate\Support\Facades\Log::error("API Dolar error: " . $e->getMessage());
                    }
                    
                    // Fallback
                    $tasaLocal = Tasa::where('fecha', '<=', $fechaIso)->orderBy('fecha', 'desc')->first();
                    return $tasaLocal ? $tasaLocal->monto : $tasaActual;
                });
                
                $originalUsdValue = $restante / $tasaEmisionMonto;
                $currentUsdValue = $restante / $tasaActual;
            }
            
            $devaluation = $originalUsdValue - $currentUsdValue;
            $devaluacionCxp += $devaluation;
            $cxpTotalDeudaUsd += $currentUsdValue;
            
            if ($cxp->monto_original >= 9000 || !$deudaEspecial) {
                $deudaEspecial = [
                    'descripcion' => $cxp->descripcion,
                    'monto_original' => $cxp->monto_original,
                    'moneda' => $cxp->moneda,
                    'restante' => $restante,
                    'valor_usd_original' => $originalUsdValue,
                    'valor_usd_actual' => $currentUsdValue,
                    'ahorro_devaluacion' => $originalUsdValue - $currentUsdValue,
                    'fecha_emision' => $cxp->fecha_emision
                ];
            }
        }

        return response()->json([
            'tasa_actual' => $tasaActual,
            'flujo_caja' => [
                'ingresos_totales' => $ingresosTotalUsd,
                'ingresos_20_porciento' => $ingresos20,
                'devaluacion_ingresos' => $devaluacionIngresos,
                'saldos_bancos' => $saldosBancos
            ],
            'morosidad' => [
                'solventes' => $solventes,
                'total_miembros' => count($miembros),
                'grafico' => $semaforo
            ],
            'cuentas_por_cobrar' => [
                'total_usd' => $cxcTotalDeudaUsd,
                'devaluacion' => $devaluacionCxc,
                'distribucion' => $distribucionCxc
            ],
            'ingresos_mensuales' => $ingresosMensuales,
            'cuentas_por_pagar' => [
                'total_usd' => $cxpTotalDeudaUsd,
                'devaluacion' => $devaluacionCxp,
                'deuda_especial' => $deudaEspecial
            ],
            'desfase_total' => $devaluacionCxp - $devaluacionIngresos - $devaluacionCxc
        ]);
    }
}
