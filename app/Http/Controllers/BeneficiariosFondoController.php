<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\BeneficiarioFondo;

class BeneficiariosFondoController extends Controller
{
    public function index()
    {
        return response()->json(BeneficiarioFondo::orderBy('nombre')->get());
    }

    public function store(Request $request)
    {
        $request->validate(['nombre' => 'required|string']);
        $beneficiario = BeneficiarioFondo::firstOrCreate(['nombre' => $request->nombre]);
        return response()->json($beneficiario, 201);
    }

    public function destroy($id)
    {
        $beneficiario = BeneficiarioFondo::findOrFail($id);
        $beneficiario->delete();
        return response()->json(['message' => 'Eliminado exitosamente']);
    }
}
