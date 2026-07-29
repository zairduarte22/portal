<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ClienteTasca;
use App\Models\Miembro;

class ClienteTascaController extends Controller
{
    public function index()
    {
        $foraneos = ClienteTasca::orderBy('nombre', 'asc')->get();
        $miembros = Miembro::with(['persona', 'user'])->where('estatus', 'Activo')->orderBy('razon_social', 'asc')->get();

        return response()->json([
            'foraneos' => $foraneos,
            'miembros' => $miembros
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'cedula' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
        ]);

        $cliente = ClienteTasca::create($request->only('nombre', 'cedula', 'telefono'));

        return response()->json($cliente, 201);
    }

    public function update(Request $request, $id)
    {
        $cliente = ClienteTasca::findOrFail($id);

        $request->validate([
            'nombre' => 'required|string|max:255',
            'cedula' => 'nullable|string|max:50',
            'telefono' => 'nullable|string|max:50',
        ]);

        $cliente->update($request->only('nombre', 'cedula', 'telefono'));

        return response()->json($cliente);
    }

    public function destroy($id)
    {
        $cliente = ClienteTasca::findOrFail($id);
        $cliente->delete();

        return response()->json(['message' => 'Cliente eliminado con éxito']);
    }
}
