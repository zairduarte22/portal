<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CategoriaFondo;

class CategoriasFondoController extends Controller
{
    public function index()
    {
        return response()->json(CategoriaFondo::all());
    }

    public function store(Request $request)
    {
        $request->validate([
            'categoria' => 'required|string|max:255',
        ]);

        $categoria = CategoriaFondo::create([
            'categoria' => $request->categoria
        ]);

        return response()->json($categoria, 201);
    }

    public function destroy($id)
    {
        try {
            CategoriaFondo::findOrFail($id)->delete();
            return response()->json(['message' => 'Categoría eliminada']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se puede eliminar la categoría.'], 500);
        }
    }
}
