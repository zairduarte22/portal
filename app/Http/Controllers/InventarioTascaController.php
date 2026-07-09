<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\InsumoTasca;
use App\Models\LoteTasca;

class InventarioTascaController extends Controller
{
    public function getInsumos()
    {
        return response()->json(InsumoTasca::with(['lotes', 'productos'])->get());
    }

    public function storeInsumo(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria' => 'nullable|string'
        ]);

        $insumo = InsumoTasca::create($request->all());
        return response()->json($insumo, 201);
    }

    public function storeProductoCompleto(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria' => 'nullable|string',
            'inventario_inicial' => 'nullable|numeric|min:0',
            'costo_inicial' => 'nullable|numeric|min:0',
            'presentaciones' => 'required|array|min:1',
            'presentaciones.*.nombre' => 'required|string|max:255',
            'presentaciones.*.precio' => 'required|numeric|min:0',
            'presentaciones.*.medida_descuento' => 'required|numeric|min:0.01',
            'presentaciones.*.codigo_barras' => 'nullable|string'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // 1. Crear Insumo Base
            $insumo = InsumoTasca::create([
                'nombre' => $request->nombre,
                'categoria' => $request->categoria
            ]);

            // 2. Crear Inventario Inicial si es mayor a 0
            if ($request->filled('inventario_inicial') && $request->inventario_inicial > 0) {
                LoteTasca::create([
                    'id_insumo' => $insumo->id,
                    'codigo_lote' => 'INICIAL',
                    'cantidad_comprada' => $request->inventario_inicial,
                    'costo_unitario' => $request->costo_inicial ?? 0,
                    'stock_actual' => $request->inventario_inicial,
                    'fecha_compra' => \Carbon\Carbon::now()->toDateString(),
                    'estado' => 'Activo'
                ]);
            }

            // 3. Crear Presentaciones de Venta
            foreach ($request->presentaciones as $pres) {
                \App\Models\ProductoTasca::create([
                    'id_insumo' => $insumo->id,
                    'nombre' => $pres['nombre'],
                    'precio' => $pres['precio'],
                    'medida_descuento' => $pres['medida_descuento'],
                    'codigo_barras' => $pres['codigo_barras'] ?? null
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Producto registrado exitosamente'], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateProductoCompleto(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria' => 'nullable|string',
            'presentaciones' => 'required|array|min:1',
            'presentaciones.*.nombre' => 'required|string|max:255',
            'presentaciones.*.precio' => 'required|numeric|min:0',
            'presentaciones.*.medida_descuento' => 'required|numeric|min:0.01',
            'presentaciones.*.codigo_barras' => 'nullable|string'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $insumo = InsumoTasca::findOrFail($id);
            $insumo->update([
                'nombre' => $request->nombre,
                'categoria' => $request->categoria
            ]);

            $presentacionesRequest = collect($request->presentaciones);
            $idsToKeep = $presentacionesRequest->pluck('id')->filter()->toArray();

            // Verificar si las que se van a eliminar tienen ventas asociadas
            $presentacionesAEliminar = \App\Models\ProductoTasca::where('id_insumo', $insumo->id)
                ->whereNotIn('id', $idsToKeep)
                ->get();

            foreach ($presentacionesAEliminar as $presEliminar) {
                if ($presEliminar->detalles()->count() > 0) {
                    throw new \Exception("No se puede eliminar la presentación '{$presEliminar->nombre}' porque ya tiene ventas registradas.");
                }
                $presEliminar->delete();
            }

            // Actualizar o Crear las presentaciones
            foreach ($request->presentaciones as $pres) {
                if (isset($pres['id']) && $pres['id']) {
                    $producto = \App\Models\ProductoTasca::find($pres['id']);
                    if ($producto && $producto->id_insumo == $insumo->id) {
                        $producto->update([
                            'nombre' => $pres['nombre'],
                            'precio' => $pres['precio'],
                            'medida_descuento' => $pres['medida_descuento'],
                            'codigo_barras' => $pres['codigo_barras'] ?? null
                        ]);
                    }
                } else {
                    \App\Models\ProductoTasca::create([
                        'id_insumo' => $insumo->id,
                        'nombre' => $pres['nombre'],
                        'precio' => $pres['precio'],
                        'medida_descuento' => $pres['medida_descuento'],
                        'codigo_barras' => $pres['codigo_barras'] ?? null
                    ]);
                }
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Producto actualizado exitosamente']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateInsumo(Request $request, $id)
    {
        $insumo = InsumoTasca::findOrFail($id);
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'categoria' => 'nullable|string'
        ]);

        $insumo->update($request->all());
        return response()->json($insumo);
    }

    public function destroyInsumo($id)
    {
        // Al eliminar el insumo (producto base), eliminamos sus presentaciones asociadas
        \App\Models\ProductoTasca::where('id_insumo', $id)->delete();
        InsumoTasca::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    // Lotes
    public function getLotes($id_insumo)
    {
        return response()->json(LoteTasca::where('id_insumo', $id_insumo)->get());
    }

    public function storeLote(Request $request)
    {
        $request->validate([
            'id_insumo' => 'required|exists:insumos_tasca,id',
            'codigo_lote' => 'nullable|string',
            'proveedor_id' => 'nullable|exists:proveedor,id',
            'cantidad_comprada' => 'required|numeric|min:0.01',
            'costo_unitario' => 'required|numeric|min:0',
            'fecha_compra' => 'required|date',
            'fecha_caducidad' => 'nullable|date'
        ]);

        $insumo = InsumoTasca::findOrFail($request->id_insumo);

        $data = $request->all();
        $data['stock_actual'] = $data['cantidad_comprada'];
        $data['estado'] = 'Activo';

        $lote = LoteTasca::create($data);
        return response()->json($lote, 201);
    }

    public function getCompras()
    {
        return response()->json(\App\Models\CompraTasca::with(['lotes.insumo', 'proveedor', 'gastos'])->orderBy('fecha_compra', 'desc')->get());
    }

    public function storeCompra(Request $request)
    {
        $request->validate([
            'fecha_compra' => 'required|date',
            'referencia_factura' => 'nullable|string',
            'proveedor_id' => 'nullable|exists:proveedores_tasca,id',
            'tipo_compra' => 'required|in:Contado,Credito',
            'pagos' => 'nullable|array',
            'pagos.*.metodo_pago' => 'required_with:pagos|string',
            'pagos.*.monto_usd' => 'required_with:pagos|numeric|min:0.01',
            'pagos.*.monto_bs' => 'nullable|numeric|min:0',
            'pagos.*.referencia_pago' => 'nullable|string',
            'lotes' => 'required|array|min:1',
            'lotes.*.id_insumo' => 'required|exists:insumos_tasca,id',
            'lotes.*.cantidad_comprada' => 'required|numeric|min:0.01',
            'lotes.*.costo_unitario' => 'required|numeric|min:0',
            'lotes.*.fecha_caducidad' => 'nullable|date'
        ]);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $total = 0;
            foreach ($request->lotes as $loteData) {
                $total += $loteData['cantidad_comprada'] * $loteData['costo_unitario'];
            }

            $estado = $request->tipo_compra === 'Contado' ? 'Pagada' : 'Pendiente';

            $compra = \App\Models\CompraTasca::create([
                'fecha_compra' => $request->fecha_compra,
                'referencia_factura' => $request->referencia_factura,
                'proveedor_id' => $request->proveedor_id,
                'total_usd' => $total,
                'abono_usd' => $request->tipo_compra === 'Contado' ? $total : 0,
                'estado' => $estado
            ]);

            if ($request->tipo_compra === 'Contado' && $request->has('pagos')) {
                foreach ($request->pagos as $pago) {
                    \App\Models\GastoTasca::create([
                        'categoria' => 'Compra de Mercancia',
                        'descripcion' => 'Pago por compra ' . ($request->referencia_factura ?? '#' . $compra->id),
                        'monto_usd' => $pago['monto_usd'],
                        'monto_bs' => $pago['monto_bs'] ?? null,
                        'metodo_pago' => $pago['metodo_pago'],
                        'referencia_pago' => $pago['referencia_pago'] ?? null,
                        'fecha' => $request->fecha_compra,
                        'proveedor_id' => $request->proveedor_id,
                        'compra_id' => $compra->id
                    ]);
                }
            }

            foreach ($request->lotes as $loteData) {
                $insumo = InsumoTasca::findOrFail($loteData['id_insumo']);
                
                $data = $loteData;
                $data['compra_id'] = $compra->id;
                $data['stock_actual'] = $data['cantidad_comprada'];
                $data['estado'] = 'Activo';
                $data['fecha_compra'] = $request->fecha_compra;

                LoteTasca::create($data);
            }
            \Illuminate\Support\Facades\DB::commit();
            
            return response()->json($compra->load('lotes', 'proveedor', 'gastos'), 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagarCompra(Request $request, $id)
    {
        $request->validate([
            'fecha' => 'required|date',
            'pagos' => 'required|array|min:1',
            'pagos.*.metodo_pago' => 'required|string',
            'pagos.*.monto_usd' => 'required|numeric|min:0.01',
            'pagos.*.monto_bs' => 'nullable|numeric|min:0',
            'pagos.*.referencia_pago' => 'nullable|string',
        ]);

        $compra = \App\Models\CompraTasca::findOrFail($id);

        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $total_abonado = 0;
            foreach ($request->pagos as $pago) {
                $total_abonado += $pago['monto_usd'];
            }

            $compra->abono_usd += $total_abonado;

            if ($compra->abono_usd >= $compra->total_usd - 0.01) {
                $compra->estado = 'Pagada';
            } else {
                $compra->estado = 'Parcial';
            }
            $compra->save();

            foreach ($request->pagos as $pago) {
                \App\Models\GastoTasca::create([
                    'categoria' => 'Compra de Mercancia',
                    'descripcion' => 'Abono a compra ' . ($compra->referencia_factura ?? '#' . $compra->id),
                    'monto_usd' => $pago['monto_usd'],
                    'monto_bs' => $pago['monto_bs'] ?? null,
                    'metodo_pago' => $pago['metodo_pago'],
                    'referencia_pago' => $pago['referencia_pago'] ?? null,
                    'fecha' => $request->fecha,
                    'proveedor_id' => $compra->proveedor_id,
                    'compra_id' => $compra->id
                ]);
            }

            \Illuminate\Support\Facades\DB::commit();
            
            return response()->json($compra->load('lotes', 'proveedor', 'gastos'));
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function anularCompra($id)
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $compra = \App\Models\CompraTasca::with('lotes')->findOrFail($id);
            
            if ($compra->estado === 'Anulada') {
                throw new \Exception('La compra ya está anulada');
            }

            $compra->estado = 'Anulada';
            $compra->save();

            foreach ($compra->lotes as $lote) {
                $lote->estado = 'Anulado';
                $lote->stock_actual = 0; 
                $lote->save();
            }

            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Compra anulada exitosamente']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function updateLote(Request $request, $id)
    {
        $lote = LoteTasca::findOrFail($id);
        
        $request->validate([
            'codigo_lote' => 'nullable|string',
            'proveedor_id' => 'nullable|exists:proveedor,id',
            'costo_unitario' => 'required|numeric|min:0',
            'stock_actual' => 'required|numeric|min:0',
            'fecha_compra' => 'required|date',
            'fecha_caducidad' => 'nullable|date',
            'estado' => 'required|string'
        ]);

        $lote->update($request->all());
        return response()->json($lote);
    }

    public function destroyLote($id)
    {
        LoteTasca::destroy($id);
        return response()->json(['message' => 'Eliminado']);
    }

    public function reporteInventario(Request $request)
    {
        $formato = $request->query('formato', 'pdf');
        $insumos = InsumoTasca::with(['lotesActivos'])->orderBy('nombre')->get();
        
        $data = [];
        $totalValorizado = 0;
        
        foreach ($insumos as $ins) {
            $stockTotal = $ins->stock_total;
            $valorInsumo = 0;
            foreach ($ins->lotesActivos as $lote) {
                $valorInsumo += $lote->stock_actual * $lote->costo_unitario;
            }
            $totalValorizado += $valorInsumo;
            
            $data[] = [
                'nombre' => $ins->nombre,
                'categoria' => $ins->categoria ?? 'S/C',
                'stock' => $stockTotal,
                'valor' => $valorInsumo
            ];
        }
        
        $fechaEmision = date('d/m/Y h:i A');
        $totalItems = count($data);
        $nombreUsuario = auth()->check() ? auth()->user()->name : 'Usuario';

        if ($formato === 'excel' || $formato === 'csv') {
            $html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
            $html .= '<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventario</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
            $html .= '<body>';
            $html .= '<table border="1">';
            
            // Encabezado Excel
            $html .= '<tr><td colspan="4" style="font-weight:bold; font-size:16px; text-align:center; background-color:#064e3b; color:#ffffff;">UNIÓN DE GANADEROS DEL MUNICIPIO ROSARIO DE PERIJÁ</td></tr>';
            $html .= '<tr><td colspan="4" style="text-align:center;">RIF: J-07002231-0 | Tlf: 02634511191</td></tr>';
            $html .= '<tr><td colspan="4" style="text-align:center;">Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora. Villa del Rosario Municipio Rosario de Perijá</td></tr>';
            $html .= '<tr><td colspan="4"></td></tr>';
            $html .= '<tr><td colspan="4" style="font-weight:bold; font-size:14px; text-align:center;">REPORTE DE INVENTARIO VALORIZADO</td></tr>';
            $html .= '<tr><td colspan="2"><strong>Módulo:</strong> Gestión de Tasca</td><td colspan="2"><strong>Generado por:</strong> ' . $nombreUsuario . '</td></tr>';
            $html .= '<tr><td colspan="2"><strong>Fecha de Emisión:</strong> ' . $fechaEmision . '</td><td colspan="2"><strong>Total Ítems:</strong> ' . $totalItems . '</td></tr>';
            $html .= '<tr><td colspan="4"></td></tr>';

            $html .= '<tr>';
            $html .= '<th style="background-color:#064e3b; color:white;">Producto / Insumo</th>';
            $html .= '<th style="background-color:#064e3b; color:white;">Categoría</th>';
            $html .= '<th style="background-color:#064e3b; color:white;">Stock Total (Unidades)</th>';
            $html .= '<th style="background-color:#064e3b; color:white;">Valorización (USD)</th>';
            $html .= '</tr>';
            
            foreach ($data as $row) {
                $html .= '<tr>';
                $html .= '<td>' . htmlspecialchars($row['nombre']) . '</td>';
                $html .= '<td>' . htmlspecialchars($row['categoria']) . '</td>';
                $html .= '<td>' . $row['stock'] . '</td>';
                $html .= '<td>' . number_format($row['valor'], 2, '.', '') . '</td>';
                $html .= '</tr>';
            }
            
            $html .= '<tr>';
            $html .= '<td colspan="2"></td>';
            $html .= '<td style="font-weight:bold;">TOTAL GENERAL</td>';
            $html .= '<td style="font-weight:bold;">' . number_format($totalValorizado, 2, '.', '') . '</td>';
            $html .= '</tr>';
            
            $html .= '</table>';
            $html .= '</body></html>';
            
            return response($html)
                ->header('Content-Type', 'application/vnd.ms-excel; charset=UTF-8')
                ->header('Content-Disposition', 'attachment; filename="Inventario_Tasca_'.date('Ymd').'.xls"');
        }
        
        $pdf = new \TCPDF('P', 'mm', 'LETTER');
        $pdf->SetMargins(15, 15, 15);
        $pdf->SetAutoPageBreak(TRUE, 20);
        $pdf->SetTitle('Reporte de Inventario Tasca');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        $html = "
            <style>
                .header-table { width: 100%; font-family: Helvetica, sans-serif; border-bottom: 3px solid #064e3b; padding-bottom: 15px; margin-bottom: 25px; }
                .org-title { font-size: 16px; font-weight: bold; color: #1e293b; margin: 0; line-height: 1.4; }
                .org-subtitle { font-size: 11px; color: #475569; margin: 0; line-height: 1.5; }
                .report-title { font-size: 19px; font-weight: bold; color: #064e3b; text-align: right; margin: 0; }
                .report-meta { font-size: 10px; color: #64748b; text-align: right; line-height: 1.5; margin-top: 4px; }
                
                .summary-table { width: 100%; font-family: Helvetica, sans-serif; margin-bottom: 25px; }
                .summary-box { background-color: #f8fafc; border: 1px solid #cbd5e1; padding: 50px 10px; text-align: center; line-height: 1.2; }
                .summary-label { font-size: 10px; color: #64748b; font-weight: bold; }
                .summary-value { font-size: 16px; color: #0f172a; font-weight: bold; }

                .data-table { width: 100%; border-collapse: collapse; font-family: Helvetica, sans-serif; font-size: 11px; color: #334155; margin-bottom: 40px; }
                .data-th { background-color: #064e3b; color: #ffffff; font-weight: bold; padding: 8px; text-align: left; }
                .data-th-center { background-color: #064e3b; color: #ffffff; font-weight: bold; padding: 8px; text-align: center; }
                .data-th-right { background-color: #064e3b; color: #ffffff; font-weight: bold; padding: 8px; text-align: right; }
                .data-td { border-bottom: 1px solid #e2e8f0; padding: 8px; color: #334155; line-height: 1.5; }
                .data-td-center { border-bottom: 1px solid #e2e8f0; padding: 8px; color: #334155; text-align: center; line-height: 1.5; }
                .data-td-right { border-bottom: 1px solid #e2e8f0; padding: 8px; color: #334155; text-align: right; line-height: 1.5; }
                .data-td-alt { background-color: #f8fafc; }
                
                .total-row td { background-color: #f1f5f9; padding: 8px; font-size: 12px; border-bottom: 2px solid #cbd5e1; border-top: 2px solid #cbd5e1; line-height: 1.2; }
                
                .footer { text-align: center; font-family: Helvetica, sans-serif; font-size: 9px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 50px; line-height: 1.4; }
            </style>

            <table class=\"header-table\">
                <tr>
                    <td width=\"60%\">
                        <div class=\"org-title\">UNIÓN DE GANADEROS DEL MUNICIPIO<br>ROSARIO DE PERIJÁ</div><br>
                        <div class=\"org-subtitle\">
                            <strong>RIF:</strong> J-07002231-0 | <strong>Tlf:</strong> 02634511191<br>
                            Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>
                            Villa del Rosario Municipio Rosario de Perijá
                        </div>
                    </td>
                    <td width=\"40%\">
                        <div class=\"report-title\">INVENTARIO VALORIZADO</div><br>
                        <div class=\"report-meta\">
                            <strong>Módulo:</strong> Gestión de Tasca<br>
                            <strong>Fecha de Emisión:</strong> {$fechaEmision}<br>
                            <strong>Generado por:</strong> {$nombreUsuario}
                        </div>
                    </td>
                </tr>
            </table>

            <br><br>

            <table class=\"summary-table\">
                <tr>
                    <td width=\"10%\"></td>
                    <td width=\"38%\" height=\"80\" class=\"summary-box\" style=\"vertical-align: middle;\">
                        <br><br>
                        <span class=\"summary-label\">TOTAL ÍTEMS EN INVENTARIO</span><br><br>
                        <span class=\"summary-value\">" . number_format($totalItems, 0) . " PRODUCTOS</span>
                        <br><br>
                    </td>
                    <td width=\"4%\"></td>
                    <td width=\"38%\" height=\"80\" class=\"summary-box\" style=\"vertical-align: middle;\">
                        <br><br>
                        <span class=\"summary-label\">VALORIZACIÓN GLOBAL ESTIMADA</span><br><br>
                        <span class=\"summary-value\">USD $" . number_format($totalValorizado, 2) . "</span>
                        <br><br>
                    </td>
                    <td width=\"10%\"></td>
                </tr>
            </table>

            <br><br><br>

            <table class=\"data-table\">
                <thead>
                    <tr>
                        <th class=\"data-th\" width=\"55%\">PRODUCTO / INSUMO</th>
                        <th class=\"data-th-center\" width=\"15%\">CATEGORÍA</th>
                        <th class=\"data-th-center\" width=\"15%\">STOCK</th>
                        <th class=\"data-th-center\" width=\"15%\">VALOR (USD)</th>
                    </tr>
                </thead>
                <tbody>
        ";
        
        $alt = false;
        foreach ($data as $row) {
            $rowClass = $alt ? 'data-td-alt' : '';
            $html .= "<tr>
                <td class=\"data-td {$rowClass}\" width=\"55%\"><strong>" . strtoupper($row['nombre']) . "</strong></td>
                <td class=\"data-td-center {$rowClass}\" width=\"15%\">{$row['categoria']}</td>
                <td class=\"data-td-center {$rowClass}\" width=\"15%\"><strong>{$row['stock']}</strong></td>
                <td class=\"data-td-center {$rowClass}\" width=\"15%\">$" . number_format($row['valor'], 2) . "</td>
            </tr>";
            $alt = !$alt;
        }
        
        $html .= "
                </tbody>
                <tfoot>
                    <tr class=\"total-row\">
                        <td width=\"85%\" colspan=\"3\" style=\"text-align:right;\"><strong>VALOR TOTAL DEL INVENTARIO (USD):</strong></td>
                        <td width=\"15%\" style=\"text-align:center;\"><strong>$" . number_format($totalValorizado, 2) . "</strong></td>
                    </tr>
                </tfoot>
            </table>
            
            <br><br><br><br>

            <div class=\"footer\">
                <p>Este documento es generado automáticamente por el Sistema de Gestión Administrativa y Membresías de Agroproductores (SIGAMA).</p>
                <p>Uso exclusivo e interno para control de la Unión de Ganaderos del Municipio Rosario de Perijá.</p>
            </div>
        ";
        
        $pdf->writeHTML($html, true, false, true, false, '');
        return response($pdf->Output('Inventario_Tasca_'.date('Ymd').'.pdf', 'I'))
            ->header('Content-Type', 'application/pdf');
    }
}
