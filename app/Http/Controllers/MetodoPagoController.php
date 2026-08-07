<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\MetodoPago;
use Illuminate\Support\Facades\DB;

class MetodoPagoController extends Controller
{
    public function index(Request $request)
    {
        $query = MetodoPago::with('banco');
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'id_banco' => 'nullable|integer|exists:bancos,id'
        ]);

        $metodo = MetodoPago::create($request->all());
        return response()->json($metodo->load('banco'), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'id_banco' => 'nullable|integer|exists:bancos,id'
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
