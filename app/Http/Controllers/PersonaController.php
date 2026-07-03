<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Persona;

class PersonaController extends Controller
{
    public function index()
    {
        return response()->json(Persona::all());
    }

    public function store(Request $request)
    {
        $data = $request->except(['id', 'cargo', 'id_miembro']);
        foreach ($data as $key => $value) {
            if ($value === '') $data[$key] = null;
        }
        $persona = Persona::create($data);
        return response()->json($persona);
    }

    public function show(string $id)
    {
        return response()->json(Persona::findOrFail($id));
    }

    public function update(Request $request, string $id)
    {
        $persona = Persona::findOrFail($id);
        $data = $request->except(['cargo', 'id_miembro', 'id']);
        foreach ($data as $key => $value) {
            if ($value === '') $data[$key] = null;
        }
        $persona->update($data);
        return response()->json($persona);
    }

    public function destroy(string $id)
    {
        try {
            \Illuminate\Support\Facades\DB::transaction(function() use ($id) {
                \Illuminate\Support\Facades\DB::table('relaciones_familiares')
                    ->where('id_persona_familiar', $id)
                    ->orWhere('id_persona_titular', $id)
                    ->delete();

                \Illuminate\Support\Facades\DB::table('vinculacion')
                    ->where('id_persona', $id)
                    ->delete();

                Persona::findOrFail($id)->delete();
            });
            return response()->json(['message' => 'Deleted']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == 23503 || $e->getCode() == 23000) {
                return response()->json(['message' => 'No se puede eliminar porque la persona tiene pagos o carnets emitidos asociados.'], 422);
            }
            throw $e;
        }
    }
}
