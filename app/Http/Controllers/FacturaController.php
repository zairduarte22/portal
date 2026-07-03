<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Factura;

class FacturaController extends Controller
{
    public function index()
    {
        return response()->json(Factura::with('miembro')->get());
    }

    public function getByMiembro($id_miembro)
    {
        return response()->json(Factura::where('id_miembro', $id_miembro)->get());
    }

    public function storeMassive(Request $request)
    {
        $request->validate([
            'miembro_ids' => 'required|array',
            'monto' => 'required|numeric',
            'mes_cuota' => 'required|date',
            'fecha' => 'required|date',
        ]);

        $facturas = [];
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            foreach ($request->miembro_ids as $id_miembro) {
                $factura = Factura::create([
                    'id_miembro' => $id_miembro,
                    'monto' => $request->monto,
                    'pendiente' => $request->monto,
                    'mes_cuota' => $request->mes_cuota,
                    'fecha' => $request->fecha,
                ]);
                $facturas[] = $factura;

                $factura->miembro->actualizarSaldoPendiente();
            }
            \Illuminate\Support\Facades\DB::commit();
            return response()->json(['message' => 'Facturas creadas exitosamente', 'facturas' => $facturas], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $factura = Factura::findOrFail($id);
            $miembro = $factura->miembro;
            
            // Delete the invoice (if it has payments, a foreign key constraint might throw, which is desired to prevent deleting paid invoices)
            $factura->delete();
            
            // Update the member's balance
            if ($miembro) {
                $miembro->actualizarSaldoPendiente();
            }
            
            return response()->json(['message' => 'Factura eliminada']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23503 || $e->getCode() == 23000) {
                return response()->json(['message' => 'No se puede eliminar la factura porque tiene pagos asociados.'], 422);
            }
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
