<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProveedorController extends Controller
{
    public function index()
    {
        $proveedores = DB::table('proveedor')->orderBy('razon_social', 'asc')->get();
        return response()->json($proveedores);
    }

    public function store(Request $request)
    {
        $request->validate([
            'razon_social' => 'required|string|max:255',
            'rif' => 'nullable|string|max:50',
        ]);

        $id = DB::table('proveedor')->insertGetId([
            'razon_social' => $request->razon_social,
            'rif' => $request->rif,
        ]);

        return response()->json(['id' => $id, 'message' => 'Proveedor creado correctamente'], 201);
    }

    public function destroy($id)
    {
        DB::table('proveedor')->where('id', $id)->delete();
        return response()->json(['message' => 'Proveedor eliminado correctamente']);
    }
}
