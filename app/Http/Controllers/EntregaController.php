<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Entrega;
use App\Models\Pago;
use App\Services\EntregaPdfService;
use Carbon\Carbon;

class EntregaController extends Controller
{
    public function index()
    {
        $entregas = Entrega::orderBy('fecha', 'desc')->get();
        return response()->json($entregas);
    }

    public function getResumen(Request $request)
    {
        $request->validate([
            'desde' => 'required|date',
            'hasta' => 'required|date'
        ]);

        $desde = $request->desde;
        $hasta = $request->hasta;

        // Obtain payments in range that haven't been settled and aren't annulled
        $pagos = Pago::whereBetween('fecha', [$desde, $hasta])
            ->whereNull('entrega_id')
            ->where(function($q) {
                $q->whereNull('estado')
                  ->orWhere('estado', '!=', 'Anulada');
            })
            ->get();

        $totalBs = 0;
        $totalUsd = 0;
        $totalCrucesBs = 0;

        foreach ($pagos as $pago) {
            $metodo = strtolower($pago->metodo_pago ?? '');
            if ($metodo === 'pago movil/transferencia') {
                $totalBs += floatval($pago->monto_bs);
            } else if ($metodo === 'cruces') {
                $totalCrucesBs += floatval($pago->monto_bs);
            } else {
                // Zelle, Efectivo Divisas
                $totalUsd += floatval($pago->monto);
            }
        }

        $ugaviBaseBs = $totalBs * 0.60;
        $clubBaseBs = $totalBs * 0.20;
        
        $ugaviBaseUsd = $totalUsd * 0.60;
        $clubBaseUsd = $totalUsd * 0.20;
        
        $ugaviBaseCrucesBs = $totalCrucesBs * 0.60;
        $clubBaseCrucesBs = $totalCrucesBs * 0.20;

        // Fetch detailed Obligaciones (Cuentas por Cobrar)
        $obligacionesCxC = \App\Models\Obligacion::where('tipo_obligacion', 'COBRAR')
            ->where('tercero', 'UGAVI')
            ->where('estado', '!=', 'PAGADA')
            ->where('estado', '!=', 'ANULADA')
            ->orderBy('fecha_emision', 'asc')
            ->get();
            
        $balanceCuentasPorCobrarUsd = 0;
        $balanceCuentasPorCobrarBs = 0;
        $detallesCxC = [];
        
        foreach($obligacionesCxC as $obl) {
            $deuda = floatval($obl->monto_original) - floatval($obl->monto_abonado);
            if ($deuda <= 0) continue;
            
            if ($obl->moneda === 'VES') {
                $balanceCuentasPorCobrarBs += $deuda;
            } else {
                $balanceCuentasPorCobrarUsd += $deuda;
            }
            
            // Format details for frontend
            $detallesCxC[] = [
                'id' => $obl->id,
                'fecha_emision' => Carbon::parse($obl->fecha_emision)->format('d/m/Y'),
                'descripcion' => $obl->descripcion,
                'moneda' => $obl->moneda,
                'monto_original' => floatval($obl->monto_original),
                'monto_abonado' => floatval($obl->monto_abonado),
                'deuda' => $deuda
            ];
        }

        return response()->json([
            'total_bs' => $totalBs,
            'total_usd' => $totalUsd,
            'total_cruces_bs' => $totalCrucesBs,
            'ugavi_base_bs' => $ugaviBaseBs,
            'club_base_bs' => $clubBaseBs,
            'ugavi_base_usd' => $ugaviBaseUsd,
            'club_base_usd' => $clubBaseUsd,
            'ugavi_base_cruces_bs' => $ugaviBaseCrucesBs,
            'club_base_cruces_bs' => $clubBaseCrucesBs,
            'balance_cxc_usd' => $balanceCuentasPorCobrarUsd,
            'balance_cxc_bs' => $balanceCuentasPorCobrarBs,
            'detalles_cxc' => $detallesCxC,
            'pagos_count' => $pagos->count()
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'fecha' => 'required|date',
            'rango_desde' => 'required|date',
            'rango_hasta' => 'required|date',
            'total_bs' => 'required|numeric',
            'total_usd' => 'required|numeric',
            'ugavi_base_bs' => 'required|numeric',
            'ugavi_base_usd' => 'required|numeric',
            'club_base_bs' => 'required|numeric',
            'club_base_usd' => 'required|numeric',
            'descuento_cruces_bs' => 'required|numeric',
            'descuento_cruces_usd' => 'required|numeric',
            'monto_pagado_ugavi_bs' => 'required|numeric',
            'monto_pagado_ugavi_usd' => 'required|numeric',
            'monto_pagado_club_bs' => 'required|numeric',
            'monto_pagado_club_usd' => 'required|numeric',
            'metodo_pago' => 'nullable|string',
            'tasa_cambio' => 'required|numeric'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $entregaData = $request->except([
                'descuentos_cxc_usd', 
                'descuentos_cxc_bs',
                'banco_ugavi_usd_id',
                'banco_ugavi_bs_id',
                'banco_club_usd_id',
                'banco_club_bs_id'
            ]);
            $entrega = Entrega::create($entregaData);

            // Update the payments in the range to link them to this entrega
            Pago::whereBetween('fecha', [$request->rango_desde, $request->rango_hasta])
                ->whereNull('entrega_id')
                ->where(function($q) {
                    $q->whereNull('estado')
                      ->orWhere('estado', '!=', 'Anulada');
                })
                ->update(['entrega_id' => $entrega->id]);

            // Aplicar descuentos especificos de CxC en USD
            if ($request->has('descuentos_cxc_usd') && is_array($request->descuentos_cxc_usd)) {
                foreach ($request->descuentos_cxc_usd as $obligacionId => $montoUsd) {
                    $montoUsd = floatval($montoUsd);
                    if ($montoUsd <= 0) continue;
                    
                    $obligacion = \App\Models\Obligacion::find($obligacionId);
                    if ($obligacion) {
                        $deuda = floatval($obligacion->monto_original) - floatval($obligacion->monto_abonado);
                        
                        // Si el descuento es en USD y la obligación está en VES (Ej. Cruce)
                        if ($obligacion->moneda === 'VES') {
                            $montoAAplicar = min($deuda, $montoUsd * $request->tasa_cambio); // Se aplica en BS
                        } else {
                            $montoAAplicar = min($deuda, $montoUsd); // Se aplica en USD
                        }
                        
                        \App\Models\AbonoObligacion::create([
                            'obligacion_id' => $obligacion->id,
                            'fecha' => $request->fecha,
                            'monto_abonado' => $montoAAplicar,
                            'monto_banco' => 0,
                            'moneda_pago' => 'USD',
                            'tasa_cambio' => $request->tasa_cambio,
                            'banco_id' => null,
                            'referencia' => 'ENTREGA-' . $entrega->id . '-USD'
                        ]);
                        
                        $obligacion->monto_abonado += $montoAAplicar;
                        if (round($obligacion->monto_abonado, 2) >= round($obligacion->monto_original, 2)) {
                            $obligacion->estado = 'PAGADA';
                        } else {
                            $obligacion->estado = 'PARCIAL';
                        }
                        $obligacion->save();
                    }
                }
            }

            // Aplicar descuentos especificos de CxC en BS
            if ($request->has('descuentos_cxc_bs') && is_array($request->descuentos_cxc_bs)) {
                foreach ($request->descuentos_cxc_bs as $obligacionId => $montoBs) {
                    $montoBs = floatval($montoBs);
                    if ($montoBs <= 0) continue;
                    
                    $obligacion = \App\Models\Obligacion::find($obligacionId);
                    if ($obligacion) {
                        $deuda = floatval($obligacion->monto_original) - floatval($obligacion->monto_abonado);
                        
                        // Si el descuento es en BS y la obligación está en VES (Ej. Cruce)
                        if ($obligacion->moneda === 'VES') {
                            $montoAAplicar = min($deuda, $montoBs); // Se aplica directo en BS
                        } else {
                            $montoAAplicar = min($deuda, $montoBs / $request->tasa_cambio); // Se aplica en USD
                        }
                        
                        \App\Models\AbonoObligacion::create([
                            'obligacion_id' => $obligacion->id,
                            'fecha' => $request->fecha,
                            'monto_abonado' => $montoAAplicar,
                            'monto_banco' => 0,
                            'moneda_pago' => 'VES',
                            'tasa_cambio' => $request->tasa_cambio,
                            'banco_id' => null,
                            'referencia' => 'ENTREGA-' . $entrega->id . '-BS'
                        ]);
                        
                        $obligacion->monto_abonado += $montoAAplicar;
                        if (round($obligacion->monto_abonado, 2) >= round($obligacion->monto_original, 2)) {
                            $obligacion->estado = 'PAGADA';
                        } else {
                            $obligacion->estado = 'PARCIAL';
                        }
                        $obligacion->save();
                    }
                }
            }

            // Insertar pago a UGAVI en banco (USD)
            if ($request->monto_pagado_ugavi_usd > 0 && !empty($request->banco_ugavi_usd_id)) {
                $banco = \Illuminate\Support\Facades\DB::table('bancos')->where('id', $request->banco_ugavi_usd_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                $montoReal = $banco->divisa === 'VES' ? ($request->monto_pagado_ugavi_usd * $request->tasa_cambio) : $request->monto_pagado_ugavi_usd;
                
                \Illuminate\Support\Facades\DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $request->fecha ?? now()->toDateString(),
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia_ugavi_usd ?? 'ENTREGA-U-USD-'.$entrega->id,
                    'descripcion' => 'Pago del 60% por Cuotas de Miembro (Divisas)',
                    'beneficiario' => 'UGAVI',
                    'debe' => 0,
                    'haber' => $montoReal,
                ]);
            }
            
            // Insertar pago a UGAVI en banco (BS)
            if ($request->monto_pagado_ugavi_bs > 0 && !empty($request->banco_ugavi_bs_id)) {
                $banco = \Illuminate\Support\Facades\DB::table('bancos')->where('id', $request->banco_ugavi_bs_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                $montoReal = $banco->divisa === 'VES' ? $request->monto_pagado_ugavi_bs : ($request->monto_pagado_ugavi_bs / $request->tasa_cambio);
                
                \Illuminate\Support\Facades\DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $request->fecha ?? now()->toDateString(),
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia_ugavi_bs ?? 'ENTREGA-U-BS-'.$entrega->id,
                    'descripcion' => 'Pago del 60% por Cuotas de Miembro (Bolívares)',
                    'beneficiario' => 'UGAVI',
                    'debe' => 0,
                    'haber' => $montoReal,
                ]);
            }

            // Insertar pago a Club UGAVI en banco (USD)
            if ($request->monto_pagado_club_usd > 0 && !empty($request->banco_club_usd_id)) {
                $banco = \Illuminate\Support\Facades\DB::table('bancos')->where('id', $request->banco_club_usd_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                $montoReal = $banco->divisa === 'VES' ? ($request->monto_pagado_club_usd * $request->tasa_cambio) : $request->monto_pagado_club_usd;
                
                \Illuminate\Support\Facades\DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $request->fecha ?? now()->toDateString(),
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia_club_usd ?? 'ENTREGA-C-USD-'.$entrega->id,
                    'descripcion' => 'Pago del 20% por cuotas de miembro (Divisas)',
                    'beneficiario' => 'Club UGAVI',
                    'debe' => 0,
                    'haber' => $montoReal,
                ]);
            }
            
            // Insertar pago a Club UGAVI en banco (BS)
            if ($request->monto_pagado_club_bs > 0 && !empty($request->banco_club_bs_id)) {
                $banco = \Illuminate\Support\Facades\DB::table('bancos')->where('id', $request->banco_club_bs_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                $montoReal = $banco->divisa === 'VES' ? $request->monto_pagado_club_bs : ($request->monto_pagado_club_bs / $request->tasa_cambio);
                
                \Illuminate\Support\Facades\DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $request->fecha ?? now()->toDateString(),
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia_club_bs ?? 'ENTREGA-C-BS-'.$entrega->id,
                    'descripcion' => 'Pago del 20% por cuotas de miembro (Bolívares)',
                    'beneficiario' => 'Club UGAVI',
                    'debe' => 0,
                    'haber' => $montoReal,
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Entrega guardada con éxito', 'id' => $entrega->id], 200);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function downloadPdf($id)
    {
        $entrega = Entrega::findOrFail($id);
        $pdfService = new EntregaPdfService();
        $pdfContent = $pdfService->generarPdf($entrega);
        
        return response($pdfContent)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="entrega_'.$entrega->id.'.pdf"');
    }
}
