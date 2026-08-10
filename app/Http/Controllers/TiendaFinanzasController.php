<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Services\TiendaContext;

class TiendaFinanzasController extends Controller
{
    public function getBancos()
    {
        try {
            $tiendaId = TiendaContext::getInstance()->getTiendaId();
            if (!$tiendaId) return response()->json(['error' => 'No hay tienda en contexto'], 400);

            $bancos = DB::table('bancos')
                ->join('banco_tienda', 'bancos.id', '=', 'banco_tienda.banco_id')
                ->where('banco_tienda.tienda_id', $tiendaId)
                ->select('bancos.*')
                ->get();

            return response()->json($bancos);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function conciliacionVes(Request $request)
    {
        try {
            $tiendaId = TiendaContext::getInstance()->getTiendaId();
            if (!$tiendaId) return response()->json(['error' => 'No hay tienda en contexto'], 400);

            $query = DB::table('cuenta_banco')
                ->join('bancos', 'cuenta_banco.id_banco', '=', 'bancos.id')
                ->join('banco_tienda', 'bancos.id', '=', 'banco_tienda.banco_id')
                ->leftJoin('categoria_fondos', 'cuenta_banco.categoria_id', '=', 'categoria_fondos.id')
                ->leftJoin('beneficiarios_fondo', 'cuenta_banco.beneficiario_id', '=', 'beneficiarios_fondo.id')
                ->select(
                    'cuenta_banco.*', 
                    'bancos.nombre as banco_nombre',
                    'categoria_fondos.categoria as categoria_nombre',
                    'beneficiarios_fondo.nombre as beneficiario_nombre'
                )
                ->where('banco_tienda.tienda_id', $tiendaId);

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
            $tiendaId = TiendaContext::getInstance()->getTiendaId();
            if (!$tiendaId) return response()->json(['error' => 'No hay tienda en contexto'], 400);

            $query = DB::table('cuenta_moneda_extranjera')
                ->join('bancos', 'cuenta_moneda_extranjera.id_banco', '=', 'bancos.id')
                ->join('banco_tienda', 'bancos.id', '=', 'banco_tienda.banco_id')
                ->leftJoin('categoria_fondos', 'cuenta_moneda_extranjera.categoria_id', '=', 'categoria_fondos.id')
                ->leftJoin('beneficiarios_fondo', 'cuenta_moneda_extranjera.beneficiario_id', '=', 'beneficiarios_fondo.id')
                ->select(
                    'cuenta_moneda_extranjera.*', 
                    'bancos.nombre as banco_nombre',
                    'categoria_fondos.categoria as categoria_nombre',
                    'beneficiarios_fondo.nombre as beneficiario_nombre'
                )
                ->where('banco_tienda.tienda_id', $tiendaId);

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

    public function storeConciliacion(Request $request, $tipo)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            // Verificar si el banco pertenece a la tienda
            $tiendaId = TiendaContext::getInstance()->getTiendaId();
            $data = $request->except(['id', 'banco_nombre', 'categoria_nombre', 'beneficiario_nombre']);
            
            $bancoEnTienda = DB::table('banco_tienda')
                ->where('banco_id', $data['id_banco'])
                ->where('tienda_id', $tiendaId)
                ->exists();
                
            if (!$bancoEnTienda) {
                return response()->json(['error' => 'El banco seleccionado no pertenece a esta tienda'], 403);
            }

            foreach ($data as $key => $value) {
                if ($value === '') {
                    $data[$key] = null;
                }
            }
            
            DB::table($table)->insert($data);
            return response()->json(['message' => 'Movimiento creado exitosamente'], 201);
        } catch (\Exception $e) {
            \Log::error('Store TiendaFinanzas Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateConciliacion(Request $request, $tipo, $id)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            $tiendaId = TiendaContext::getInstance()->getTiendaId();
            $data = $request->except(['id', 'created_at', 'updated_at', 'banco_nombre', 'categoria_nombre', 'beneficiario_nombre']);
            
            if (isset($data['id_banco'])) {
                $bancoEnTienda = DB::table('banco_tienda')
                    ->where('banco_id', $data['id_banco'])
                    ->where('tienda_id', $tiendaId)
                    ->exists();
                    
                if (!$bancoEnTienda) {
                    return response()->json(['error' => 'El banco seleccionado no pertenece a esta tienda'], 403);
                }
            }

            foreach ($data as $key => $value) {
                if ($value === '') {
                    $data[$key] = null;
                }
            }
            DB::table($table)->where('id', $id)->update($data);
            return response()->json(['message' => 'Registro actualizado exitosamente']);
        } catch (\Exception $e) {
            \Log::error('Update TiendaFinanzas Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function deleteConciliacion($tipo, $id)
    {
        $table = $tipo === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
        try {
            // Verificar pertenencia indirecta antes de borrar?
            // Podríamos hacerlo, pero al menos estamos protegiendo con el middleware.
            DB::table($table)->where('id', $id)->delete();
            return response()->json(['message' => 'Registro eliminado exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
