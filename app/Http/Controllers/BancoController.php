<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BancoController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Banco::with('tiendas');
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string',
            'para_membresias' => 'boolean',
            'tiendas' => 'array'
        ]);

        $banco = \App\Models\Banco::create([
            'nombre' => $request->nombre,
            'titular' => $request->titular,
            'divisa' => $request->divisa,
            'propietario' => 'MIXTO', // maintained for backward compatibility
            'para_membresias' => $request->para_membresias ?? false
        ]);

        if (isset($request->tiendas)) {
            $banco->tiendas()->sync($request->tiendas);
        }

        return response()->json($banco->load('tiendas'), 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string',
            'para_membresias' => 'boolean',
            'tiendas' => 'array'
        ]);

        $banco = \App\Models\Banco::findOrFail($id);
        $banco->update([
            'nombre' => $request->nombre,
            'titular' => $request->titular,
            'divisa' => $request->divisa,
            'para_membresias' => $request->para_membresias ?? false
        ]);

        if (isset($request->tiendas)) {
            $banco->tiendas()->sync($request->tiendas);
        }

        return response()->json($banco->load('tiendas'));
    }

    public function destroy($id)
    {
        $banco = \App\Models\Banco::findOrFail($id);
        $banco->delete();
        return response()->json(['message' => 'Eliminado exitosamente']);
    }
}
