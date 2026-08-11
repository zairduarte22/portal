<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TiendaConfigController extends Controller
{
    public function index()
    {
        $tiendas = DB::table('tiendas')->get();
        return response()->json($tiendas);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tiendas,slug',
            'tipo_negocio' => 'required|in:restaurante_bar,tienda_general',
            'activa' => 'required|boolean'
        ]);

        $id = DB::table('tiendas')->insertGetId([
            'nombre' => $request->nombre,
            'slug' => $request->slug,
            'tipo_negocio' => $request->tipo_negocio,
            'activa' => $request->activa,
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Tienda creada exitosamente'], 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:tiendas,slug,'.$id,
            'tipo_negocio' => 'required|in:restaurante_bar,tienda_general',
            'activa' => 'required|boolean'
        ]);

        DB::table('tiendas')->where('id', $id)->update([
            'nombre' => $request->nombre,
            'slug' => $request->slug,
            'tipo_negocio' => $request->tipo_negocio,
            'activa' => $request->activa,
            'updated_at' => Carbon::now(),
        ]);

        return response()->json(['message' => 'Tienda actualizada exitosamente']);
    }

    public function destroy($id)
    {
        DB::table('tiendas')->where('id', $id)->delete();
        return response()->json(['message' => 'Tienda eliminada exitosamente']);
    }
}
