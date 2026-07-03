<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

DB::transaction(function () {
    $miembros = DB::table('miembros')->pluck('id');
    $count = 0;

    foreach ($miembros as $miembroId) {
        // Find the accionista for this miembro
        $accionista = DB::table('vinculacion')
            ->where('id_miembro', $miembroId)
            ->where('accionista', true)
            ->first();

        if (!$accionista) {
            continue; // Skip if no accionista
        }

        // Find non-accionistas for this miembro
        $familiares = DB::table('vinculacion')
            ->where('id_miembro', $miembroId)
            ->where('accionista', false)
            ->get();

        foreach ($familiares as $familiar) {
            // Insert into relaciones_familiares
            // We use insertOrIgnore or check if exists to avoid duplicates
            $exists = DB::table('relaciones_familiares')
                ->where('id_persona_titular', $accionista->id_persona)
                ->where('id_persona_familiar', $familiar->id_persona)
                ->exists();

            if (!$exists) {
                // Get the next id
                $maxId = DB::table('relaciones_familiares')->max('id');
                $nextId = $maxId ? $maxId + 1 : 1;

                DB::table('relaciones_familiares')->insert([
                    'id' => $nextId,
                    'id_persona_titular' => $accionista->id_persona,
                    'id_persona_familiar' => $familiar->id_persona,
                    'parentesco' => 'Otro'
                ]);
                $count++;
            }
        }
    }

    echo "Migrated $count family relationships successfully.\n";
});
