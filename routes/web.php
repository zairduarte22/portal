<?php

use Illuminate\Support\Facades\Route;

// Ruta 'login' nombrada para manejar casos donde el frontend no envíe Accept: application/json
// Laravel redirige aquí por defecto en middlewares de autenticación cuando falla.
Route::get('/api/unauthenticated', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/ejecutar-actualizaciones', function () {
    try {
        // 1. Ya no intentamos actualizar el trigger por DB (Error de permisos de Postgres).
        // Se manejará automáticamente desde PHP usando los eventos del modelo Factura.
        $migrateOutput = 'Omitido (Manejado por PHP)';

        // 2. Ejecutar la importación del CSV
        \Illuminate\Support\Facades\Artisan::call('app:importar-saldos-csv');
        $csvOutput = \Illuminate\Support\Facades\Artisan::output();

        // 3. Limpiar caché
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        $optimizeOutput = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'estado' => 'ÉXITO',
            'migraciones' => $migrateOutput,
            'importacion_csv' => $csvOutput,
            'optimizacion' => $optimizeOutput,
            'mensaje' => 'Puedes borrar esta ruta de routes/web.php por seguridad.'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'estado' => 'ERROR',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/importar-pagos', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('app:importar-pagos-csv');
        $output = \Illuminate\Support\Facades\Artisan::output();
        return response()->json([
            'estado' => 'ÉXITO',
            'resultado' => $output
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'estado' => 'ERROR',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/fix-secuencias', function () {
    try {
        $tablas = [
            'pagos', 'libro_ventas', 'cuenta_banco', 
            'cuenta_moneda_extranjera', 'cruces', 'obligaciones', 
            'facturas', 'miembros'
        ];
        
        $resultados = [];
        foreach ($tablas as $tabla) {
            $seq = "{$tabla}_id_seq";
            $maxId = \Illuminate\Support\Facades\DB::scalar("SELECT MAX(id) FROM $tabla");
            if ($maxId) {
                \Illuminate\Support\Facades\DB::unprepared("SELECT setval('$seq', $maxId)");
                $resultados[$tabla] = "Secuencia $seq ajustada a $maxId";
            } else {
                $resultados[$tabla] = "Tabla vacía, no se ajustó";
            }
        }

        return response()->json([
            'estado' => 'ÉXITO',
            'mensaje' => 'Secuencias reparadas correctamente',
            'detalles' => $resultados
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'estado' => 'ERROR',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/eliminar-factura-vieja', function () {
    try {
        // Establecer sin límite de tiempo por si hay muchos miembros
        set_time_limit(0);
        
        $miembros = \App\Models\Miembro::all();
        $eliminadas = 0;
        
        foreach ($miembros as $miembro) {
            $facturaVieja = \App\Models\Factura::where('id_miembro', $miembro->id)
                                               ->orderBy('id', 'asc')
                                               ->first();
            if ($facturaVieja) {
                // Eliminar primero las relaciones de pagos para evitar error de Foreign Key
                \Illuminate\Support\Facades\DB::table('vinculacion_pagos')
                    ->where('id_factura', $facturaVieja->id)
                    ->delete();

                // Al usar delete() de Eloquent, se dispara automáticamente el evento deleted 
                // que configuramos antes, recalculando el saldo y la solvencia del miembro.
                $facturaVieja->delete();
                $eliminadas++;
            }
        }
        
        return response()->json([
            'estado' => 'ÉXITO',
            'mensaje' => "Se eliminaron $eliminadas facturas más antiguas (una por miembro). Los saldos y solvencias fueron recalculados automáticamente."
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'estado' => 'ERROR',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

