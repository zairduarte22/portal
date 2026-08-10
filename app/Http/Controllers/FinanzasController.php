<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinanzasController extends Controller
{
    public function libroVentas()
    {
        try {
            $ventas = DB::table('libro_ventas')
                ->leftJoin('miembros', 'libro_ventas.id_miembro', '=', 'miembros.id')
                ->select(
                    'libro_ventas.*', 
                    'miembros.razon_social as miembro_nombre',
                    'miembros.rif as miembro_rif'
                )
                ->orderBy('libro_ventas.fecha', 'desc')
                ->orderBy('libro_ventas.id', 'desc')
                ->get();

            return response()->json($ventas);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function libroCompras()
    {
        try {
            $compras = DB::table('libro_compras')
                ->leftJoin('proveedor', 'libro_compras.id_proveedor', '=', 'proveedor.id')
                ->select(
                    'libro_compras.*', 
                    'proveedor.razon_social as proveedor_nombre',
                    'proveedor.rif as proveedor_rif'
                )
                ->orderBy('libro_compras.fecha', 'desc')
                ->orderBy('libro_compras.id', 'desc')
                ->get();

            return response()->json($compras);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function conciliacionVes(Request $request)
    {
        try {
            $query = DB::table('cuenta_banco')
                ->leftJoin('bancos', 'cuenta_banco.id_banco', '=', 'bancos.id')
                ->leftJoin('categoria_fondos', 'cuenta_banco.categoria_id', '=', 'categoria_fondos.id')
                ->leftJoin('beneficiarios_fondo', 'cuenta_banco.beneficiario_id', '=', 'beneficiarios_fondo.id')
                ->select(
                    'cuenta_banco.*', 
                    'bancos.nombre as banco_nombre',
                    'categoria_fondos.categoria as categoria_nombre',
                    'beneficiarios_fondo.nombre as beneficiario_nombre'
                )
                ->where('bancos.para_membresias', true);

            if ($request->query('desde')) {
                $query->where('cuenta_banco.fecha', '>=', $request->query('desde'));
            }
            if ($request->query('hasta')) {
                $query->where('cuenta_banco.fecha', '<=', $request->query('hasta'));
            }

            $movimientos = $query->orderBy('cuenta_banco.fecha', 'desc')
                ->orderBy('cuenta_banco.id', 'desc')
                ->get();

            return response()->json($movimientos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function conciliacionUsd(Request $request)
    {
        try {
            $query = DB::table('cuenta_moneda_extranjera')
                ->leftJoin('bancos', 'cuenta_moneda_extranjera.id_banco', '=', 'bancos.id')
                ->leftJoin('categoria_fondos', 'cuenta_moneda_extranjera.categoria_id', '=', 'categoria_fondos.id')
                ->leftJoin('beneficiarios_fondo', 'cuenta_moneda_extranjera.beneficiario_id', '=', 'beneficiarios_fondo.id')
                ->select(
                    'cuenta_moneda_extranjera.*', 
                    'bancos.nombre as banco_nombre',
                    'categoria_fondos.categoria as categoria_nombre',
                    'beneficiarios_fondo.nombre as beneficiario_nombre'
                )
                ->where('bancos.para_membresias', true);

            if ($request->query('desde')) {
                $query->where('cuenta_moneda_extranjera.fecha', '>=', $request->query('desde'));
            }
            if ($request->query('hasta')) {
                $query->where('cuenta_moneda_extranjera.fecha', '<=', $request->query('hasta'));
            }

            $movimientos = $query->orderBy('cuenta_moneda_extranjera.fecha', 'desc')
                ->orderBy('cuenta_moneda_extranjera.id', 'desc')
                ->get();

            return response()->json($movimientos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeLibro(Request $request, $tipo)
    {
        $table = $tipo === 'ventas' ? 'libro_ventas' : 'libro_compras';
        try {
            $registrarBanco = $request->input('registrar_banco', false);
            $idBanco = $request->input('id_banco');
            $categoriaBanco = $request->input('categoria_banco');
            
            $data = $request->except(['id', 'created_at', 'updated_at', 'miembro_nombre', 'miembro_rif', 'proveedor_nombre', 'proveedor_rif', 'registrar_banco', 'id_banco', 'categoria_banco']);
            
            foreach ($data as $key => $value) {
                if ($value === '') {
                    $data[$key] = null;
                }
            }
            
            $idLibro = DB::table($table)->insertGetId($data);

            if ($registrarBanco && $idBanco) {
                $banco = DB::table('bancos')->where('id', $idBanco)->first();
                if ($banco) {
                    $tablaBanco = ($banco->divisa === 'USD') ? 'cuenta_moneda_extranjera' : 'cuenta_banco';
                    
                    $descripcion = ($tipo === 'ventas') 
                        ? "Ingreso de Venta #" . ($data['numero_control'] ?? '')
                        : "Egreso por Compra #" . ($data['numero_control'] ?? '');
                        
                    // Retrieve beneficiary name if applicable
                    $beneficiarioNombre = null;
                    if ($tipo === 'ventas' && !empty($data['id_miembro'])) {
                        $miembro = DB::table('miembros')->where('id', $data['id_miembro'])->first();
                        $beneficiarioNombre = $miembro ? $miembro->razon_social : null;
                    } elseif ($tipo === 'compras' && !empty($data['id_proveedor'])) {
                        $proveedor = DB::table('proveedor')->where('id', $data['id_proveedor'])->first();
                        $beneficiarioNombre = $proveedor ? $proveedor->razon_social : null;
                    }

                    $monto = floatval($data['monto'] ?? 0);

                    $bancoData = [
                        'id_banco' => $idBanco,
                        'fecha' => $data['fecha'] ?? date('Y-m-d'),
                        'tipo_operacion' => 'TRANSF',
                        'referencia' => $data['referencia'] ?? '',
                        'beneficiario' => $beneficiarioNombre,
                        'descripcion' => $descripcion,
                        'debe' => ($tipo === 'compras') ? $monto : 0,
                        'haber' => ($tipo === 'ventas') ? $monto : 0,
                        'categoria_id' => $categoriaBanco,
                        'id_venta' => ($tipo === 'ventas') ? $idLibro : null,
                        'id_compra' => ($tipo === 'compras') ? $idLibro : null,
                    ];
                    
                    DB::table($tablaBanco)->insert($bancoData);
                }
            }

            return response()->json(['message' => 'Registro creado exitosamente'], 201);
        } catch (\Exception $e) {
            \Log::error('Store Libro Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateLibro(Request $request, $tipo, $id)
    {
        $table = $tipo === 'ventas' ? 'libro_ventas' : 'libro_compras';
        try {
            DB::table($table)->where('id', $id)->update($request->except(['id', 'created_at', 'updated_at', 'miembro_nombre', 'miembro_rif', 'proveedor_nombre', 'proveedor_rif']));
            return response()->json(['message' => 'Registro actualizado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteLibro($tipo, $id)
    {
        $table = $tipo === 'ventas' ? 'libro_ventas' : 'libro_compras';
        DB::beginTransaction();
        try {
            if ($tipo === 'ventas') {
                DB::table('cuenta_banco')->where('id_venta', $id)->delete();
                DB::table('cuenta_moneda_extranjera')->where('id_venta', $id)->delete();
                DB::table('cruces')->where('id_venta', $id)->delete();
            } else {
                DB::table('cuenta_banco')->where('id_compra', $id)->delete();
                DB::table('cuenta_moneda_extranjera')->where('id_compra', $id)->delete();
            }
            DB::table($table)->where('id', $id)->delete();
            DB::commit();
            return response()->json(['message' => 'Registro eliminado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function storeConciliacion(Request $request, $tipo)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            $data = $request->except(['id', 'banco_nombre', 'categoria_nombre', 'beneficiario_nombre']);
            foreach ($data as $key => $value) {
                if ($value === '') {
                    $data[$key] = null;
                }
            }
            
            DB::table($table)->insert($data);
            return response()->json(['message' => 'Movimiento creado exitosamente'], 201);
        } catch (\Exception $e) {
            \Log::error('Store Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateConciliacion(Request $request, $tipo, $id)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            $data = $request->except(['id', 'created_at', 'updated_at', 'banco_nombre', 'categoria_nombre', 'beneficiario_nombre']);
            foreach ($data as $key => $value) {
                if ($value === '') {
                    $data[$key] = null;
                }
            }
            DB::table($table)->where('id', $id)->update($data);
            return response()->json(['message' => 'Registro actualizado exitosamente']);
        } catch (\Exception $e) {
            \Log::error('Update Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteConciliacion($tipo, $id)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            DB::table($table)->where('id', $id)->delete();
            return response()->json(['message' => 'Registro eliminado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
