<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BancoController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\Banco::query();
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string'
        ]);

        $banco = \App\Models\Banco::create([
            'nombre' => $request->nombre,
            'titular' => $request->titular,
            'divisa' => $request->divisa
        ]);

        return response()->json($banco, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string'
        ]);

        $banco = \App\Models\Banco::findOrFail($id);
        $banco->update([
            'nombre' => $request->nombre,
            'titular' => $request->titular,
            'divisa' => $request->divisa
        ]);

        return response()->json($banco);
    }

    public function destroy($id)
    {
        $banco = \App\Models\Banco::findOrFail($id);
        $banco->delete();
        return response()->json(['message' => 'Eliminado exitosamente']);
    }
}
