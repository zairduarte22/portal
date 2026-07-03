<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VinculacionController extends Controller
{
    public function index()
    {
        $vinculaciones = DB::table('vinculacion')->get();
        // Cast boolean values since SQLite/Postgres might return ints/strings
        $mapped = $vinculaciones->map(function ($v) {
            return [
                'id_miembro' => $v->id_miembro,
                'id_persona' => $v->id_persona,
                'representante' => (bool) $v->representante,
                'director' => (bool) $v->director,
                'accionista' => (bool) $v->accionista,
                'presidente' => (bool) ($v->presidente ?? false),
            ];
        });
        return response()->json($mapped);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_miembro' => 'required|integer',
            'id_persona' => 'required|integer',
            'representante' => 'boolean',
            'director' => 'boolean',
            'accionista' => 'boolean',
            'presidente' => 'boolean',
            'parentesco' => 'nullable|string',
            'id_persona_titular' => 'nullable|integer',
        ]);

        DB::transaction(function () use ($data) {
            if ($data['presidente'] ?? false) {
                DB::table('vinculacion')
                    ->where('id_miembro', $data['id_miembro'])
                    ->update(['presidente' => false]);
            }

            DB::table('vinculacion')->updateOrInsert(
                ['id_miembro' => $data['id_miembro'], 'id_persona' => $data['id_persona']],
                [
                    'representante' => $data['representante'] ?? false,
                    'director' => $data['director'] ?? false,
                    'accionista' => $data['accionista'] ?? false,
                    'presidente' => $data['presidente'] ?? false,
                ]
            );

            // Handle parentesco in relaciones_familiares
            if ($data['accionista'] ?? false) {
                DB::table('relaciones_familiares')
                    ->where('id_persona_familiar', $data['id_persona'])
                    ->delete();
            } else {
                DB::table('relaciones_familiares')
                    ->where('id_persona_familiar', $data['id_persona'])
                    ->delete();
                    
                if (!empty($data['parentesco']) && $data['parentesco'] !== 'Ninguno' && !empty($data['id_persona_titular'])) {
                    DB::table('relaciones_familiares')->insert([
                        'id_persona_familiar' => $data['id_persona'],
                        'id_persona_titular' => $data['id_persona_titular'],
                        'parentesco' => $data['parentesco']
                    ]);
                }
            }

        });

        return response()->json($data);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'id_miembro' => 'required|integer',
            'id_persona' => 'required|integer',
            'representante' => 'boolean',
            'director' => 'boolean',
            'accionista' => 'boolean',
            'presidente' => 'boolean',
            'parentesco' => 'nullable|string',
            'id_persona_titular' => 'nullable|integer',
        ]);

        DB::transaction(function () use ($data) {
            if ($data['presidente'] ?? false) {
                DB::table('vinculacion')
                    ->where('id_miembro', $data['id_miembro'])
                    ->update(['presidente' => false]);
            }

            DB::table('vinculacion')
                ->where('id_miembro', $data['id_miembro'])
                ->where('id_persona', $data['id_persona'])
                ->update([
                    'representante' => $data['representante'] ?? false,
                    'director' => $data['director'] ?? false,
                    'accionista' => $data['accionista'] ?? false,
                    'presidente' => $data['presidente'] ?? false,
                ]);

            // Handle parentesco in relaciones_familiares
            if ($data['accionista'] ?? false) {
                DB::table('relaciones_familiares')
                    ->where('id_persona_familiar', $data['id_persona'])
                    ->delete();
            } else {
                DB::table('relaciones_familiares')
                    ->where('id_persona_familiar', $data['id_persona'])
                    ->delete();
                    
                if (!empty($data['parentesco']) && $data['parentesco'] !== 'Ninguno' && !empty($data['id_persona_titular'])) {
                    DB::table('relaciones_familiares')->insert([
                        'id_persona_familiar' => $data['id_persona'],
                        'id_persona_titular' => $data['id_persona_titular'],
                        'parentesco' => $data['parentesco']
                    ]);
                }
            }

        });

        return response()->json($data);
    }

    public function destroy(Request $request)
    {
        $id_miembro = $request->input('id_miembro');
        $id_persona = $request->input('id_persona');
        
        if ($id_miembro && $id_persona) {
            DB::table('vinculacion')
                ->where('id_miembro', $id_miembro)
                ->where('id_persona', $id_persona)
                ->delete();
        }

        return response()->json(['message' => 'Deleted']);
    }
}
