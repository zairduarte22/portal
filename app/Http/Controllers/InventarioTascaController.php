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
        
        if ($formato === 'excel' || $formato === 'csv') {
            $html = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
            $html .= '<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Inventario</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head>';
            $html .= '<body>';
            $html .= '<table border="1">';
            $html .= '<tr>';
            $html .= '<th style="background-color:#4CAF50; color:white;">Producto / Insumo</th>';
            $html .= '<th style="background-color:#4CAF50; color:white;">Categoría</th>';
            $html .= '<th style="background-color:#4CAF50; color:white;">Stock Total (Unidades)</th>';
            $html .= '<th style="background-color:#4CAF50; color:white;">Valorización (USD)</th>';
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
        $pdf->SetTitle('Reporte de Inventario Tasca');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();
        
        $html = "
            <div style='text-align:center; font-family: Helvetica, sans-serif;'>
                <h2 style='font-size: 16px; margin-bottom:2px;'>Unión de Ganaderos del Municipio Rosario de Perijá - TASCA</h2>
                <h1 style='font-size:18px; margin-bottom:5px; color:#1e40af;'>REPORTE DE INVENTARIO VALORIZADO</h1>
                <h4 style='font-size:12px; color:#555;'>Fecha de Emisión: " . date('d/m/Y h:i A') . "</h4>
            </div>
            <hr style='border: 0.5px solid #ccc; margin: 10px 0;'>
            <table style='width: 100%; border-collapse: collapse; font-family: Helvetica, sans-serif; font-size: 11px;'>
                <tr style='background-color:#f0f0f0;'>
                    <th style='border-bottom: 2px solid #ccc; font-weight:bold; padding: 6px; text-align:left;'>Producto / Insumo</th>
                    <th style='border-bottom: 2px solid #ccc; font-weight:bold; padding: 6px; text-align:left;'>Categoría</th>
                    <th style='border-bottom: 2px solid #ccc; font-weight:bold; padding: 6px; text-align:right;'>Stock (Unid/ml)</th>
                    <th style='border-bottom: 2px solid #ccc; font-weight:bold; padding: 6px; text-align:right;'>Valorización (USD)</th>
                </tr>
        ";
        
        foreach ($data as $row) {
            $html .= "<tr>
                <td style='border-bottom: 1px solid #eee; padding: 4px;'>{$row['nombre']}</td>
                <td style='border-bottom: 1px solid #eee; padding: 4px;'>{$row['categoria']}</td>
                <td style='border-bottom: 1px solid #eee; padding: 4px; text-align:right;'>{$row['stock']}</td>
                <td style='border-bottom: 1px solid #eee; padding: 4px; text-align:right;'>$" . number_format($row['valor'], 2) . "</td>
            </tr>";
        }
        
        $html .= "
                <tr style='background-color:#e0f2fe; font-weight:bold;'>
                    <td colspan='3' style='padding:6px; text-align:right; font-size:12px;'>VALOR TOTAL DEL INVENTARIO (USD):</td>
                    <td style='padding:6px; text-align:right; font-size:12px;'>$" . number_format($totalValorizado, 2) . "</td>
                </tr>
            </table>
        ";
        
        $pdf->writeHTML($html, true, false, true, false, '');
        return response($pdf->Output('Inventario_Tasca_'.date('Ymd').'.pdf', 'I'))
            ->header('Content-Type', 'application/pdf');
    }
}
