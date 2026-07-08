<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\GastoTasca;
use App\Models\ProveedorTasca;
use Carbon\Carbon;

class TascaGastosController extends Controller
{
    public function getProveedores()
    {
        return response()->json(ProveedorTasca::orderBy('nombre')->get());
    }

    public function storeProveedor(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'identificacion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
        ]);

        $prov = ProveedorTasca::create($request->all());
        return response()->json($prov, 201);
    }

    public function updateProveedor(Request $request, $id)
    {
        $prov = ProveedorTasca::findOrFail($id);
        $request->validate([
            'nombre' => 'required|string',
            'identificacion' => 'nullable|string',
            'telefono' => 'nullable|string',
            'direccion' => 'nullable|string',
        ]);

        $prov->update($request->all());
        return response()->json($prov);
    }

    public function destroyProveedor($id)
    {
        $prov = ProveedorTasca::findOrFail($id);
        $prov->delete();
        return response()->json(['message' => 'Proveedor eliminado']);
    }

    public function getGastos(Request $request)
    {
        $query = GastoTasca::with('proveedor', 'compra')->orderBy('fecha', 'desc')->orderBy('created_at', 'desc');
        
        if ($request->has('start_date') && $request->has('end_date')) {
            $query->whereBetween('fecha', [$request->start_date, $request->end_date]);
        }
        
        return response()->json($query->get());
    }

    public function storeGasto(Request $request)
    {
        $request->validate([
            'categoria' => 'required|string',
            'descripcion' => 'required|string',
            'monto_usd' => 'required|numeric|min:0',
            'monto_bs' => 'nullable|numeric|min:0',
            'metodo_pago' => 'required|string',
            'referencia_pago' => 'nullable|string',
            'fecha' => 'required|date',
            'proveedor_id' => 'nullable|exists:proveedores_tasca,id',
            'compra_id' => 'nullable|exists:compras_tasca,id'
        ]);

        $gasto = GastoTasca::create($request->all());
        return response()->json($gasto->load('proveedor', 'compra'), 201);
    }

    public function updateGasto(Request $request, $id)
    {
        $gasto = GastoTasca::findOrFail($id);
        $request->validate([
            'categoria' => 'required|string',
            'descripcion' => 'required|string',
            'monto_usd' => 'required|numeric|min:0',
            'monto_bs' => 'nullable|numeric|min:0',
            'metodo_pago' => 'required|string',
            'referencia_pago' => 'nullable|string',
            'fecha' => 'required|date',
            'proveedor_id' => 'nullable|exists:proveedores_tasca,id',
            'compra_id' => 'nullable|exists:compras_tasca,id'
        ]);

        $gasto->update($request->all());
        return response()->json($gasto->load('proveedor', 'compra'));
    }

    public function destroyGasto($id)
    {
        $gasto = GastoTasca::findOrFail($id);
        $gasto->delete();
        return response()->json(['message' => 'Gasto eliminado']);
    }
}
