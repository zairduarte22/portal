<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MetodoPago;
use Illuminate\Support\Facades\DB;

class MetodoPagoController extends Controller
{
    public function index(Request $request)
    {
        $propietario = $request->query('propietario');
        $query = MetodoPago::with('banco');
        if ($propietario) {
            $query->where('propietario', $propietario);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'id_banco' => 'nullable|integer|exists:bancos,id',
            'propietario' => 'required|string'
        ]);

        $metodo = MetodoPago::create($request->all());
        return response()->json($metodo->load('banco'), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'id_banco' => 'nullable|integer|exists:bancos,id',
            'propietario' => 'required|string'
        ]);

        $metodo = MetodoPago::findOrFail($id);
        $metodo->update($request->all());
        return response()->json($metodo->load('banco'));
    }

    public function destroy($id)
    {
        MetodoPago::destroy($id);
        return response()->json(['message' => 'Eliminado exitosamente']);
    }
}
