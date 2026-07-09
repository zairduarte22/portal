<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MiembroController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\VinculacionController;
use App\Http\Controllers\DocumentoMiembroController;
use App\Http\Controllers\ObligacionesController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\RelacionesFamiliaresController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\EntregaController;
use App\Http\Controllers\PagoCarnetController;
use App\Http\Controllers\FinanzasController;
use App\Http\Controllers\CarnetEmitidoController;
use App\Http\Controllers\TascaController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [ConfiguracionController::class, 'getUsuarios']);
        Route::post('/', [ConfiguracionController::class, 'storeUsuario']);
        Route::put('/{id}', [ConfiguracionController::class, 'updateUsuario']);
        Route::delete('/{id}', [ConfiguracionController::class, 'destroyUsuario']);
    });

    Route::prefix('miembros')->group(function () {
        Route::get('/', [MiembroController::class, 'index']);
        Route::get('/{id}', [MiembroController::class, 'show']);
    Route::get('/{id}/estado-cuenta', [MiembroController::class, 'estadoCuenta']);
    Route::get('/{id}/tasca-creditos', [\App\Http\Controllers\TascaController::class, 'getCreditosMiembro']);
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


Route::get('/relaciones-familiares', [RelacionesFamiliaresController::class, 'index']);


Route::get('/pagos/init', [PagoController::class, 'init']);
Route::post('/pagos', [PagoController::class, 'store']);
Route::put('/pagos/{id}', [PagoController::class, 'update']);
Route::put('/pagos/{id}/imprimir', [PagoController::class, 'marcarImpreso']);
Route::post('/pagos/reporte-general', [\App\Http\Controllers\ExportController::class, 'reporteGeneralPagos']);
Route::put('/pagos/{id}/anular', [PagoController::class, 'anular']);
Route::delete('/pagos/{id}', [PagoController::class, 'destroy']);


Route::prefix('entregas')->group(function () {
    Route::get('/', [EntregaController::class, 'index']);
    Route::get('/resumen', [EntregaController::class, 'getResumen']);
    Route::post('/', [EntregaController::class, 'store']);
    Route::get('/{id}/pdf', [EntregaController::class, 'downloadPdf']);
});


Route::get('/pagos-carnets', [PagoCarnetController::class, 'index']);
Route::post('/pagos-carnets', [PagoCarnetController::class, 'store']);


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


Route::get('/carnets-emitidos', [CarnetEmitidoController::class, 'index']);
Route::post('/carnets-emitidos', [CarnetEmitidoController::class, 'store']);
Route::delete('/carnets-emitidos/{id}', [CarnetEmitidoController::class, 'destroy']);

Route::get('/carnets-emitidos/{id}/pdf', [CarnetEmitidoController::class, 'descargarPdf']);

// ==========================================
// MÓDULOS DE TASCA (Gestión y Ventas)
// ==========================================

Route::prefix('tasca')->group(function () {
    // Productos
    Route::get('/productos', [TascaController::class, 'getProductos']);
    Route::post('/productos', [TascaController::class, 'storeProducto']);
    Route::put('/productos/{id}', [TascaController::class, 'updateProducto']);
    Route::delete('/productos/{id}', [TascaController::class, 'destroyProducto']);
    Route::post('/productos-completos', [\App\Http\Controllers\InventarioTascaController::class, 'storeProductoCompleto']);
    
    // Clientes
    Route::get('/clientes', [TascaController::class, 'getClientes']);
    Route::post('/clientes', [TascaController::class, 'storeCliente']);
    
    // Ventas
    Route::get('/ventas', [TascaController::class, 'getVentas']);
    Route::get('/ventas/estadisticas', [TascaController::class, 'getEstadisticas']);
    Route::get('/ventas/reporte-pdf', [TascaController::class, 'reporteVentasPdf']);
    Route::get('/ventas/reporte-data', [TascaController::class, 'reporteVentasData']);
    Route::get('/ventas/{id}', [TascaController::class, 'getVenta']);
    Route::get('/ventas/{id}/ticket', [TascaController::class, 'ticketVentaPdf']);
    Route::post('/ventas', [TascaController::class, 'storeVenta']);
    Route::put('/ventas/{id}/detalles', [TascaController::class, 'updateVentaDetalles']);
    Route::post('/ventas/{id}/pagar', [TascaController::class, 'pagarVenta']);
    Route::post('/ventas/{id}/anular', [TascaController::class, 'anularVenta']);

    // Inventario Avanzado (Insumos y Lotes)
    Route::get('/insumos', [\App\Http\Controllers\InventarioTascaController::class, 'getInsumos']);
    Route::get('/insumos/reporte', [\App\Http\Controllers\InventarioTascaController::class, 'reporteInventario']);
    Route::post('/insumos', [\App\Http\Controllers\InventarioTascaController::class, 'storeInsumo']);
    Route::put('/insumos/{id}', [\App\Http\Controllers\InventarioTascaController::class, 'updateInsumo']);
    Route::delete('/insumos/{id}', [\App\Http\Controllers\InventarioTascaController::class, 'destroyInsumo']);
    Route::post('/productos-completos', [\App\Http\Controllers\InventarioTascaController::class, 'storeProductoCompleto']);
    Route::put('/productos-completos/{id}', [\App\Http\Controllers\InventarioTascaController::class, 'updateProductoCompleto']);
    Route::get('/compras', [\App\Http\Controllers\InventarioTascaController::class, 'getCompras']);
    Route::post('/compras', [\App\Http\Controllers\InventarioTascaController::class, 'storeCompra']);
    Route::post('/compras/{id}/anular', [\App\Http\Controllers\InventarioTascaController::class, 'anularCompra']);
    
    Route::get('/insumos/{id_insumo}/lotes', [\App\Http\Controllers\InventarioTascaController::class, 'getLotes']);
    Route::post('/lotes', [\App\Http\Controllers\InventarioTascaController::class, 'storeLote']);
    Route::put('/lotes/{id}', [\App\Http\Controllers\InventarioTascaController::class, 'updateLote']);
    Route::delete('/lotes/{id}', [\App\Http\Controllers\InventarioTascaController::class, 'destroyLote']);

    // Proveedores y Gastos
    Route::get('/proveedores', [\App\Http\Controllers\TascaGastosController::class, 'getProveedores']);
    Route::post('/proveedores', [\App\Http\Controllers\TascaGastosController::class, 'storeProveedor']);
    Route::put('/proveedores/{id}', [\App\Http\Controllers\TascaGastosController::class, 'updateProveedor']);
    Route::delete('/proveedores/{id}', [\App\Http\Controllers\TascaGastosController::class, 'destroyProveedor']);

    Route::get('/gastos', [\App\Http\Controllers\TascaGastosController::class, 'getGastos']);
    Route::post('/gastos', [\App\Http\Controllers\TascaGastosController::class, 'storeGasto']);
    Route::put('/gastos/{id}', [\App\Http\Controllers\TascaGastosController::class, 'updateGasto']);
    Route::delete('/gastos/{id}', [\App\Http\Controllers\TascaGastosController::class, 'destroyGasto']);

    Route::post('/compras/{id}/pagar', [\App\Http\Controllers\InventarioTascaController::class, 'pagarCompra']);
});

});
