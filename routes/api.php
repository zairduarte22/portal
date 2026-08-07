<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MiembroController;
use App\Http\Controllers\FacturaController;
use App\Http\Controllers\PersonaController;
use App\Http\Controllers\VinculacionController;
use App\Http\Controllers\DocumentoMiembroController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\ObligacionesController;

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ConfiguracionController;
use App\Http\Controllers\RelacionesFamiliaresController;
use App\Http\Controllers\PagoController;
use App\Http\Controllers\EntregaController;
use App\Http\Controllers\PagoCarnetController;
use App\Http\Controllers\FinanzasController;
use App\Http\Controllers\CarnetEmitidoController;
use App\Http\Controllers\TiendaController;
use App\Http\Controllers\CobranzaController;
use App\Http\Controllers\ExportController;
use App\Http\Controllers\CategoriasFondoController;
use App\Http\Controllers\BeneficiariosFondoController;
use App\Http\Controllers\BancoController;
use App\Http\Controllers\MetodoPagoController;

Route::post('/login', [AuthController::class, 'login']);
Route::get('/carnets/public/{id}', [CarnetEmitidoController::class, 'showPublic']);
Route::get('/tienda/menu-publico', [TiendaController::class, 'getMenuPublico']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    
    Route::prefix('usuarios')->group(function () {
        Route::get('/', [ConfiguracionController::class, 'getUsuarios']);
        Route::post('/', [ConfiguracionController::class, 'storeUsuario']);
        Route::put('/{id}', [ConfiguracionController::class, 'updateUsuario']);
        Route::delete('/{id}', [ConfiguracionController::class, 'destroyUsuario']);
    });
    
    Route::prefix('configuraciones')->group(function () {
        Route::get('/general', [ConfiguracionController::class, 'getGeneralConfigs']);
        Route::post('/general', [ConfiguracionController::class, 'updateGeneralConfigs']);
    });

    Route::prefix('miembros')->group(function () {
        Route::get('/', [MiembroController::class, 'index']);
        Route::get('/{id}', [MiembroController::class, 'show']);
    Route::get('/{id}/estado-cuenta', [MiembroController::class, 'estadoCuenta']);
    Route::get('/{id}/tienda-creditos', [\App\Http\Controllers\TiendaController::class, 'getCreditosMiembro']);
    Route::post('/', [MiembroController::class, 'store']);
    Route::put('/{id}', [MiembroController::class, 'update']);
    Route::delete('/{id}', [MiembroController::class, 'destroy']);
    });
    
    Route::post('/cobranzas/enviar-masivo', [CobranzaController::class, 'enviarMasivo']);
    Route::get('/cobranzas/logs', [CobranzaController::class, 'getLogs']);
    Route::get('/cobranzas/logs/recientes', [CobranzaController::class, 'getLogsRecientes']);

Route::prefix('documentos-miembros')->group(function () {
    Route::get('/{id_miembro}', [DocumentoMiembroController::class, 'index']);
    Route::post('/', [DocumentoMiembroController::class, 'store']);
    Route::delete('/{id}', [DocumentoMiembroController::class, 'destroy']);
    Route::get('/download/{id}', [DocumentoMiembroController::class, 'download']);
});

Route::prefix('facturas')->group(function () {
    Route::get('/', [FacturaController::class, 'index']);
    Route::post('/massive', [FacturaController::class, 'storeMassive']);
    Route::post('/adelantos', [FacturaController::class, 'storeAdelantos']);
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
Route::get('/pagos/exportar/general', [ExportController::class, 'reporteGeneralPagos']);
Route::get('/pagos/exportar/general/json', [ExportController::class, 'reporteGeneralPagosJson']);
Route::put('/pagos/{id}/anular', [PagoController::class, 'anular']);
Route::delete('/pagos/{id}', [PagoController::class, 'destroy']);


Route::prefix('entregas')->group(function () {
    Route::get('/', [EntregaController::class, 'index']);
    Route::get('/resumen', [EntregaController::class, 'getResumen']);
    Route::post('/', [EntregaController::class, 'store']);
    Route::get('/{id}', [EntregaController::class, 'show']);
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
    
    Route::post('/libro/{tipo}', [FinanzasController::class, 'storeLibro']);
    Route::put('/libro/{tipo}/{id}', [FinanzasController::class, 'updateLibro']);
    Route::delete('/libro/{tipo}/{id}', [FinanzasController::class, 'deleteLibro']);
    
    Route::get('/conciliacion/exportar', [\App\Http\Controllers\ExportController::class, 'exportarConciliacion']);
    Route::get('/conciliacion/ves', [FinanzasController::class, 'conciliacionVes']);
    Route::get('/conciliacion/usd', [FinanzasController::class, 'conciliacionUsd']);
    Route::post('/conciliacion/{tipo}', [FinanzasController::class, 'storeConciliacion']);
    Route::put('/conciliacion/{tipo}/{id}', [FinanzasController::class, 'updateConciliacion']);
    Route::delete('/conciliacion/{tipo}/{id}', [FinanzasController::class, 'deleteConciliacion']);
    
    // Proveedores para Libros Contables
    Route::get('/proveedores', [ProveedorController::class, 'index']);
    Route::post('/proveedores', [ProveedorController::class, 'store']);
    Route::delete('/proveedores/{id}', [ProveedorController::class, 'destroy']);
    
    Route::get('/bancos', [BancoController::class, 'index']);
    Route::post('/bancos', [BancoController::class, 'store']);
    Route::put('/bancos/{id}', [BancoController::class, 'update']);
    Route::delete('/bancos/{id}', [BancoController::class, 'destroy']);
    
    Route::get('/metodos-pago', [MetodoPagoController::class, 'index']);
    Route::post('/metodos-pago', [MetodoPagoController::class, 'store']);
    Route::put('/metodos-pago/{id}', [MetodoPagoController::class, 'update']);
    Route::delete('/metodos-pago/{id}', [MetodoPagoController::class, 'destroy']);
    
    Route::get('/categorias-fondo', [CategoriasFondoController::class, 'index']);
    Route::post('/categorias-fondo', [CategoriasFondoController::class, 'store']);
    Route::delete('/categorias-fondo/{id}', [CategoriasFondoController::class, 'destroy']);
    
    Route::get('/beneficiarios-fondo', [BeneficiariosFondoController::class, 'index']);
    Route::post('/beneficiarios-fondo', [BeneficiariosFondoController::class, 'store']);
    Route::delete('/beneficiarios-fondo/{id}', [BeneficiariosFondoController::class, 'destroy']);
    
    // Obligaciones
    Route::get('/obligaciones/config', [ObligacionesController::class, 'getConfig']);
    Route::post('/obligaciones/config', [ObligacionesController::class, 'updateConfig']);
    Route::get('/obligaciones', [ObligacionesController::class, 'index']);
    Route::get('/obligaciones/reporte', [ObligacionesController::class, 'reportePdf']);
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

Route::prefix('tienda')->group(function () {
    // Productos
    Route::get('/productos', [TiendaController::class, 'getProductos']);
    Route::post('/productos', [TiendaController::class, 'storeProducto']);
    Route::put('/productos/{id}', [TiendaController::class, 'updateProducto']);
    Route::delete('/productos/{id}', [TiendaController::class, 'destroyProducto']);
    Route::post('/productos-completos', [\App\Http\Controllers\InventarioTiendaController::class, 'storeProductoCompleto']);
    
    // Clientes
    Route::get('/clientes', [TiendaController::class, 'getClientes']);
    
    // Ventas
    Route::get('/ventas', [TiendaController::class, 'getVentas']);
    Route::get('/ventas/estadisticas', [TiendaController::class, 'getEstadisticas']);
    Route::get('/ventas/reporte-pdf', [TiendaController::class, 'reporteVentasPdf']);
    Route::get('/ventas/reporte-data', [TiendaController::class, 'reporteVentasData']);
    Route::get('/reportes/rendimiento', [TiendaController::class, 'getReporteRendimiento']);
    Route::get('/ventas/{id}', [TiendaController::class, 'getVenta']);
    Route::get('/ventas/{id}/ticket', [TiendaController::class, 'ticketVentaPdf']);
    Route::post('/ventas', [TiendaController::class, 'storeVenta']);
    Route::get('/directores', [TiendaController::class, 'getDirectores']);
    Route::put('/ventas/{id}/detalles', [TiendaController::class, 'updateVentaDetalles']);
    Route::post('/ventas/{id}/pagar', [TiendaController::class, 'pagarVenta']);
    Route::post('/ventas/{id}/anular', [TiendaController::class, 'anularVenta']);

    // Inventario Avanzado (Insumos y Lotes)
    Route::get('/notificaciones', [\App\Http\Controllers\InventarioTiendaController::class, 'getNotificaciones']);
    Route::get('/inventario/metricas', [TiendaController::class, 'getMetricasInventario']);
    Route::get('/insumos', [\App\Http\Controllers\InventarioTiendaController::class, 'getInsumos']);
    Route::get('/insumos/reporte', [\App\Http\Controllers\InventarioTiendaController::class, 'reporteInventario']);
    Route::post('/insumos', [\App\Http\Controllers\InventarioTiendaController::class, 'storeInsumo']);
    Route::put('/insumos/{id}', [\App\Http\Controllers\InventarioTiendaController::class, 'updateInsumo']);
    Route::delete('/insumos/{id}', [\App\Http\Controllers\InventarioTiendaController::class, 'destroyInsumo']);
    Route::get('/insumos/{id}/movimientos', [\App\Http\Controllers\InventarioTiendaController::class, 'getMovimientos']);
    Route::post('/insumos/{id}/ajustar', [\App\Http\Controllers\InventarioTiendaController::class, 'ajustarInventario']);
    Route::post('/productos-completos', [\App\Http\Controllers\InventarioTiendaController::class, 'storeProductoCompleto']);
    Route::put('/productos-completos/{id}', [\App\Http\Controllers\InventarioTiendaController::class, 'updateProductoCompleto']);
    Route::get('/compras', [\App\Http\Controllers\InventarioTiendaController::class, 'getCompras']);
    Route::post('/compras', [\App\Http\Controllers\InventarioTiendaController::class, 'storeCompra']);
    Route::post('/compras/{id}/anular', [\App\Http\Controllers\InventarioTiendaController::class, 'anularCompra']);
    
    Route::get('/insumos/{id_insumo}/lotes', [\App\Http\Controllers\InventarioTiendaController::class, 'getLotes']);
    Route::post('/lotes', [\App\Http\Controllers\InventarioTiendaController::class, 'storeLote']);
    Route::put('/lotes/{id}', [\App\Http\Controllers\InventarioTiendaController::class, 'updateLote']);
    Route::delete('/lotes/{id}', [\App\Http\Controllers\InventarioTiendaController::class, 'destroyLote']);

    // Proveedores y Gastos
    Route::get('/proveedores', [\App\Http\Controllers\TiendaGastosController::class, 'getProveedores']);
    Route::post('/proveedores', [\App\Http\Controllers\TiendaGastosController::class, 'storeProveedor']);
    Route::put('/proveedores/{id}', [\App\Http\Controllers\TiendaGastosController::class, 'updateProveedor']);
    Route::delete('/proveedores/{id}', [\App\Http\Controllers\TiendaGastosController::class, 'destroyProveedor']);

    Route::get('/gastos', [\App\Http\Controllers\TiendaGastosController::class, 'getGastos']);
    Route::post('/gastos', [\App\Http\Controllers\TiendaGastosController::class, 'storeGasto']);
    Route::put('/gastos/{id}', [\App\Http\Controllers\TiendaGastosController::class, 'updateGasto']);
    Route::delete('/gastos/{id}', [\App\Http\Controllers\TiendaGastosController::class, 'destroyGasto']);

    Route::post('/compras/{id}/pagar', [\App\Http\Controllers\InventarioTiendaController::class, 'pagarCompra']);

    // Clientes de Tienda (Foráneos y Miembros)
    // El GET lo maneja TiendaController@getClientes para incluir métricas
    Route::post('/clientes', [\App\Http\Controllers\ClienteTiendaController::class, 'store']);
    Route::put('/clientes/{id}', [\App\Http\Controllers\ClienteTiendaController::class, 'update']);
    Route::delete('/clientes/{id}', [\App\Http\Controllers\ClienteTiendaController::class, 'destroy']);
});

});

Route::get('/test-reporte', [App\Http\Controllers\TiendaController::class, 'getReporteRendimiento']);
