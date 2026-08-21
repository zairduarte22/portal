<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tienda;

class TiendaConfigController extends Controller
{
    public function index()
    {
        $tiendas = Tienda::with('bancos')->get()->map(function($tienda) {
            $bancosIds = $tienda->bancos->pluck('id')->toArray();
            $tienda->unsetRelation('bancos'); // Remove the loaded relation
            $tienda->bancos_ids = $bancosIds;
            $tienda->bancos = $bancosIds; // Now it sets the attribute cleanly as an array of IDs
            return $tienda;
        });
        return response()->json($tiendas);
    }

    public function getBySlug($slug)
    {
        $tienda = Tienda::with('bancos')->where('slug', $slug)->firstOrFail();
        $bancosIds = $tienda->bancos->pluck('id')->toArray();
        $tienda->unsetRelation('bancos');
        $tienda->bancos_ids = $bancosIds;
        $tienda->bancos = $bancosIds;
        return response()->json($tienda);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tiendas,slug',
            'tipo_negocio' => 'required|in:restaurante_bar,tienda_general',
            'activa' => 'required|boolean',
            'bancos' => 'nullable|array'
        ]);

        $tienda = new Tienda();
        $tienda->nombre = $request->nombre;
        $tienda->slug = $request->slug;
        $tienda->tipo_negocio = $request->tipo_negocio;
        $tienda->activa = $request->activa;
        $tienda->save();

        if ($request->has('bancos')) {
            $tienda->bancos()->sync($request->bancos);
        }

        return response()->json(['message' => 'Tienda creada exitosamente'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tiendas,slug,'.$id,
            'tipo_negocio' => 'required|in:restaurante_bar,tienda_general',
            'activa' => 'required|boolean',
            'bancos' => 'nullable|array'
        ]);

        $tienda = Tienda::findOrFail($id);
        $tienda->nombre = $request->nombre;
        $tienda->slug = $request->slug;
        $tienda->tipo_negocio = $request->tipo_negocio;
        $tienda->activa = $request->activa;
        $tienda->save();

        if ($request->has('bancos')) {
            $tienda->bancos()->sync($request->bancos);
        }

        return response()->json(['message' => 'Tienda actualizada exitosamente']);
    }

    public function destroy($id)
    {
        $tienda = Tienda::findOrFail($id);
        $tienda->delete();
        return response()->json(['message' => 'Tienda eliminada exitosamente']);
    }
}
