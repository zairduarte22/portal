<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductoTasca;
use App\Models\ClienteTasca;
use App\Models\VentaTasca;
use App\Models\VentaTascaDetalle;
use App\Models\PagoTasca;
use App\Models\Miembro;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Persona;

class TascaController extends Controller
{
    // ==========================================
    // PRODUCTOS (Gestión Tasca)
    // ==========================================
    public function getProductos()
    {
        return response()->json(ProductoTasca::with('insumo.lotesActivos')->get());
    }

    public function storeProducto(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'codigo_barras' => 'nullable|string|unique:productos_tasca',
            'id_insumo' => 'nullable|exists:insumos_tasca,id',
            'medida_descuento' => 'nullable|numeric|min:0'
        ]);

        $producto = ProductoTasca::create($request->all());
        return response()->json($producto, 201);
    }

    public function updateProducto(Request $request, $id)
    {
        $producto = ProductoTasca::findOrFail($id);
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'codigo_barras' => 'nullable|string|unique:productos_tasca,codigo_barras,'.$id,
            'id_insumo' => 'nullable|exists:insumos_tasca,id',
            'medida_descuento' => 'nullable|numeric|min:0'
        ]);

        $producto->update($request->all());
        return response()->json($producto);
    }

    public function destroyProducto($id)
    {
        $producto = ProductoTasca::findOrFail($id);
        
        if ($producto->detalles()->count() > 0) {
            return response()->json(['error' => 'No se puede eliminar porque este producto está en una o más ventas.'], 400);
        }

        $producto->delete();
        return response()->json(['message' => 'Producto eliminado']);
    }

    // ==========================================
    // CLIENTES FORÁNEOS
    // ==========================================
    public function getClientes()
    {
        return response()->json(ClienteTasca::all());
    }

    public function storeCliente(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'cedula' => 'nullable|string',
            'telefono' => 'nullable|string'
        ]);

        $cliente = ClienteTasca::create($request->all());
        return response()->json($cliente, 201);
    }

    public function getDirectores()
    {
        $directores = Persona::join('vinculacion', 'personas.id', '=', 'vinculacion.id_persona')
            ->where(function($q) {
                $q->where('vinculacion.director', true)
                  ->orWhere('vinculacion.presidente', true);
            })
            ->select('personas.*')
            ->distinct()
            ->orderBy('personas.nombre')
            ->get();
        
        return response()->json($directores);
    }

    // ==========================================
    // VENTAS TASCA
    // ==========================================
    public function getVentas(Request $request)
    {
        $query = VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos', 'autorizador'])
                            ->orderBy('id', 'desc');
                            
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('fecha', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->get());
    }

    public function getVenta($id)
    {
        $venta = VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos', 'autorizador'])->findOrFail($id);
        $tasa = \DB::table('tasas')->orderBy('fecha', 'desc')->first();
        $venta->tasa_bcv = $venta->tasa_bcv ?: ($tasa ? (float) $tasa->monto : 36.5);
        return response()->json($venta);
    }

    public function storeVenta(Request $request)
    {
        // Se puede iniciar una venta asociándola a un Miembro o a un Cliente Foráneo
        $request->validate([
            'id_cliente_miembro' => 'nullable|exists:miembros,id',
            'id_cliente_tasca' => 'nullable|exists:clientes_tasca,id',
        ]);

        if (!$request->id_cliente_miembro && !$request->id_cliente_tasca) {
            return response()->json(['error' => 'Debe seleccionar un cliente o miembro para la venta.'], 400);
        }

        $tasa = \DB::table('tasas')->orderBy('fecha', 'desc')->first();
        $tasaActual = $tasa ? (float) $tasa->monto : 36.5;

        $venta = VentaTasca::create([
            'id_cliente_miembro' => $request->id_cliente_miembro,
            'id_cliente_tasca' => $request->id_cliente_tasca,
            'total' => 0,
            'descuento' => 0,
            'estado' => 'Pendiente',
            'fecha' => Carbon::now()->toDateString(),
            'tasa_bcv' => $tasaActual
        ]);

        return response()->json($venta, 201);
    }

    public function updateVentaDetalles(Request $request, $id)
    {
        $venta = VentaTasca::findOrFail($id);
        
        $request->validate([
            'detalles' => 'required|array',
            'detalles.*.id_producto' => 'required|exists:productos_tasca,id',
            'detalles.*.cantidad' => 'required|integer|min:1',
        ]);

        DB::beginTransaction();
        try {
            // Eliminar detalles anteriores y reponer stock
            foreach ($venta->detalles as $detalle) {
                $prod = ProductoTasca::find($detalle->id_producto);
                if ($prod && $prod->insumo) {
                    $mlAReponer = $detalle->cantidad * ($prod->medida_descuento > 0 ? $prod->medida_descuento : 1);
                    $lote = $prod->insumo->lotes()->orderBy('created_at', 'desc')->first();
                    if ($lote) {
                        $lote->stock_actual += $mlAReponer;
                        if ($lote->estado === 'Agotado' && $lote->stock_actual > 0) {
                            $lote->estado = 'Activo';
                        }
                        $lote->save();
                    }
                }
            }
            VentaTascaDetalle::where('id_venta', $id)->delete();

            $total = 0;
            $descuento = 0;
            $esUgavi = $venta->clienteForaneo && strtolower(trim($venta->clienteForaneo->nombre)) === 'ugavi';
            
            foreach ($request->detalles as $det) {
                $producto = ProductoTasca::findOrFail($det['id_producto']);
                
                if ($producto->stock < $det['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto: {$producto->nombre}");
                }

                $precioReal = $esUgavi ? $producto->costo_calculado : $producto->precio;
                $subtotal = $precioReal * $det['cantidad'];
                $total += $subtotal;

                VentaTascaDetalle::create([
                    'id_venta' => $id,
                    'id_producto' => $producto->id,
                    'cantidad' => $det['cantidad'],
                    'precio_unitario' => $precioReal,
                    'subtotal' => $subtotal
                ]);

                // Descontar stock de los lotes (FIFO)
                $insumo = $producto->insumo;
                if ($insumo) {
                    $mlADescontar = $det['cantidad'] * ($producto->medida_descuento > 0 ? $producto->medida_descuento : 1);
                    $lotes = $insumo->lotesActivos;
                    
                    foreach ($lotes as $lote) {
                        if ($mlADescontar <= 0) break;

                        if ($lote->stock_actual >= $mlADescontar) {
                            $lote->stock_actual -= $mlADescontar;
                            $lote->save();
                            $mlADescontar = 0;
                        } else {
                            $mlADescontar -= $lote->stock_actual;
                            $lote->stock_actual = 0;
                            $lote->estado = 'Agotado';
                            $lote->save();
                        }
                    }

                    if ($mlADescontar > 0) {
                        // Opcional: Permitir stock negativo en el último lote o tirar error. Ya validamos el stock virtual arriba.
                    }
                }
            } // END foreach $request->detalles

            $descuento = 0; // Descuento removido a petición

            $venta->total = $total;
            $venta->descuento = $descuento;
            $venta->save();

            DB::commit();
            return response()->json(VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos', 'autorizador'])->find($id));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagarVenta(Request $request, $id)
    {
        $venta = VentaTasca::with('pagos')->findOrFail($id);
        
        if ($venta->estado === 'Pagada' || $venta->estado === 'Anulada') {
            return response()->json(['error' => 'La venta ya está pagada o anulada.'], 400);
        }

        $request->validate([
            'pagos' => 'nullable|array',
            'pagos.*.metodo_pago' => 'required|string',
            'pagos.*.monto_usd' => 'required|numeric|min:0',
            'pagos.*.tasa' => 'required|numeric|min:1',
            'pagos.*.monto_bs' => 'nullable|numeric|min:0',
            'pagos.*.referencia' => 'nullable|string',
            'id_autorizador' => 'nullable|exists:personas,id'
        ]);

        $pagosEnviados = $request->pagos ?? [];

        // Calculate total previously paid (if any)
        $pagadoAnteriormente = $venta->pagos->sum('pivot.monto_abonado_usd');
        
        $montoAbonarAhora = 0;
        foreach ($pagosEnviados as $pago) {
            $montoAbonarAhora += $pago['monto_usd'];
        }

        $totalPagado = $pagadoAnteriormente + $montoAbonarAhora;
        $totalVenta = $venta->total - $venta->descuento;

        DB::beginTransaction();
        try {
            foreach ($pagosEnviados as $pagoData) {
                // If it's the "Crédito" legacy method (just in case), ignore it as a real payment
                if ($pagoData['metodo_pago'] === 'Crédito') {
                    continue;
                }

                $nuevoPago = PagoTasca::create([
                    'monto_usd' => $pagoData['monto_usd'],
                    'tasa' => $pagoData['tasa'],
                    'monto_bs' => $pagoData['monto_bs'] ?? 0,
                    'metodo_pago' => $pagoData['metodo_pago'],
                    'referencia' => $pagoData['referencia'] ?? null,
                    'fecha_pago' => Carbon::now()->toDateString(),
                    'anotacion' => $pagoData['anotacion'] ?? null
                ]);

                // Attach to pivot
                $venta->pagos()->attach($nuevoPago->id, ['monto_abonado_usd' => $pagoData['monto_usd']]);
            }

            // Determine new state
            if ($totalPagado >= $totalVenta - 0.01) { // -0.01 for floating point rounding
                $venta->estado = 'Pagada';
            } else if ($totalPagado > 0) {
                $venta->estado = 'Parcial';
            } else {
                // Si no se pagó nada, es un Crédito total
                $venta->estado = 'Credito';
            }
            
            // Verificación unificada para crédito o saldo parcial (crédito)
            if (($venta->estado === 'Parcial' || $venta->estado === 'Credito') && $totalPagado < $totalVenta) {
                if ($request->id_autorizador) {
                    $venta->id_autorizador = $request->id_autorizador;
                } else {
                    if (!$venta->id_cliente_miembro) {
                        throw new \Exception("Se requiere autorización de un director para créditos a clientes foráneos.");
                    }
                    $miembro = Miembro::find($venta->id_cliente_miembro);
                    if ($miembro->solvencia !== 'Solvente') {
                        throw new \Exception("Se requiere autorización de un director para créditos a miembros insolventes.");
                    }
                }
            }

            $venta->save();

            DB::commit();
            return response()->json(VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos', 'autorizador'])->find($id));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getEstadisticas(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        // 1. Ventas del Periodo (Total USD de ventas cobradas o hechas en el periodo)
        $ventasHoy = VentaTasca::whereBetween('fecha', [$startDate, $endDate])
            ->whereNotIn('estado', ['Anulada', 'anulada'])
            ->get();
        $totalVentasHoy = $ventasHoy->sum(function($v) { return $v->total - $v->descuento; });

        // 2. Desglose de métodos de pago (Pagos hechos en el periodo)
        $pagosHoy = DB::table('pago_venta_tasca')
            ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
            ->whereBetween('pagos_tasca.fecha_pago', [$startDate, $endDate])
            ->select('pagos_tasca.metodo_pago', DB::raw('SUM(pago_venta_tasca.monto_abonado_usd) as total'))
            ->groupBy('pagos_tasca.metodo_pago')
            ->get();

        $desglose = $pagosHoy->pluck('total', 'metodo_pago')->toArray();

        // 3. Cuánto es a crédito (Ventas hechas en el periodo que están en estado Credito o Parcial)
        $creditoHoy = 0;
        foreach ($ventasHoy as $v) {
            if ($v->estado === 'Credito' || $v->estado === 'Parcial') {
                $creditoHoy += $v->pendiente;
            }
        }

        return response()->json([
            'ventas_dia_usd' => $totalVentasHoy,
            'desglose_pagos' => $desglose,
            'credito_otorgado_hoy' => $creditoHoy
        ]);
    }

    public function reporteVentasData(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());
        
        $pagos = DB::table('pago_venta_tasca')
            ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
            ->join('ventas_tasca', 'pago_venta_tasca.id_venta', '=', 'ventas_tasca.id')
            ->whereBetween('pagos_tasca.fecha_pago', [$startDate, $endDate])
            ->select(
                'pagos_tasca.metodo_pago',
                'pago_venta_tasca.monto_abonado_usd',
                'pagos_tasca.monto_bs',
                'ventas_tasca.fecha as fecha_venta',
                'pagos_tasca.fecha_pago'
            )
            ->get();

        $ingresosVentasNuevas = [];
        $ingresosAbonos = [];
        $totalVentasNuevasUsd = 0;
        $totalVentasNuevasBs = 0;
        $totalAbonosUsd = 0;
        $totalAbonosBs = 0;
        $totalPuroDivisas = 0;

        foreach ($pagos as $pago) {
            $montoUsd = (float) $pago->monto_abonado_usd;
            $montoBs = (float) $pago->monto_bs;
            $metodo = $pago->metodo_pago;

            $isBsMethod = str_contains(strtolower($metodo), 'transferencia') || 
                          str_contains(strtolower($metodo), 'pago móvil') || 
                          str_contains(strtolower($metodo), 'pos') || 
                          str_contains(strtolower($metodo), 'punto de venta') ||
                          str_contains(strtolower($metodo), 'ves') ||
                          str_contains(strtolower($metodo), 'bs');
                          
            if (!$isBsMethod) {
                $totalPuroDivisas += $montoUsd;
            }

            if ($pago->fecha_venta >= $startDate && $pago->fecha_venta <= $endDate) {
                if (!isset($ingresosVentasNuevas[$metodo])) $ingresosVentasNuevas[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosVentasNuevas[$metodo]['usd'] += $montoUsd;
                $ingresosVentasNuevas[$metodo]['bs'] += $montoBs;
                $totalVentasNuevasUsd += $montoUsd;
                $totalVentasNuevasBs += $montoBs;
            } else {
                if (!isset($ingresosAbonos[$metodo])) $ingresosAbonos[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosAbonos[$metodo]['usd'] += $montoUsd;
                $ingresosAbonos[$metodo]['bs'] += $montoBs;
                $totalAbonosUsd += $montoUsd;
                $totalAbonosBs += $montoBs;
            }
        }

        $ventasPeriodo = VentaTasca::with(['miembro', 'clienteForaneo'])
            ->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();
            
        $totalFacturado = $ventasPeriodo->sum(function($v) { return $v->total - $v->descuento; });
        $totalPendiente = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->sum('pendiente');
        $totalContado = $totalFacturado - $totalPendiente;

        $ventasCredito = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->filter(function($v) {
            return $v->pendiente > 0;
        })->values();
        
        $totalCreditoOtorgado = $ventasCredito->sum('pendiente');

        return response()->json([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'ingresosVentasNuevas' => $ingresosVentasNuevas,
            'ingresosAbonos' => $ingresosAbonos,
            'totalVentasNuevasUsd' => $totalVentasNuevasUsd,
            'totalVentasNuevasBs' => $totalVentasNuevasBs,
            'totalAbonosUsd' => $totalAbonosUsd,
            'totalAbonosBs' => $totalAbonosBs,
            'totalPuroDivisas' => $totalPuroDivisas,
            'totalFacturado' => $totalFacturado,
            'totalPendiente' => $totalPendiente,
            'totalContado' => $totalContado,
            'ventasCredito' => $ventasCredito,
            'totalCreditoOtorgado' => $totalCreditoOtorgado
        ]);
    }

    public function reporteVentasPdf(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());
        $formato = $request->query('format', 'carta'); // 'carta' o 'ticket'
        
        // Pagos realizados en el rango de fechas
        $pagos = DB::table('pago_venta_tasca')
            ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
            ->join('ventas_tasca', 'pago_venta_tasca.id_venta', '=', 'ventas_tasca.id')
            ->whereBetween('pagos_tasca.fecha_pago', [$startDate, $endDate])
            ->select(
                'pagos_tasca.metodo_pago',
                'pago_venta_tasca.monto_abonado_usd',
                'pagos_tasca.monto_bs',
                'ventas_tasca.fecha as fecha_venta',
                'pagos_tasca.fecha_pago'
            )
            ->get();

        $ingresosVentasNuevas = [];
        $ingresosAbonos = [];
        $totalVentasNuevasUsd = 0;
        $totalVentasNuevasBs = 0;
        $totalAbonosUsd = 0;
        $totalAbonosBs = 0;
        $totalPuroDivisas = 0;

        foreach ($pagos as $pago) {
            $montoUsd = (float) $pago->monto_abonado_usd;
            $montoBs = (float) $pago->monto_bs;
            $metodo = $pago->metodo_pago;

            $isBsMethod = str_contains(strtolower($metodo), 'transferencia') || 
                          str_contains(strtolower($metodo), 'pago móvil') || 
                          str_contains(strtolower($metodo), 'pos') || 
                          str_contains(strtolower($metodo), 'punto de venta') ||
                          str_contains(strtolower($metodo), 'ves') ||
                          str_contains(strtolower($metodo), 'bs');
                          
            if (!$isBsMethod) {
                $totalPuroDivisas += $montoUsd;
            }

            // Es venta nueva si la fecha de la venta está dentro del rango consultado
            // Y el pago también. Como filtramos pagos en este rango, verificaremos si la venta fue antes del startDate
            if ($pago->fecha_venta >= $startDate && $pago->fecha_venta <= $endDate) {
                if (!isset($ingresosVentasNuevas[$metodo])) $ingresosVentasNuevas[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosVentasNuevas[$metodo]['usd'] += $montoUsd;
                $ingresosVentasNuevas[$metodo]['bs'] += $montoBs;
                $totalVentasNuevasUsd += $montoUsd;
                $totalVentasNuevasBs += $montoBs;
            } else {
                // Abono a una deuda anterior al rango
                if (!isset($ingresosAbonos[$metodo])) $ingresosAbonos[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosAbonos[$metodo]['usd'] += $montoUsd;
                $ingresosAbonos[$metodo]['bs'] += $montoBs;
                $totalAbonosUsd += $montoUsd;
                $totalAbonosBs += $montoBs;
            }
        }

        // 2. Facturación del Periodo (Excluyendo Anuladas y Pendientes sin finalizar)
        $ventasPeriodo = VentaTasca::with('miembro')
            ->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();
            
        $totalFacturado = $ventasPeriodo->sum(function($v) { return $v->total - $v->descuento; });
        // Asegurar que el pendiente y crédito sumen lo mismo
        $totalPendiente = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->sum('pendiente');
        $totalContado = $totalFacturado - $totalPendiente;

        // Facturas a crédito para listado
        $ventasCredito = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->filter(function($v) {
            return $v->pendiente > 0;
        });
        $totalCreditoOtorgado = 0;

        if ($formato === 'ticket') {
            // Un ticket típicamente es de 80mm de ancho. Le daremos una altura grande y el sistema lo recorta
            $pdf = new \TCPDF('P', 'mm', array(80, 297));
            $pdf->SetMargins(2, 2, 2);
        } else {
            $pdf = new \TCPDF('P', 'mm', 'LETTER');
            $pdf->SetMargins(15, 15, 15);
        }
        
        $pdf->SetCreator('Fondo2');
        $pdf->SetAuthor('Tasca');
        $pdf->SetTitle('Reporte de Ventas');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        // Estilos
        $fontSizeTitle = $formato === 'ticket' ? '12px' : '18px';
        $fontSizeSub = $formato === 'ticket' ? '10px' : '13px';
        $fontSizeText = $formato === 'ticket' ? '8px' : '11px';
        $fontFamily = $formato === 'ticket' ? 'Helvetica, Arial, sans-serif' : 'Helvetica, Arial, sans-serif';
        $tableStyle = $formato === 'ticket' ? "width: 100%; border-collapse: collapse; font-size: 8px; font-family: {$fontFamily};" : "width: 100%; border-collapse: collapse; font-size: 11px; font-family: {$fontFamily}; color: #334155;";
        $thStyle = $formato === 'ticket' ? 'border-bottom: 1px dashed #333; font-weight:bold; padding: 4px 0;' : 'background-color:#f8fafc; border-bottom: 2px solid #cbd5e1; font-weight:bold; padding: 8px; color: #0f172a;';
        $tdStyle = $formato === 'ticket' ? 'padding: 3px 0;' : 'border-bottom: 1px solid #e2e8f0; padding: 7px; color: #334155;';

        $rangoTexto = $startDate === $endDate ? $startDate : "{$startDate} al {$endDate}";

        if ($formato === 'ticket') {
            $html = "
                <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'>
                    <strong style='font-size: 10px;'>Unión de Ganaderos del Municipio<br>Rosario de Perijá - TASCA</strong><br>
                    <span style='font-size: 8px;'>RIF: J-07002231-0</span><br>
                    <span style='font-size: 8px;'>Tlf: 02634511191</span><br>
                    <span style='font-size: 7px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span><br>
                </div>
                <table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table>
                <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'><br>
                    <strong style='font-size: 11px;'>REPORTE DE CIERRE DE CAJA</strong><br>
                    <span style='font-size: 8px;'>Fechas: {$rangoTexto}</span><br>
                </div>
                <br><table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table><br>
            ";
            $separador = "<br><table width=\"100%\"><tr><td style=\"border-top: 1px dashed #333;\"></td></tr></table><br>";
        } else {
            $html = "
                <table width=\"100%\" cellpadding=\"8\" style=\"background-color:#0f172a; color:#ffffff; font-family: {$fontFamily};\">
                    <tr>
                        <td width=\"55%\">
                            <strong style='font-size: 15px; letter-spacing: 1px; color:#e2e8f0;'>UNIÓN DE GANADEROS DEL MUNICIPIO ROSARIO DE PERIJÁ</strong><br>
                            <span style='font-size: 11px; color: #94a3b8;'>RIF: J-07002231-0 | Tlf: 02634511191</span><br>
                            <span style='font-size: 10px; color: #64748b;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span>
                        </td>
                        <td width=\"45%\" style=\"text-align: right;\">
                            <strong style='font-size: 24px; color: #38bdf8; letter-spacing: 2px;'>REPORTE DE CIERRE</strong><br>
                            <span style='font-size: 12px; color: #e2e8f0;'>Fechas: <strong>{$rangoTexto}</strong></span><br>
                            <span style='font-size: 10px; color: #94a3b8;'>Generado: " . date('d/m/Y h:i A') . "</span>
                        </td>
                    </tr>
                </table>
                <br><br>
            ";
            $separador = "<br><table width=\"100%\"><tr><td style=\"border-bottom: 2px solid #e2e8f0;\"></td></tr></table><br><br>";
        }

        // --- SECCIÓN 1: RESUMEN DE FACTURACIÓN ---
        $html .= "
            <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; margin-bottom: 5px; text-align:center; color:#1e40af;'>RESUMEN DE FACTURACIÓN</h3>
            <table style='{$tableStyle}'>
                <tr>
                    <td style='{$tdStyle} text-align:left;'>Ventas al Contado (Pagado)</td>
                    <td style='{$tdStyle} text-align:right;'>$" . number_format($totalContado, 2) . "</td>
                </tr>
                <tr>
                    <td style='{$tdStyle} text-align:left;'>Ventas a Crédito (Pendiente)</td>
                    <td style='{$tdStyle} text-align:right;'>$" . number_format($totalPendiente, 2) . "</td>
                </tr>
        ";

        if ($formato === 'ticket') {
            $html .= "
                <tr style='font-weight:bold;'>
                    <td style='padding:4px; border-top:1px dashed #333;'>TOTAL FACTURADO</td>
                    <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalFacturado, 2) . "</td>
                </tr>
            </table>
            ";
        } else {
            $html .= "
                <tr style='background-color:#f1f5f9; color: #0f172a;'>
                    <td style='padding:8px; border-bottom: 2px solid #94a3b8;'><strong>TOTAL FACTURADO (Ventas Reales)</strong></td>
                    <td style='padding:8px; border-bottom: 2px solid #94a3b8; text-align:right;'><strong>$" . number_format($totalFacturado, 2) . "</strong></td>
                </tr>
            </table>
            ";
        }

        $html .= $separador;

        // --- SECCIÓN 2: INGRESOS RECIBIDOS (DINERO EN CAJA) ---
        $html .= "
            <table width=\"100%\">
                <tr>
                    <td style='background-color:#10b981; color:#ffffff; padding: 6px 10px;'>
                        <strong style='font-size:12px; font-family: {$fontFamily};'>DETALLE DE INGRESOS (DINERO RECIBIDO)</strong>
                    </td>
                </tr>
            </table>
            <br>
            <table style='{$tableStyle}'>
                <tr>
                    <th width=\"50%\" style='{$thStyle} text-align:left;'>MÉTODO DE PAGO (VENTAS NUEVAS)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>TOTAL (USD)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>EXACTO (Bs)</th>
                </tr>
        ";

        if (empty($ingresosVentasNuevas)) {
            $html .= "<tr><td colspan='3' style='text-align:center; {$tdStyle}'>No hay ingresos.</td></tr>";
        } else {
            foreach ($ingresosVentasNuevas as $metodo => $totales) {
                $bsStr = $totales['bs'] > 0 ? "Bs " . number_format($totales['bs'], 2) : "-";
                $html .= "<tr><td style='{$tdStyle}'>{$metodo}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($totales['usd'], 2) . "</td><td style='{$tdStyle} text-align:right;'>{$bsStr}</td></tr>";
            }
        }
        
        if ($formato === 'ticket') {
            $html .= "
                    <tr style='font-weight:bold;'>
                        <td style='padding:4px; border-top:1px dashed #333;'>SUBTOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalVentasNuevasUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalVentasNuevasBs, 2) . "</td>
                    </tr>
                </table>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#ecfdf5; color: #064e3b;'>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7;'><strong>SUBTOTAL INGRESOS NUEVOS</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7; text-align:right;'><strong>$" . number_format($totalVentasNuevasUsd, 2) . "</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7; text-align:right;'><strong>Bs " . number_format($totalVentasNuevasBs, 2) . "</strong></td>
                    </tr>
                </table>
            ";
        }

        $html .= "
            <br>
            <table style='{$tableStyle}'>
                <tr>
                    <th width=\"50%\" style='{$thStyle} text-align:left;'>MÉTODO DE PAGO (ABONOS A DEUDAS)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>TOTAL (USD)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>EXACTO (Bs)</th>
                </tr>
        ";

        if (empty($ingresosAbonos)) {
            $html .= "<tr><td colspan='3' style='text-align:center; {$tdStyle}'>No hay abonos.</td></tr>";
        } else {
            foreach ($ingresosAbonos as $metodo => $totales) {
                $bsStr = $totales['bs'] > 0 ? "Bs " . number_format($totales['bs'], 2) : "-";
                $html .= "<tr><td style='{$tdStyle}'>{$metodo}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($totales['usd'], 2) . "</td><td style='{$tdStyle} text-align:right;'>{$bsStr}</td></tr>";
            }
        }

        if ($formato === 'ticket') {
            $html .= "
                    <tr style='font-weight:bold;'>
                        <td style='padding:4px; border-top:1px dashed #333;'>SUBTOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalAbonosUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalAbonosBs, 2) . "</td>
                    </tr>
                </table>

                <br><table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table><br>
                <table style='{$tableStyle} margin-top: 5px;'>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>RECIBIDO (DIVISAS):</td>
                        <td style='text-align:right; padding-bottom:2px;'>$" . number_format($totalPuroDivisas, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>RECIBIDO (BS):</td>
                        <td style='text-align:right; padding-bottom:2px;'>Bs " . number_format($totalVentasNuevasBs + $totalAbonosBs, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>TOTAL INGRESADO:</td>
                        <td style='text-align:right; padding-bottom:2px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                    </tr>
                </table>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#fffbeb; color: #78350f;'>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d;'><strong>SUBTOTAL ABONOS</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d; text-align:right;'><strong>$" . number_format($totalAbonosUsd, 2) . "</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d; text-align:right;'><strong>Bs " . number_format($totalAbonosBs, 2) . "</strong></td>
                    </tr>
                </table>

                <br><br>
                <table width=\"100%\" cellpadding=\"8\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td width=\"100%\" style=\"background-color:#f8fafc; border: 1px solid #cbd5e1; border-top: 4px solid #10b981;\">
                            <table width=\"100%\">
                                <tr>
                                    <td style='font-size:13px; color:#475569; padding-bottom: 4px;'>TOTAL RECIBIDO (DIVISAS):</td>
                                    <td style='font-size:14px; color:#0f172a; font-weight:bold; text-align:right; padding-bottom: 4px;'>$" . number_format($totalPuroDivisas, 2) . "</td>
                                </tr>
                                <tr>
                                    <td style='font-size:13px; color:#475569; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;'>TOTAL RECIBIDO (Bs):</td>
                                    <td style='font-size:14px; color:#0f172a; font-weight:bold; text-align:right; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;'>Bs " . number_format($totalVentasNuevasBs + $totalAbonosBs, 2) . "</td>
                                </tr>
                                <tr>
                                    <td style='font-size:15px; color:#047857; font-weight:bold; padding-top: 8px;'>TOTAL GENERAL INGRESADO (USD):</td>
                                    <td style='font-size:18px; color:#047857; font-weight:bold; text-align:right; padding-top: 8px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <br>
            ";
        }

        // --- SECCIÓN 3: CUENTAS POR COBRAR (CRÉDITOS OTORGADOS) ---
        if ($ventasCredito->count() > 0) {
            $html .= $separador;
            $html .= "
                <table width=\"100%\">
                    <tr>
                        <td style='background-color:#f59e0b; color:#ffffff; padding: 6px 10px;'>
                            <strong style='font-size:12px; font-family: {$fontFamily};'>CUENTAS POR COBRAR (CRÉDITOS OTORGADOS)</strong>
                        </td>
                    </tr>
                </table>
                <br>
                <table style='{$tableStyle}'>
                    <tr>
                        <th width=\"60%\" style='{$thStyle} text-align:left;'>CLIENTE / COMPROBANTE</th>
                        <th width=\"40%\" style='{$thStyle} text-align:right;'>PENDIENTE (USD)</th>
                    </tr>
            ";
            foreach ($ventasCredito as $vc) {
                if ($vc->pendiente > 0) {
                    $totalCreditoOtorgado += $vc->pendiente;
                    $nombreCliente = $vc->miembro ? $vc->miembro->razon_social : "Factura #".$vc->id;
                    $html .= "<tr><td style='{$tdStyle}'>{$nombreCliente}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($vc->pendiente, 2) . "</td></tr>";
                }
            }
            if ($formato === 'ticket') {
                $html .= "
                        <tr style='font-weight:bold;'>
                            <td style='padding:4px; border-top:1px dashed #333;'>TOTAL A CRÉDITO</td>
                            <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalCreditoOtorgado, 2) . "</td>
                        </tr>
                    </table>
                ";
            } else {
                $html .= "
                        <tr style='background-color:#f8fafc; color: #0f172a;'>
                            <td style='padding:8px; border-top: 2px solid #cbd5e1;'><strong>TOTAL A CRÉDITO</strong></td>
                            <td style='padding:8px; border-top: 2px solid #cbd5e1; text-align:right;'><strong>$" . number_format($totalCreditoOtorgado, 2) . "</strong></td>
                        </tr>
                    </table>
                ";
            }
        }

        $html .= "</div>";

        $pdf->writeHTML($html, true, false, true, false, '');

        $nombreUsuario = auth()->user() ? auth()->user()->name : 'Admin';

        if ($formato === 'carta') {
            $pdf->SetAutoPageBreak(false);
            $pdf->SetY(-35);
            $footerHtml = "
                <table width=\"100%\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td style=\"text-align:center; color:#94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;\">
                            *** FIN DEL REPORTE ***<br>
                            <strong style='color:#64748b; font-size: 11px;'>SIGAMA</strong><br>
                            Sistema de Gestión Administrativa y Membresías de Agroproductores - {$nombreUsuario}
                        </td>
                    </tr>
                </table>
            ";
            $pdf->writeHTML($footerHtml, true, false, true, false, '');
            $pdf->SetAutoPageBreak(true, 15);
        } else {
            $footerHtml = "
                <br>
                <table width=\"100%\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td style=\"text-align:center; color:#94a3b8; font-size: 9px;\">
                            *** FIN DEL REPORTE ***<br>
                            <strong>SIGAMA</strong><br>
                            Sistema de Gestión Administrativa<br>
                            Generado por: {$nombreUsuario}
                        </td>
                    </tr>
                </table>
            ";
            $pdf->writeHTML($footerHtml, true, false, true, false, '');
        }

        $pdf->Output('Reporte_Ventas_'.$rangoTexto.'.pdf', 'I');
    }

    public function getCreditosMiembro($id)
    {
        $ventas = VentaTasca::with(['detalles.producto', 'pagos'])
            ->where('id_cliente_miembro', $id)
            ->whereIn('estado', ['Credito', 'Parcial'])
            ->orderBy('fecha', 'desc')
            ->get();
            
        // We only want to return those that actually have a pending balance > 0
        $ventas = $ventas->filter(function($v) {
            return $v->pendiente > 0;
        })->values();

        return response()->json($ventas);
    }

    public function anularVenta($id)
    {
        $venta = VentaTasca::with('detalles')->findOrFail($id);
        
        if ($venta->estado === 'Anulada') {
            return response()->json(['error' => 'La venta ya está anulada.'], 400);
        }

        DB::beginTransaction();
        try {
            // Reponer stock
            foreach ($venta->detalles as $detalle) {
                $prod = ProductoTasca::with('insumo.lotes')->find($detalle->id_producto);
                if ($prod && $prod->insumo) {
                    $mlAReponer = $detalle->cantidad * ($prod->medida_descuento > 0 ? $prod->medida_descuento : 1);
                    // Reponer en el lote más reciente (o el último creado)
                    $ultimoLote = $prod->insumo->lotes()->orderBy('created_at', 'desc')->first();
                    if ($ultimoLote) {
                        $ultimoLote->stock_actual += $mlAReponer;
                        if ($ultimoLote->estado === 'Agotado' && $ultimoLote->stock_actual > 0) {
                            $ultimoLote->estado = 'Activo';
                        }
                        $ultimoLote->save();
                    }
                }
            }

            // Eliminar pagos asociados para limpiar finanzas si aplica
            DB::table('pago_venta_tasca')->where('id_venta', $id)->delete();

            $venta->estado = 'Anulada';
            $venta->save();

            DB::commit();
            return response()->json(['message' => 'Venta anulada correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function ticketVentaPdf($id)
    {
        $venta = VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos'])->findOrFail($id);
        
        // Calcular altura dinámica
        $baseHeight = 110;
        $itemsHeight = count($venta->detalles) * 6;
        $pagosHeight = $venta->pagos->count() * 5;
        $signatureHeight = in_array(strtolower($venta->estado), ['credito', 'parcial']) ? 30 : 0;
        
        $totalHeight = $baseHeight + $itemsHeight + $pagosHeight + $signatureHeight;

        $pdf = new \TCPDF('P', 'mm', array(80, $totalHeight));
        $pdf->SetMargins(4, 6, 4);
        $pdf->SetCreator('Fondo2');
        $pdf->SetAuthor('Tasca');
        $pdf->SetTitle('Ticket de Venta #' . $venta->id);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();
        
        $fontFamily = 'Helvetica, Arial, sans-serif';
        $fecha = \Carbon\Carbon::parse($venta->created_at)->format('d/m/Y');
        $cliente = $venta->miembro ? $venta->miembro->razon_social : ($venta->clienteForaneo ? $venta->clienteForaneo->nombre : 'Consumidor Final');
        $rif = $venta->miembro ? $venta->miembro->rif : ($venta->clienteForaneo ? $venta->clienteForaneo->cedula_rif : '');
        $metodoPrincipal = $venta->pagos->count() > 0 ? $venta->pagos->first()->metodo_pago : 'N/A';

        // Usamos líneas punteadas con caracteres porque TCPDF las renderiza de manera muy confiable para formato ticket
        $dashes = "<div style='text-align:center; font-family: {$fontFamily}; font-size: 11px; letter-spacing: 2px; color: #333;'>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>";

        $html = "
            <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'>
                <strong style='font-size: 10px;'>Unión de Ganaderos del Municipio<br>Rosario de Perijá - TASCA</strong><br>
                <span style='font-size: 8px;'>RIF: J-07002231-0</span><br>
                <span style='font-size: 8px;'>Tlf: 02634511191</span><br>
                <span style='font-size: 7px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span>
            </div>
            
            {$dashes}
            
            <div style='text-align:center; font-family: {$fontFamily};'>
                <strong style='font-size: 11px;'>TICKET DE VENTA TASCA</strong>
            </div>
            
            <table style='width: 100%; font-size: 8px; font-family: {$fontFamily}; margin-top: 5px;'>
                <tr>
                    <td style='text-align:left; width: 50%;'>Ref: {$venta->id}</td>
                    <td style='text-align:right; width: 50%;'>Fecha: {$fecha}</td>
                </tr>
                <tr>
                    <td style='text-align:left;'>Estado: " . ucfirst(strtolower($venta->estado)) . "</td>
                    <td style='text-align:right;'>Caja: Tasca</td>
                </tr>
            </table>

            {$dashes}
            
            <div style='font-family: {$fontFamily}; font-size: 8px; line-height: 1.3;'>
                <strong>CLIENTE:</strong><br>
                {$cliente}
                " . ($rif ? "<br>RIF: {$rif}" : "") . "<br>
                Método: {$metodoPrincipal}
            </div>

            {$dashes}
            
            <table style='width: 100%; border-collapse: collapse; font-size: 8px; font-family: {$fontFamily};'>
                <tr>
                    <th style='text-align:left; font-weight:bold; padding-bottom: 4px; width: 65%;'>DESCRIPCIÓN</th>
                    <th style='text-align:center; font-weight:bold; padding-bottom: 4px; width: 15%;'>CANT.</th>
                    <th style='text-align:right; font-weight:bold; padding-bottom: 4px; width: 20%;'>MONTO</th>
                </tr>
        ";

        foreach ($venta->detalles as $det) {
            $nombre = $det->producto->nombre_completo ?? $det->producto->nombre;
            $html .= "
                <tr>
                    <td style='padding: 2px 0;'>{$nombre}</td>
                    <td style='padding: 2px 0; text-align:center;'>{$det->cantidad}</td>
                    <td style='padding: 2px 0; text-align:right;'>$" . number_format($det->subtotal, 2) . "</td>
                </tr>
            ";
        }

        $html .= "
            </table>
            
            {$dashes}
            
            <table style='width: 100%; border-collapse: collapse; font-size: 9px; font-family: {$fontFamily};'>
                <tr>
                    <td style='font-weight:bold; padding-top: 2px;'>TOTAL PAGADO (USD):</td>
                    <td style='text-align:right; font-weight:bold; padding-top: 2px;'>$" . number_format($venta->total, 2) . "</td>
                </tr>
        ";
        
        $totalBs = 0;
        foreach ($venta->pagos as $pago) {
            $totalBs += $pago->monto_bs;
        }

        if ($totalBs > 0) {
            $html .= "
                <tr>
                    <td style='font-weight:bold; padding-top: 4px;'>TOTAL PAGADO (Bs):</td>
                    <td style='text-align:right; font-weight:bold; padding-top: 4px;'>Bs. " . number_format($totalBs, 2) . "</td>
                </tr>
            ";
        }

        $html .= "</table>";

        $html .= "
            <div style='text-align:center; font-family: {$fontFamily}; margin-top: 10px;'>
                <strong style='font-size: 9px;'>*** GRACIAS POR SU COMPRA ***</strong><br>
                <span style='font-size: 7px; color: #444; display:block; margin-top: 4px;'>Este documento es un comprobante de venta interno de la Tasca y carece de validez fiscal o tributaria.</span>
            </div>
        ";

        if (in_array(strtolower($venta->estado), ['credito', 'parcial'])) {
            $html .= "
                <br><br><br>
                <div style='text-align:center; font-family: {$fontFamily}; font-size: 8px;'>
                    - - - - - - - - - - - - - - - - - - - -<br>
                    Firma del Cliente<br>
                    <strong>Saldo pendiente: $" . number_format($venta->pendiente, 2) . "</strong>
                </div>
            ";
        }

        $pdf->writeHTML($html, true, false, true, false, '');
        return response($pdf->Output('ticket_venta_'.$venta->id.'.pdf', 'S'))
            ->header('Content-Type', 'application/pdf');
    }
}
