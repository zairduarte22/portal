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

class TascaController extends Controller
{
    // ==========================================
    // PRODUCTOS (Gestión Tasca)
    // ==========================================
    public function getProductos()
    {
        return response()->json(ProductoTasca::with('insumo')->get());
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

    // ==========================================
    // VENTAS TASCA
    // ==========================================
    public function getVentas()
    {
        $ventas = VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos'])
                            ->orderBy('id', 'desc')
                            ->take(100)
                            ->get();
        return response()->json($ventas);
    }

    public function getVenta($id)
    {
        $venta = VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos'])->findOrFail($id);
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

        $venta = VentaTasca::create([
            'id_cliente_miembro' => $request->id_cliente_miembro,
            'id_cliente_tasca' => $request->id_cliente_tasca,
            'total' => 0,
            'descuento' => 0,
            'estado' => 'Pendiente',
            'fecha' => Carbon::now()->toDateString()
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
            
            foreach ($request->detalles as $det) {
                $producto = ProductoTasca::findOrFail($det['id_producto']);
                
                if ($producto->stock < $det['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto: {$producto->nombre}");
                }

                $subtotal = $producto->precio * $det['cantidad'];
                $total += $subtotal;

                VentaTascaDetalle::create([
                    'id_venta' => $id,
                    'id_producto' => $producto->id,
                    'cantidad' => $det['cantidad'],
                    'precio_unitario' => $producto->precio,
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

            // Aplicar 5% de descuento si es miembro y está solvente
            if ($venta->id_cliente_miembro) {
                $miembro = Miembro::find($venta->id_cliente_miembro);
                if ($miembro && $miembro->solvencia === 'Solvente') {
                    $descuento = $total * 0.05;
                }
            }

            $venta->total = $total;
            $venta->descuento = $descuento;
            $venta->save();

            DB::commit();
            return response()->json(VentaTasca::with(['clienteForaneo', 'miembro', 'detalles.producto.insumo', 'pagos'])->find($id));
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
                if (!$venta->id_cliente_miembro) {
                    throw new \Exception("El crédito solo está disponible para miembros.");
                }
                $miembro = Miembro::find($venta->id_cliente_miembro);
                if ($miembro->solvencia !== 'Solvente') {
                    throw new \Exception("El crédito solo está disponible para miembros solventes.");
                }
                $venta->estado = 'Credito';
            }
            
            // Re-check for partial credit validity
            if (($venta->estado === 'Parcial' || $venta->estado === 'Credito') && $totalPagado < $totalVenta) {
                if (!$venta->id_cliente_miembro) {
                    throw new \Exception("No puede haber saldo pendiente para un cliente foráneo.");
                }
                $miembro = Miembro::find($venta->id_cliente_miembro);
                if ($miembro->solvencia !== 'Solvente') {
                    throw new \Exception("Solo miembros solventes pueden tener saldo pendiente (crédito).");
                }
            }

            $venta->save();

            DB::commit();
            return response()->json($venta);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getEstadisticas()
    {
        $hoy = Carbon::now()->toDateString();

        // 1. Ventas del Día (Total USD de ventas cobradas hoy o hechas hoy)
        // Usaremos las ventas cuya fecha es hoy
        $ventasHoy = VentaTasca::where('fecha', $hoy)->get();
        $totalVentasHoy = $ventasHoy->sum(function($v) { return $v->total - $v->descuento; });

        // 2. Desglose de métodos de pago (Pagos hechos hoy)
        $pagosHoy = DB::table('pago_venta_tasca')
            ->join('pagos_tasca', 'pago_venta_tasca.id_pago', '=', 'pagos_tasca.id')
            ->where('pagos_tasca.fecha_pago', $hoy)
            ->select('pagos_tasca.metodo_pago', DB::raw('SUM(pago_venta_tasca.monto_abonado_usd) as total'))
            ->groupBy('pagos_tasca.metodo_pago')
            ->get();

        $desglose = $pagosHoy->pluck('total', 'metodo_pago')->toArray();

        // 3. Cuánto es a crédito (Ventas hechas hoy que están en estado Credito o Parcial)
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
        $fontSizeSub = $formato === 'ticket' ? '10px' : '14px';
        $fontSizeText = $formato === 'ticket' ? '9px' : '12px';
        $fontFamily = $formato === 'ticket' ? 'Courier, monospace' : 'Helvetica, Arial, sans-serif';
        $tableStyle = $formato === 'ticket' ? "width: 100%; border-collapse: collapse; font-size: 9px; font-family: {$fontFamily};" : "width: 100%; border-collapse: collapse; font-size: 12px; font-family: {$fontFamily};";
        $thStyle = $formato === 'ticket' ? 'border-bottom: 1px dashed #333; font-weight:bold; padding: 2px 0;' : 'background-color:#f0f0f0; border-bottom: 2px solid #ccc; font-weight:bold; padding: 4px;';
        $tdStyle = $formato === 'ticket' ? 'padding: 2px 0;' : 'border-bottom: 1px solid #eee; padding: 4px;';

        $rangoTexto = $startDate === $endDate ? $startDate : "{$startDate} al {$endDate}";

        if ($formato === 'ticket') {
            $html = "
                <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.2;'>
                    <strong style='font-size: 11px;'>Unión de Ganaderos del Municipio Rosario de Perijá - TASCA</strong><br>
                    <span style='font-size: 9px;'>RIF: J-07002231-0</span><br>
                    <span style='font-size: 9px;'>Tlf: 02634511191</span><br>
                    <span style='font-size: 8px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora. Villa del Rosario Municipio Rosario de Perijá</span><br>
                    ----------------------------------------<br>
                    <strong style='font-size: 12px;'>REPORTE DE VENTAS TASCA</strong><br>
                    <span style='font-size: 9px;'>Fechas: {$rangoTexto}</span><br>
                    ----------------------------------------
                </div>
                <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; margin-bottom: 2px; text-align:center;'>Ingresos por Ventas</h3>
                <table style='{$tableStyle}'>
                    <tr>
                        <th style='{$thStyle} text-align:left;'>Método</th>
                        <th style='{$thStyle} text-align:right;'>USD</th>
                        <th style='{$thStyle} text-align:right;'>Bs</th>
                    </tr>
            ";
        } else {
            $html = "
                <div style='text-align:center; font-family: {$fontFamily};'>
                    <h2 style='font-size: 16px; margin-bottom:2px;'>Unión de Ganaderos del Municipio Rosario de Perijá - TASCA</h2>
                    <p style='font-size: 12px; margin: 2px 0;'>RIF: J-07002231-0 | Tlf: 02634511191</p>
                    <p style='font-size: 10px; margin: 2px 0 10px 0;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora. Villa del Rosario Municipio Rosario de Perijá</p>
                    <h1 style='font-size:{$fontSizeTitle}; margin-bottom:5px;'>REPORTE DE VENTAS TASCA</h1>
                    <h4 style='font-size:{$fontSizeSub}; color:#555; margin-top:0;'>Fechas: {$rangoTexto}</h4>
                </div>
                <hr style='border: 0.5px solid #ccc; margin: 10px 0;'>
                
                <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; color: #333;'>Ingresos por Ventas (Periodo Seleccionado)</h3>
                <table style='{$tableStyle}'>
                    <tr>
                        <th style='{$thStyle} text-align:left;'>Método de Pago</th>
                        <th style='{$thStyle} text-align:right;'>Total (USD)</th>
                        <th style='{$thStyle} text-align:right;'>Exacto (Bs)</th>
                    </tr>
            ";
        }

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
                        <td style='padding:4px; border-top:1px dashed #333;'>SUB TOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalVentasNuevasUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalVentasNuevasBs, 2) . "</td>
                    </tr>
                </table>

                <div style='text-align:center; font-family: {$fontFamily}; margin-top:10px;'>
                    ----------------------------------------
                </div>
                <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; margin-bottom: 2px; text-align:center;'>Abonos a Créditos</h3>
                <table style='{$tableStyle}'>
                    <tr>
                        <th style='{$thStyle} text-align:left;'>Método</th>
                        <th style='{$thStyle} text-align:right;'>USD</th>
                        <th style='{$thStyle} text-align:right;'>Bs</th>
                    </tr>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#e0f7fa; font-weight:bold;'>
                        <td style='padding:4px;'>SUBTOTAL VENTAS</td>
                        <td style='padding:4px; text-align:right;'>$" . number_format($totalVentasNuevasUsd, 2) . "</td>
                        <td style='padding:4px; text-align:right;'>Bs " . number_format($totalVentasNuevasBs, 2) . "</td>
                    </tr>
                </table>

                <br>
                <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; color: #333;'>Abonos a Créditos (Deudas Anteriores)</h3>
                <table style='{$tableStyle}'>
                    <tr>
                        <th style='{$thStyle} text-align:left;'>Método de Pago</th>
                        <th style='{$thStyle} text-align:right;'>Total (USD)</th>
                        <th style='{$thStyle} text-align:right;'>Exacto (Bs)</th>
                    </tr>
            ";
        }

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
                        <td style='padding:4px; border-top:1px dashed #333;'>SUB TOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalAbonosUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalAbonosBs, 2) . "</td>
                    </tr>
                </table>

                <div style='text-align:center; font-family: {$fontFamily}; margin-top:10px;'>
                    ========================================
                </div>
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
                        <td style='text-align:left; padding-bottom:2px;'>GENERAL (EQ. USD):</td>
                        <td style='text-align:right; padding-bottom:2px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                    </tr>
                </table>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#fff3e0; font-weight:bold;'>
                        <td style='padding:4px;'>SUBTOTAL ABONOS</td>
                        <td style='padding:4px; text-align:right;'>$" . number_format($totalAbonosUsd, 2) . "</td>
                        <td style='padding:4px; text-align:right;'>Bs " . number_format($totalAbonosBs, 2) . "</td>
                    </tr>
                </table>

                <hr style='border: 0.5px solid #ccc; margin: 15px 0;'>
                <table style='{$tableStyle}'>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:5px;'>TOTAL RECIBIDO (DIVISAS):</td>
                        <td style='text-align:right; padding-bottom:5px;'>$" . number_format($totalPuroDivisas, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold; color:#2e7d32;'>
                        <td style='text-align:left; padding-bottom:10px;'>TOTAL RECIBIDO (BOLÍVARES):</td>
                        <td style='text-align:right; padding-bottom:10px;'>Bs " . number_format($totalVentasNuevasBs + $totalAbonosBs, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeTitle}; font-weight:bold; background-color:#1e40af; color:#ffffff;'>
                        <td style='text-align:left; padding:8px;'>TOTAL GENERAL (Equiv. USD):</td>
                        <td style='text-align:right; padding:8px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                    </tr>
                </table>
            ";
        }

        $pdf->writeHTML($html, true, false, true, false, '');

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
        
        $pdf = new \TCPDF('P', 'mm', array(80, 297));
        $pdf->SetMargins(2, 2, 2);
        $pdf->SetCreator('Fondo2');
        $pdf->SetAuthor('Tasca');
        $pdf->SetTitle('Ticket de Venta #' . $venta->id);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();
        
        $fontFamily = 'Courier, monospace';
        $fecha = \Carbon\Carbon::parse($venta->created_at)->format('d/m/Y h:i A');
        $cliente = $venta->miembro ? $venta->miembro->razon_social : ($venta->clienteForaneo ? $venta->clienteForaneo->nombre : 'Consumidor Final');

        $html = "
            <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.2;'>
                <strong style='font-size: 11px;'>Unión de Ganaderos del Municipio Rosario de Perijá - TASCA</strong><br>
                <span style='font-size: 9px;'>RIF: J-07002231-0</span><br>
                <span style='font-size: 9px;'>Tlf: 02634511191</span><br>
                <span style='font-size: 8px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora. Villa del Rosario Municipio Rosario de Perijá</span><br>
                ----------------------------------------<br>
                <strong style='font-size: 12px;'>TICKET DE VENTA #{$venta->id}</strong><br>
                <span style='font-size: 9px;'>Fecha: {$fecha}</span><br>
                <span style='font-size: 9px;'>Cliente: {$cliente}</span><br>
                <span style='font-size: 9px;'>Estado: " . strtoupper($venta->estado) . "</span><br>
                ----------------------------------------
            </div>
            <table style='width: 100%; border-collapse: collapse; font-size: 9px; font-family: {$fontFamily};'>
                <tr>
                    <th style='border-bottom: 1px dashed #333; text-align:left;'>Cant.</th>
                    <th style='border-bottom: 1px dashed #333; text-align:left;'>Descripción</th>
                    <th style='border-bottom: 1px dashed #333; text-align:right;'>Total</th>
                </tr>
        ";

        foreach ($venta->detalles as $det) {
            $nombre = $det->producto->nombre_completo ?? $det->producto->nombre;
            $html .= "
                <tr>
                    <td style='padding: 2px 0;'>{$det->cantidad}</td>
                    <td style='padding: 2px 0;'>{$nombre}</td>
                    <td style='padding: 2px 0; text-align:right;'>$" . number_format($det->subtotal, 2) . "</td>
                </tr>
            ";
        }

        $html .= "
                <tr><td colspan='3' style='border-top:1px dashed #333;'></td></tr>
                <tr>
                    <td colspan='2' style='font-weight:bold;'>TOTAL:</td>
                    <td style='text-align:right; font-weight:bold;'>$" . number_format($venta->total, 2) . "</td>
                </tr>
            </table>
        ";

        if ($venta->pagos->count() > 0) {
            $html .= "
                <div style='text-align:center; font-family: {$fontFamily}; margin-top:5px;'>
                    ----------------------------------------<br>
                    <strong style='font-size: 10px;'>PAGOS REALIZADOS</strong>
                </div>
                <table style='width: 100%; border-collapse: collapse; font-size: 9px; font-family: {$fontFamily};'>
            ";
            foreach ($venta->pagos as $pago) {
                $montoBs = $pago->monto_bs ? "(Bs " . number_format($pago->monto_bs, 2) . ")" : "";
                $html .= "
                    <tr>
                        <td>{$pago->metodo_pago}</td>
                        <td style='text-align:right;'>$" . number_format($pago->monto_usd, 2) . " {$montoBs}</td>
                    </tr>
                ";
            }
            $html .= "</table>";
        }

        $html .= "
            <div style='text-align:center; font-family: {$fontFamily}; margin-top:10px;'>
                ----------------------------------------<br>
                <span style='font-size: 9px;'>¡Gracias por su compra!</span>
            </div>
        ";

        if (strtolower($venta->estado) === 'credito') {
            $html .= "
                <br><br><br>
                <div style='text-align:center; font-family: {$fontFamily};'>
                    _________________________<br>
                    <span style='font-size: 9px;'>Firma del Cliente</span>
                </div>
            ";
        }

        $pdf->writeHTML($html, true, false, true, false, '');
        return response($pdf->Output('ticket_venta_'.$venta->id.'.pdf', 'S'))
            ->header('Content-Type', 'application/pdf');
    }
}
