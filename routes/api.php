<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MiembroController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\VinculacionController;
use App\Http\Controllers\DocumentoMiembroController;
use App\Http\Controllers\ObligacionesController;

Route::prefix('miembros')->group(function () {
    Route::get('/', [MiembroController::class, 'index']);
    Route::get('/{id}', [MiembroController::class, 'show']);
    Route::get('/{id}/estado-cuenta', [MiembroController::class, 'estadoCuenta']);
    Route::post('/', [MiembroController::class, 'store']);
    Route::put('/{id}', [MiembroController::class, 'update']);
    Route::delete('/{id}', [MiembroController::class, 'destroy']);
});

Route::prefix('documentos-miembros')->group(function () {
    Route::get('/{id_miembro}', [DocumentoMiembroController::class, 'index']);
    Route::post('/', [DocumentoMiembroController::class, 'store']);
    Route::delete('/{id}', [DocumentoMiembroController::class, 'destroy']);
    Route::get('/download/{id}', [DocumentoMiembroController::class, 'download']);
});

Route::prefix('facturas')->group(function () {
    Route::get('/', [FacturaController::class, 'index']);
    Route::post('/massive', [FacturaController::class, 'storeMassive']);
    Route::get('/miembro/{id}', [FacturaController::class, 'getByMiembro']);
    Route::delete('/{id}', [FacturaController::class, 'destroy']);
});

Route::prefix('personas')->group(function () {
    Route::get('/', [PersonaController::class, 'index']);
    Route::post('/', [PersonaController::class, 'store']);
    Route::put('/{id}', [PersonaController::class, 'update']);
    Route::delete('/{id}', [PersonaController::class, 'destroy']);
});

Route::prefix('vinculaciones')->group(function () {
    Route::get('/', [VinculacionController::class, 'index']);
    Route::post('/', [VinculacionController::class, 'store']);
    Route::put('/', [VinculacionController::class, 'update']);
    Route::delete('/', [VinculacionController::class, 'destroy']);
});

use App\Http\Controllers\RelacionesFamiliaresController;
Route::get('/relaciones-familiares', [RelacionesFamiliaresController::class, 'index']);

use App\Http\Controllers\PagoController;
Route::get('/pagos/init', [PagoController::class, 'init']);
Route::post('/pagos', [PagoController::class, 'store']);
Route::put('/pagos/{id}', [PagoController::class, 'update']);
Route::put('/pagos/{id}/imprimir', [PagoController::class, 'marcarImpreso']);
Route::post('/pagos/reporte-general', [\App\Http\Controllers\ExportController::class, 'reporteGeneralPagos']);
Route::put('/pagos/{id}/anular', [PagoController::class, 'anular']);
Route::delete('/pagos/{id}', [PagoController::class, 'destroy']);

use App\Http\Controllers\EntregaController;
Route::prefix('entregas')->group(function () {
    Route::get('/', [EntregaController::class, 'index']);
    Route::get('/resumen', [EntregaController::class, 'getResumen']);
    Route::post('/', [EntregaController::class, 'store']);
    Route::get('/{id}/pdf', [EntregaController::class, 'downloadPdf']);
});

use App\Http\Controllers\PagoCarnetController;
Route::get('/pagos-carnets', [PagoCarnetController::class, 'index']);
Route::post('/pagos-carnets', [PagoCarnetController::class, 'store']);

use App\Http\Controllers\FinanzasController;
Route::prefix('finanzas')->group(function () {
    Route::get('/libro/ventas/{id}', [FinanzasController::class, 'getLibroVenta']);
    Route::get('/libro/compras/{id}', [FinanzasController::class, 'getLibroCompra']);
    
    Route::get('/libro-ventas', [FinanzasController::class, 'libroVentas']);
    Route::get('/libro-compras', [FinanzasController::class, 'libroCompras']);

    Route::get('/libro-ventas/exportar', [\App\Http\Controllers\ExportController::class, 'exportarLibroVentas']);
    Route::get('/libro-compras/exportar', [\App\Http\Controllers\ExportController::class, 'exportarLibroCompras']);
    
    Route::put('/libro/{tipo}/{id}', [FinanzasController::class, 'updateLibro']);
    Route::delete('/libro/{tipo}/{id}', [FinanzasController::class, 'deleteLibro']);
    
    Route::get('/conciliacion/exportar', [\App\Http\Controllers\ExportController::class, 'exportarConciliacion']);
    Route::get('/conciliacion/ves', [FinanzasController::class, 'conciliacionVes']);
    Route::get('/conciliacion/usd', [FinanzasController::class, 'conciliacionUsd']);
    Route::put('/conciliacion/{tipo}/{id}', [FinanzasController::class, 'updateConciliacion']);
    Route::delete('/conciliacion/{tipo}/{id}', [FinanzasController::class, 'deleteConciliacion']);
    
    // Obligaciones
    Route::get('/obligaciones/config', [ObligacionesController::class, 'getConfig']);
    Route::post('/obligaciones/config', [ObligacionesController::class, 'updateConfig']);
    Route::get('/obligaciones', [ObligacionesController::class, 'index']);
    Route::post('/obligaciones', [ObligacionesController::class, 'store']);
    Route::put('/obligaciones/{id}', [ObligacionesController::class, 'update']);
    Route::delete('/obligaciones/{id}', [ObligacionesController::class, 'destroy']);
    
    Route::post('/obligaciones/{id}/abonar', [ObligacionesController::class, 'abonar']);
    Route::put('/obligaciones/abonos/{id}', [ObligacionesController::class, 'updateAbono']);
    Route::delete('/obligaciones/abonos/{id}', [ObligacionesController::class, 'destroyAbono']);
});
Route::put('/pagos-carnets/{id}', [PagoCarnetController::class, 'update']);

use App\Http\Controllers\CarnetEmitidoController;
Route::get('/carnets-emitidos', [CarnetEmitidoController::class, 'index']);
Route::post('/carnets-emitidos', [CarnetEmitidoController::class, 'store']);
Route::delete('/carnets-emitidos/{id}', [CarnetEmitidoController::class, 'destroy']);

Route::get('/carnets-emitidos/{id}/pdf', [CarnetEmitidoController::class, 'descargarPdf']);
