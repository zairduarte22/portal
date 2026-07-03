<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\PagoCarnet;
use App\Models\Miembro;
use Illuminate\Support\Facades\DB;

class PagoCarnetController extends Controller
{
    public function index()
    {
        return PagoCarnet::with('miembro')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_miembro' => 'required|integer|exists:miembros,id',
            'fecha' => 'required|date',
            'monto' => 'required|numeric',
            'monto_bs' => 'required|numeric',
            'tasa_cambio' => 'required|numeric',
            'precio_unitario' => 'required|numeric',
            'metodo_pago' => 'required|string',
            'referencia' => 'nullable|string',
            'cantidad_carnets' => 'required|integer|min:1',
            'estado' => 'nullable|string',
        ]);

        $pago = PagoCarnet::create($data);

        // Si se crea como Aprobado, sumamos los carnets al miembro
        if ($pago->estado === 'Aprobado') {
            $miembro = Miembro::find($pago->id_miembro);
            if ($miembro) {
                $miembro->increment('carnets_disponibles', $pago->cantidad_carnets);
            }
        }

        return response()->json($pago, 201);
    }

    public function update(Request $request, $id)
    {
        $pago = PagoCarnet::findOrFail($id);
        $oldEstado = $pago->estado;
        
        $pago->update($request->all());

        // Manejar cambios de estado para sumar o restar carnets
        if ($oldEstado !== 'Aprobado' && $pago->estado === 'Aprobado') {
            $miembro = Miembro::find($pago->id_miembro);
            if ($miembro) {
                $miembro->increment('carnets_disponibles', $pago->cantidad_carnets);
            }
        } elseif ($oldEstado === 'Aprobado' && $pago->estado !== 'Aprobado') {
            $miembro = Miembro::find($pago->id_miembro);
            if ($miembro) {
                $miembro->decrement('carnets_disponibles', $pago->cantidad_carnets);
            }
        }

        return response()->json($pago);
    }
}
