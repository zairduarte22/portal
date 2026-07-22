<?php

use Illuminate\Support\Facades\Route;

// Ruta 'login' nombrada para manejar casos donde el frontend no envíe Accept: application/json
// Laravel redirige aquí por defecto en middlewares de autenticación cuando falla.
Route::get('/api/unauthenticated', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/migrar-whatsapp', function () {
    try {
        \Illuminate\Support\Facades\Artisan::call('migrate', [
            '--path' => 'database/migrations/2026_07_21_152531_create_whatsapp_logs_table.php',
            '--force' => true
        ]);
        return 'Migración de logs de WhatsApp ejecutada con éxito:<br><pre>' . \Illuminate\Support\Facades\Artisan::output() . '</pre>';
    } catch (\Exception $e) {
        return 'Error: ' . $e->getMessage();
    }
});

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

Route::get('/recalcular-existencias', function () {
    try {
        \Illuminate\Support\Facades\DB::beginTransaction();

        // 1. Restaurar todos los lotes a su cantidad original
        \Illuminate\Support\Facades\DB::statement('UPDATE lotes_tasca SET stock_actual = cantidad_comprada');

        // 2. Obtener todo el consumo historico de ventas_tasca_detalles
        $consumptions = \Illuminate\Support\Facades\DB::select("
            SELECT p.id_insumo, SUM(d.cantidad * p.medida_descuento) as total_consumed
            FROM ventas_tasca_detalles d
            JOIN productos_tasca p ON d.id_producto = p.id
            JOIN ventas_tasca v ON d.id_venta = v.id
            WHERE LOWER(v.estado) NOT IN ('anulada', 'anulado')
            GROUP BY p.id_insumo
        ");

        foreach ($consumptions as $c) {
            $insumo_id = $c->id_insumo;
            $remaining_to_consume = (float)$c->total_consumed;

            // Obtener los lotes de este insumo (FIFO - Primero en entrar, primero en salir)
            $lotes = \Illuminate\Support\Facades\DB::table('lotes_tasca')
                ->where('id_insumo', $insumo_id)
                ->orderBy('fecha_compra', 'asc')
                ->orderBy('id', 'asc')
                ->get();

            foreach ($lotes as $lote) {
                if ($remaining_to_consume <= 0) break;

                $stock = (float)$lote->stock_actual;
                if ($stock > 0) {
                    if ($stock >= $remaining_to_consume) {
                        \Illuminate\Support\Facades\DB::table('lotes_tasca')->where('id', $lote->id)->update([
                            'stock_actual' => $stock - $remaining_to_consume
                        ]);
                        $remaining_to_consume = 0;
                    } else {
                        \Illuminate\Support\Facades\DB::table('lotes_tasca')->where('id', $lote->id)->update([
                            'stock_actual' => 0
                        ]);
                        $remaining_to_consume -= $stock;
                    }
                }
            }
        }

        \Illuminate\Support\Facades\DB::commit();
        return "¡Éxito! Todas las existencias han sido recalculadas y sincronizadas con las ventas.";
    } catch (\Exception $e) {
        \Illuminate\Support\Facades\DB::rollBack();
        return "Ocurrió un error: " . $e->getMessage();
    }
});

Route::get('/aplicar-cambios', function () {
    try {
        // Ejecutar migraciones pendientes
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        $migrateOutput = \Illuminate\Support\Facades\Artisan::output();

        // Limpiar caché
        \Illuminate\Support\Facades\Artisan::call('optimize:clear');
        $optimizeOutput = \Illuminate\Support\Facades\Artisan::output();

        return response()->json([
            'success' => true,
            'message' => 'Sistema actualizado correctamente.',
            'migrate' => $migrateOutput,
            'optimize' => $optimizeOutput
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error durante la actualización.',
            'error' => $e->getMessage()
        ], 500);
    }
});

Route::get('/fix-storage', function () {
    $path = public_path('storage');
    if (is_link($path)) {
        unlink($path);
    } elseif (is_dir($path)) {
        \Illuminate\Support\Facades\File::deleteDirectory($path);
    } elseif (file_exists($path)) {
        unlink($path);
    }
    \Illuminate\Support\Facades\Artisan::call('storage:link');
    return 'Enlace de storage reparado con exito. Artisan output: ' . \Illuminate\Support\Facades\Artisan::output();
});

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
