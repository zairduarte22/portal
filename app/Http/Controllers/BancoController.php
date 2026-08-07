<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BancoController extends Controller
{
    public function index(Request $request)
    {
        $propietario = $request->query('propietario');
        $query = DB::table('bancos');
        if ($propietario) {
            $query->where('propietario', $propietario);
        }
        return response()->json($query->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string',
            'propietario' => 'required|string'
        ]);

        $id = DB::table('bancos')->insertGetId($request->all());
        $banco = DB::table('bancos')->where('id', $id)->first();
        return response()->json($banco, 201);
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'nombre' => 'required|string',
            'titular' => 'required|string',
            'divisa' => 'required|string',
            'propietario' => 'required|string'
        ]);

        DB::table('bancos')->where('id', $id)->update($request->all());
        $banco = DB::table('bancos')->where('id', $id)->first();
        return response()->json($banco);
    }

    public function destroy($id)
    {
        DB::table('bancos')->where('id', $id)->delete();
        return response()->json(['message' => 'Eliminado exitosamente']);
    }
}
