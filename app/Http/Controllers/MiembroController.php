<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Miembro;
use Illuminate\Support\Facades\Hash;

class MiembroController extends Controller
{
    public function index()
    {
        return response()->json(Miembro::all());
    }

    public function store(Request $request)
    {
        $data = $request->except(['id']);
        foreach ($data as $key => $value) {
            if ($value === '') $data[$key] = null;
        }
        $miembro = Miembro::create($data);
        return response()->json($miembro);
    }

    public function show($id)
    {
        return response()->json(Miembro::findOrFail($id));
    }

    public function update(Request $request, $id)
    {
        $miembro = Miembro::findOrFail($id);
        
        $data = $request->except(['password']);
        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        foreach ($data as $key => $value) {
            if ($value === '') $data[$key] = null;
        }

        $miembro->update($data);
        return response()->json($miembro);
    }

    public function destroy($id)
    {
        Miembro::findOrFail($id)->delete();
        return response()->json(['message' => 'Deleted']);
    }

    public function estadoCuenta($id)
    {
        $facturas = \App\Models\Factura::where('id_miembro', $id)->get();
        $facturasIds = $facturas->pluck('id');
        
        $vinculacionPagos = \Illuminate\Support\Facades\DB::table('vinculacion_pagos')
            ->whereIn('id_factura', $facturasIds)
            ->get();
            
        $pagosIds = $vinculacionPagos->pluck('id_pago')->unique();
        $pagos = \App\Models\Pago::whereIn('id', $pagosIds)->get();

        return response()->json([
            'facturas' => $facturas,
            'pagos' => $pagos,
            'vinculacion_pagos' => $vinculacionPagos
        ]);
    }
}
