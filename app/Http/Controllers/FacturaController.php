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
                // Prevenir duplicados: si ya existe una factura para este mes, la saltamos
                if (Factura::where('id_miembro', $id_miembro)->where('mes_cuota', $request->mes_cuota)->exists()) {
                    continue;
                }

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

    public function storeAdelantos(Request $request)
    {
        $request->validate([
            'id_miembro' => 'required|exists:miembros,id',
            'cantidad_meses' => 'required|integer|min:1|max:48',
        ]);

        $facturasGeneradas = [];
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            // Encontrar la última factura del miembro para saber desde qué mes arrancar
            $ultimaFactura = Factura::where('id_miembro', $request->id_miembro)
                                    ->orderBy('mes_cuota', 'desc')
                                    ->first();

            if ($ultimaFactura) {
                // Arrancamos desde el mes siguiente a la última factura
                $fechaInicio = \Carbon\Carbon::parse($ultimaFactura->mes_cuota)->addMonth();
            } else {
                // Si no tiene facturas (ej. migrado solvente), empezamos desde el MES SIGUIENTE al actual
                $fechaInicio = \Carbon\Carbon::now()->addMonth()->startOfMonth();
            }

            for ($i = 0; $i < $request->cantidad_meses; $i++) {
                $mesCuota = $fechaInicio->copy()->addMonths($i)->toDateString();
                
                // Usar firstOrCreate para evitar duplicados si el usuario hace doble clic rápido (race condition)
                $factura = Factura::firstOrCreate(
                    [
                        'id_miembro' => $request->id_miembro,
                        'mes_cuota' => $mesCuota,
                    ],
                    [
                        'monto' => 25, // Monto base estándar de la cuota
                        'pendiente' => 25,
                        'fecha' => \Carbon\Carbon::now()->toDateString(), // Fecha de emisión hoy
                    ]
                );

                if ($factura->wasRecentlyCreated) {
                    $facturasGeneradas[] = $factura;
                }
            }

            if (count($facturasGeneradas) > 0) {
                // El saldo se actualiza automáticamente con el evento del modelo, pero forzamos uno al final
                $facturasGeneradas[0]->miembro->actualizarSaldoPendiente();
            }

            \Illuminate\Support\Facades\DB::commit();
            
            // Retornamos las facturas generadas
            return response()->json([
                'message' => 'Adelantos generados', 
                'facturas' => Factura::whereIn('id', collect($facturasGeneradas)->pluck('id'))->get()
            ], 201);
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
