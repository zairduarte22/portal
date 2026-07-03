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
                    'proveedor.nombre as proveedor_nombre',
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
                ->select(
                    'cuenta_banco.*', 
                    'bancos.nombre as banco_nombre'
                );

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
                ->select(
                    'cuenta_moneda_extranjera.*', 
                    'bancos.nombre as banco_nombre'
                );

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

    public function updateConciliacion(Request $request, $tipo, $id)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            DB::table($table)->where('id', $id)->update($request->except(['id', 'created_at', 'updated_at', 'banco_nombre']));
            return response()->json(['message' => 'Registro actualizado exitosamente']);
        } catch (\Exception $e) {
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
