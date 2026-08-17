<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\ProductoTienda;
use App\Models\ClienteTienda;
use App\Models\VentaTienda;
use App\Models\VentaTiendaDetalle;
use App\Models\PagoTienda;
use App\Models\Miembro;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Models\Persona;

class TiendaController extends Controller
{
    // ==========================================
    // PRODUCTOS (Gestión Tienda)
    // ==========================================
    public function getProductos()
    {
        return response()->json(ProductoTienda::with('insumo.lotesActivos')->get());
    }

    public function storeProducto(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'precio_miembro' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'codigo_barras' => 'nullable|string|unique:productos_tienda',
            'id_insumo' => 'nullable|exists:insumos_tienda,id',
            'medida_descuento' => 'nullable|numeric|min:0'
        ]);

        $producto = ProductoTienda::create($request->all());
        return response()->json($producto, 201);
    }

    public function updateProducto(Request $request, $id)
    {
        $producto = ProductoTienda::findOrFail($id);
        
        $request->validate([
            'nombre' => 'required|string|max:255',
            'precio' => 'required|numeric|min:0',
            'precio_miembro' => 'nullable|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'codigo_barras' => 'nullable|string|unique:productos_tienda,codigo_barras,'.$id,
            'id_insumo' => 'nullable|exists:insumos_tienda,id',
            'medida_descuento' => 'nullable|numeric|min:0'
        ]);

        $producto->update($request->all());
        return response()->json($producto);
    }

    public function destroyProducto($id)
    {
        $producto = ProductoTienda::findOrFail($id);
        
        if ($producto->detalles()->count() > 0) {
            return response()->json(['error' => 'No se puede eliminar porque este producto está en una o más ventas.'], 400);
        }

        $producto->delete();
        return response()->json(['message' => 'Producto eliminado']);
    }

    // ==========================================
    // CLIENTES FORÁNEOS
    // ==========================================
    public function getClientes()
    {
        $metricasForaneos = DB::table('ventas_tienda')
            ->whereNotNull('id_cliente_tienda')
            ->whereIn('estado', ['Pagada', 'Parcial', 'Credito'])
            ->select(
                'id_cliente_tienda',
                DB::raw('COUNT(id) as total_compras'),
                DB::raw('SUM(total + cargo_servicio - descuento) as total_gastado')
            )
            ->groupBy('id_cliente_tienda')
            ->get()
            ->keyBy('id_cliente_tienda');

        $metricasPersonas = DB::table('ventas_tienda')
            ->whereNotNull('id_persona')
            ->whereIn('estado', ['Pagada', 'Parcial', 'Credito'])
            ->select(
                'id_persona',
                DB::raw('COUNT(id) as total_compras'),
                DB::raw('SUM(total + cargo_servicio - descuento) as total_gastado')
            )
            ->groupBy('id_persona')
            ->get()
            ->keyBy('id_persona');

        $favForaneos = DB::table('ventas_tienda')
            ->join('ventas_tienda_detalles', 'ventas_tienda.id', '=', 'ventas_tienda_detalles.id_venta')
            ->join('productos_tienda', 'ventas_tienda_detalles.id_producto', '=', 'productos_tienda.id')
            ->whereNotNull('ventas_tienda.id_cliente_tienda')
            ->whereIn('ventas_tienda.estado', ['Pagada', 'Parcial', 'Credito'])
            ->select('ventas_tienda.id_cliente_tienda', 'productos_tienda.nombre', DB::raw('SUM(ventas_tienda_detalles.cantidad) as total_cantidad'))
            ->groupBy('ventas_tienda.id_cliente_tienda', 'productos_tienda.nombre')
            ->orderBy('total_cantidad', 'desc')
            ->get()
            ->groupBy('id_cliente_tienda');

        $favPersonas = DB::table('ventas_tienda')
            ->join('ventas_tienda_detalles', 'ventas_tienda.id', '=', 'ventas_tienda_detalles.id_venta')
            ->join('productos_tienda', 'ventas_tienda_detalles.id_producto', '=', 'productos_tienda.id')
            ->whereNotNull('ventas_tienda.id_persona')
            ->whereIn('ventas_tienda.estado', ['Pagada', 'Parcial', 'Credito'])
            ->select('ventas_tienda.id_persona', 'productos_tienda.nombre', DB::raw('SUM(ventas_tienda_detalles.cantidad) as total_cantidad'))
            ->groupBy('ventas_tienda.id_persona', 'productos_tienda.nombre')
            ->orderBy('total_cantidad', 'desc')
            ->get()
            ->groupBy('id_persona');

        $foraneos = ClienteTienda::all()->map(function($cliente) use ($metricasForaneos, $favForaneos) {
            $m = $metricasForaneos->get($cliente->id);
            $f = $favForaneos->get($cliente->id);
            $cliente->total_compras = $m ? $m->total_compras : 0;
            $cliente->total_gastado = $m ? (float) $m->total_gastado : 0;
            $cliente->producto_favorito = $f ? $f->first()->nombre : 'N/A';
            return $cliente;
        });

        $personasIds = $metricasPersonas->keys();
        $miembros = \App\Models\Persona::whereIn('id', $personasIds)->get()->map(function($persona) use ($metricasPersonas, $favPersonas) {
            $m = $metricasPersonas->get($persona->id);
            $f = $favPersonas->get($persona->id);
            $persona->total_compras = $m ? $m->total_compras : 0;
            $persona->total_gastado = $m ? (float) $m->total_gastado : 0;
            $persona->producto_favorito = $f ? $f->first()->nombre : 'N/A';
            // Adaptar para el frontend
            $persona->razon_social = $persona->nombre . ' ' . $persona->apellido;
            $persona->ci_rif = $persona->ci_numero;
            $persona->celular = $persona->telefono;
            return $persona;
        });

        return response()->json([
            'foraneos' => $foraneos,
            'miembros' => $miembros
        ]);
    }

    public function storeCliente(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'cedula' => 'nullable|string',
            'telefono' => 'nullable|string'
        ]);

        $cliente = ClienteTienda::create($request->all());
        return response()->json($cliente, 201);
    }

    public function getDirectores()
    {
        $directores = Persona::join('vinculacion', 'personas.id', '=', 'vinculacion.id_persona')
            ->where(function($q) {
                $q->where('vinculacion.director', true)
                  ->orWhere('vinculacion.presidente', true);
            })
            ->select('personas.*')
            ->distinct()
            ->orderBy('personas.nombre')
            ->get();
        
        return response()->json($directores);
    }

    // ==========================================
    // VENTAS TASCA
    // ==========================================
    public function getVentas(Request $request)
    {
        $query = VentaTienda::with(['clienteForaneo', 'miembro', 'persona', 'pagos', 'detalles.producto.insumo'])
                            ->orderBy('id', 'desc');
                            
        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('fecha', [$request->start_date, $request->end_date]);
        }

        return response()->json($query->get());
    }

    public function getVenta($id)
    {
        $venta = VentaTienda::with(['clienteForaneo', 'miembro', 'persona', 'detalles.producto.insumo', 'pagos', 'autorizador'])->findOrFail($id);
        
        // Sincronizar el descuento real con el atributo de descuento en la BD de forma lazy
        if ($venta->descuento > 0 && $venta->descuento_real == 0) {
            $venta->descuento = 0;
            $venta->save();
        }

        $tasa = \DB::table('tasas')->orderBy('fecha', 'desc')->first();
        $venta->tasa_bcv = $venta->tasa_bcv ?: ($tasa ? (float) $tasa->monto : 36.5);
        $venta->append('descuento_real');
        return response()->json($venta);
    }

    public function storeVenta(Request $request)
    {
        // Se puede iniciar una venta asociándola a un Miembro o a un Cliente Foráneo
        $request->validate([
            'id_cliente_miembro' => 'nullable|exists:miembros,id',
            'id_cliente_tienda' => 'nullable|exists:clientes_tienda,id',
            'id_persona' => 'nullable|exists:personas,id'
        ]);

        if (!$request->id_cliente_miembro && !$request->id_cliente_tienda && !$request->id_persona) {
            return response()->json(['error' => 'Debe seleccionar un cliente, miembro o persona para la venta.'], 400);
        }

        $tasa = \DB::table('tasas')->orderBy('fecha', 'desc')->first();
        $tasaActual = $tasa ? (float) $tasa->monto : 36.5;

        $venta = VentaTienda::create([
            'id_cliente_miembro' => $request->id_cliente_miembro,
            'id_persona' => $request->id_persona,
            'id_cliente_tienda' => $request->id_cliente_tienda,
            'total' => 0,
            'descuento' => 0,
            'estado' => 'Pendiente',
            'fecha' => Carbon::now()->toDateString(),
            'tasa_bcv' => $tasaActual
        ]);

        return response()->json($venta, 201);
    }

    public function updateVentaDetalles(Request $request, $id)
    {
        $venta = VentaTienda::findOrFail($id);
        
        $request->validate([
            'detalles' => 'required|array',
            'detalles.*.id_producto' => 'required|exists:productos_tienda,id',
            'detalles.*.cantidad' => 'required|numeric|min:0.01',
        ]);

        DB::beginTransaction();
        try {
            // Eliminar detalles anteriores y reponer stock
            foreach ($venta->detalles as $detalle) {
                $prod = ProductoTienda::find($detalle->id_producto);
                if ($prod) {
                    if ($prod->tipo === 'servicio') {
                        continue;
                    }

                    $productosAReponer = [];
                    if ($prod->tipo === 'compuesto') {
                        foreach ($prod->componentes as $comp) {
                            $productosAReponer[] = ['prod' => $comp, 'qty' => $detalle->cantidad * $comp->pivot->cantidad];
                        }
                    } else {
                        $productosAReponer[] = ['prod' => $prod, 'qty' => $detalle->cantidad];
                    }

                    foreach ($productosAReponer as $item) {
                        $p = $item['prod'];
                        if ($p->insumo) {
                            $mlAReponer = $item['qty'] * ($p->medida_descuento > 0 ? $p->medida_descuento : 1);
                            $lote = $p->insumo->lotes()->orderBy('created_at', 'desc')->first();
                            if ($lote) {
                                $lote->stock_actual += $mlAReponer;
                                if ($lote->estado === 'Agotado' && $lote->stock_actual > 0) {
                                    $lote->estado = 'Activo';
                                }
                                $lote->save();
                            }
                        }
                    }
                }
            }
            VentaTiendaDetalle::where('id_venta', $id)->delete();

            $total = 0;
            $descuentoTotal = 0;
            $esUgavi = $venta->clienteForaneo && strtolower(trim($venta->clienteForaneo->nombre)) === 'ugavi';
            $esMiembroSolvente = $venta->miembro && $venta->miembro->solvencia === 'Solvente';
            
            foreach ($request->detalles as $det) {
                $producto = ProductoTienda::findOrFail($det['id_producto']);
                
                if ($producto->stock < $det['cantidad']) {
                    throw new \Exception("Stock insuficiente para el producto: {$producto->nombre}");
                }

                $precioOriginal = $producto->precio;
                if ($esUgavi) {
                    $precioReal = $producto->costo_calculado;
                } elseif ($esMiembroSolvente && !is_null($producto->precio_miembro)) {
                    $precioReal = $producto->precio_miembro;
                } else {
                    $precioReal = $precioOriginal;
                }
                
                // Guardamos los precios ORIGINALES en el detalle de la venta
                // y el descuento se acumula en descuentoTotal para restarse a nivel de factura global
                $subtotal = $precioOriginal * $det['cantidad'];
                $total += $subtotal;
                
                // Track how much discount was given
                if ($precioOriginal > $precioReal) {
                    $descuentoTotal += ($precioOriginal - $precioReal) * $det['cantidad'];
                }

                VentaTiendaDetalle::create([
                    'id_venta' => $id,
                    'id_producto' => $producto->id,
                    'cantidad' => $det['cantidad'],
                    'precio_unitario' => $precioOriginal,
                    'subtotal' => $subtotal
                ]);

                // Descontar stock de los lotes (FIFO)
                if ($producto->tipo !== 'servicio') {
                    $productosADescontar = [];
                    if ($producto->tipo === 'compuesto') {
                        foreach ($producto->componentes as $comp) {
                            $productosADescontar[] = ['prod' => $comp, 'qty' => $det['cantidad'] * $comp->pivot->cantidad];
                        }
                    } else {
                        $productosADescontar[] = ['prod' => $producto, 'qty' => $det['cantidad']];
                    }

                    foreach ($productosADescontar as $item) {
                        $p = $item['prod'];
                        $insumo = $p->insumo;
                        if ($insumo) {
                            $mlADescontar = $item['qty'] * ($p->medida_descuento > 0 ? $p->medida_descuento : 1);
                            $lotes = $insumo->lotesActivos;
                            
                            foreach ($lotes as $lote) {
                                if ($mlADescontar <= 0) break;

                                if ($lote->stock_actual >= $mlADescontar) {
                                    $lote->stock_actual -= $mlADescontar;
                                    $lote->save();
                                    $mlADescontar = 0;
                                } else {
                                    $mlADescontar -= $lote->stock_actual;
                                    $lote->stock_actual = 0;
                                    $lote->estado = 'Agotado';
                                    $lote->save();
                                }
                            }
                        }
                    }
                }
            } // END foreach $request->detalles

            $venta->total = $total;
            $venta->descuento = $descuentoTotal;
            if ($request->has('aplica_cargo_servicio') && $request->aplica_cargo_servicio) {
                $venta->cargo_servicio = ($total - $descuentoTotal) * 0.10;
            } else {
                $venta->cargo_servicio = 0;
            }
            $venta->save();

            DB::commit();
            return response()->json(VentaTienda::with(['clienteForaneo', 'miembro', 'persona', 'detalles.producto.insumo', 'pagos', 'autorizador'])->find($id));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function pagarVenta(Request $request, $id)
    {
        $venta = VentaTienda::with('pagos')->findOrFail($id);
        $estadoAnterior = $venta->estado;
        
        if ($venta->estado === 'Pagada' || $venta->estado === 'Anulada') {
            return response()->json(['error' => 'La venta ya está pagada o anulada.'], 400);
        }

        $request->validate([
            'pagos' => 'nullable|array',
            'pagos.*.metodo_pago' => 'required|string',
            'pagos.*.monto_usd' => 'required|numeric|min:0',
            'pagos.*.tasa' => 'required|numeric|min:1',
            'pagos.*.monto_bs' => 'nullable|numeric|min:0',
            'pagos.*.referencia' => 'nullable|string',
            'id_autorizador' => 'nullable|exists:personas,id'
        ]);

        $pagosEnviados = $request->pagos ?? [];

        // Calculate total previously paid (if any)
        $pagadoAnteriormente = $venta->pagos->sum('pivot.monto_abonado_usd');
        
        $montoAbonarAhora = 0;
        foreach ($pagosEnviados as $pago) {
            $montoAbonarAhora += $pago['monto_usd'];
        }

        $totalVenta = $venta->total - $venta->descuento_real + $venta->cargo_servicio;

        DB::beginTransaction();
        try {
            foreach ($pagosEnviados as $pagoData) {
                // If it's the "Crédito" legacy method (just in case), ignore it as a real payment
                if ($pagoData['metodo_pago'] === 'Crédito') {
                    continue;
                }

                $nuevoPago = PagoTienda::create([
                    'monto_usd' => $pagoData['monto_usd'],
                    'tasa' => $pagoData['tasa'],
                    'monto_bs' => $pagoData['monto_bs'] ?? 0,
                    'metodo_pago' => $pagoData['metodo_pago'],
                    'referencia' => $pagoData['referencia'] ?? null,
                    'fecha_pago' => Carbon::now()->toDateString(),
                    'anotacion' => $pagoData['anotacion'] ?? null
                ]);

                // Attach to pivot
                $venta->pagos()->attach($nuevoPago->id, ['monto_abonado_usd' => $pagoData['monto_usd']]);

                // Registrar en bancos si se proporciona id_banco
                if (!empty($pagoData['id_banco'])) {
                    $isBs = strtoupper($pagoData['moneda'] ?? 'USD') === 'VES';
                    $table = $isBs ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                    
                    $montoIngreso = $isBs ? ($pagoData['monto_bs'] ?? 0) : $pagoData['monto_usd'];
                    
                    if ($montoIngreso > 0) {
                        $clienteNombre = $venta->clienteForaneo ? $venta->clienteForaneo->nombre : ($venta->miembro ? $venta->miembro->razon_social : 'Cliente Desconocido');
                        
                        // Buscar categoría "Ventas POS"
                        $categoria = DB::table('categoria_fondos')->where('categoria', 'Ventas POS')->first();
                        if (!$categoria) {
                            $catId = DB::table('categoria_fondos')->insertGetId([
                                'categoria' => 'Ventas POS',
                                'created_at' => now(),
                                'updated_at' => now()
                            ]);
                        } else {
                            $catId = $categoria->id;
                        }

                        DB::table($table)->insert([
                            'fecha' => Carbon::now()->toDateString(),
                            'id_banco' => $pagoData['id_banco'],
                            'referencia' => $pagoData['referencia'] ?? ('Venta POS #' . $venta->id),
                            'descripcion' => 'Venta POS a ' . $clienteNombre,
                            'debe' => $montoIngreso,
                            'haber' => 0,
                            'tipo_operacion' => 'PUNTO DE VENTA',
                            'categoria_id' => $catId,
                            'id_pago_tienda' => $nuevoPago->id,
                            'tienda_id' => $request->header('X-Tienda-Id', 1)
                        ]);
                    }
                }
            }

            // Determine new state
            $totalPagado = $pagadoAnteriormente + $montoAbonarAhora;
            
            if ($totalPagado >= $totalVenta - 0.01) { // -0.01 for floating point rounding
                $venta->estado = 'Pagada';
            } else if ($totalPagado > 0) {
                $venta->estado = 'Parcial';
            } else {
                // Si no se pagó nada, es un Crédito total
                $venta->estado = 'Credito';
            }
            
            // Verificación unificada para crédito o saldo parcial (crédito)
            // SOLO si la venta no era ya un crédito o parcial anteriormente
            if (($venta->estado === 'Parcial' || $venta->estado === 'Credito') && $totalPagado < $totalVenta) {
                if ($estadoAnterior !== 'Credito' && $estadoAnterior !== 'Parcial') {
                    if ($request->id_autorizador) {
                        $venta->id_autorizador = $request->id_autorizador;
                    } else {
                        if (!$venta->id_cliente_miembro) {
                            throw new \Exception("Se requiere autorización de un director para créditos a clientes foráneos.");
                        }
                        $miembro = Miembro::find($venta->id_cliente_miembro);
                        if ($miembro->solvencia !== 'Solvente') {
                            throw new \Exception("Se requiere autorización de un director para créditos a miembros insolventes.");
                        }
                    }
                }
            }

            // Si pasa a Crédito o Parcial, establecer fecha de vencimiento a 10 días desde la fecha de facturación.
            if (($venta->estado === 'Credito' || $venta->estado === 'Parcial') && !$venta->fecha_vencimiento) {
                $venta->fecha_vencimiento = Carbon::parse($venta->fecha)->addDays(10)->toDateString();
            }

            // Si es Crédito o Parcial pero la fecha de vencimiento ya pasó, remover el descuento definitivamente
            if (($venta->estado === 'Credito' || $venta->estado === 'Parcial') && $venta->fecha_vencimiento) {
                if (now()->startOfDay()->gt(Carbon::parse($venta->fecha_vencimiento)->startOfDay())) {
                    $venta->descuento = 0;
                }
            }

            $venta->save();

            DB::commit();
            return response()->json(VentaTienda::with(['clienteForaneo', 'miembro', 'persona', 'detalles.producto.insumo', 'pagos', 'autorizador'])->find($id));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function getEstadisticas(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        // 1. Ventas del Periodo (Total USD de ventas cobradas o hechas en el periodo)
        $ventasHoy = VentaTienda::with('pagos')->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();
        $totalVentasHoy = $ventasHoy->sum(function($v) { return $v->total - $v->descuento_real + $v->cargo_servicio; });

        // 2. Desglose de métodos de pago (Pagos hechos en el periodo)
        $pagosHoy = DB::table('pago_venta_tienda')
            ->join('pagos_tienda', 'pago_venta_tienda.id_pago', '=', 'pagos_tienda.id')
            ->join('ventas_tienda', 'pago_venta_tienda.id_venta', '=', 'ventas_tienda.id')
            ->whereBetween('pagos_tienda.fecha_pago', [$startDate, $endDate])
            ->select('pagos_tienda.metodo_pago', 'ventas_tienda.fecha as fecha_venta', 'pago_venta_tienda.monto_abonado_usd')
            ->get();

        $desglose = [];
        $abonosViejos = [];

        $startRange = Carbon::parse($startDate)->startOfDay();
        $endRange = Carbon::parse($endDate)->endOfDay();

        foreach ($pagosHoy as $p) {
            $fechaVenta = Carbon::parse($p->fecha_venta);
            if ($fechaVenta->between($startRange, $endRange)) {
                if (!isset($desglose[$p->metodo_pago])) $desglose[$p->metodo_pago] = 0;
                $desglose[$p->metodo_pago] += $p->monto_abonado_usd;
            } else {
                if (!isset($abonosViejos[$p->metodo_pago])) $abonosViejos[$p->metodo_pago] = 0;
                $abonosViejos[$p->metodo_pago] += $p->monto_abonado_usd;
            }
        }

        // 3. Cuánto es a crédito (Ventas hechas en el periodo que están en estado Credito o Parcial)
        $creditoHoy = 0;
        foreach ($ventasHoy as $v) {
            if ($v->estado === 'Credito' || $v->estado === 'Parcial') {
                $creditoHoy += $v->pendiente;
            }
        }

        // 4. Deuda Total Histórica (Todo lo que se debe hasta la fecha)
        $ventasPendientes = VentaTienda::with('pagos')
            ->whereIn('estado', ['Credito', 'Parcial'])
            ->get();
        
        $deudaTotalHistorica = $ventasPendientes->sum(function($v) {
            return $v->pendiente;
        });

        return response()->json([
            'ventas_dia_usd' => $totalVentasHoy,
            'desglose_pagos' => $desglose,
            'abonos_viejos' => $abonosViejos,
            'credito_otorgado_hoy' => $creditoHoy,
            'deuda_total_historica' => $deudaTotalHistorica
        ]);
    }

    public function reporteVentasData(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());
        
        $pagos = DB::table('pago_venta_tienda')
            ->join('pagos_tienda', 'pago_venta_tienda.id_pago', '=', 'pagos_tienda.id')
            ->join('ventas_tienda', 'pago_venta_tienda.id_venta', '=', 'ventas_tienda.id')
            ->whereBetween('pagos_tienda.fecha_pago', [$startDate, $endDate])
            ->select(
                'pagos_tienda.metodo_pago',
                'pago_venta_tienda.monto_abonado_usd',
                'pagos_tienda.monto_bs',
                'ventas_tienda.fecha as fecha_venta',
                'pagos_tienda.fecha_pago'
            )
            ->get();

        $ingresosVentasNuevas = [];
        $ingresosAbonos = [];
        $totalVentasNuevasUsd = 0;
        $totalVentasNuevasBs = 0;
        $totalAbonosUsd = 0;
        $totalAbonosBs = 0;
        $totalPuroDivisas = 0;

        foreach ($pagos as $pago) {
            $montoUsd = (float) $pago->monto_abonado_usd;
            $montoBs = (float) $pago->monto_bs;
            $metodo = $pago->metodo_pago;

            $isBsMethod = str_contains(strtolower($metodo), 'transferencia') || 
                          str_contains(strtolower($metodo), 'pago móvil') || 
                          str_contains(strtolower($metodo), 'pos') || 
                          str_contains(strtolower($metodo), 'punto de venta') ||
                          str_contains(strtolower($metodo), 'ves') ||
                          str_contains(strtolower($metodo), 'bs');
                          
            if (!$isBsMethod) {
                $totalPuroDivisas += $montoUsd;
            }

            if ($pago->fecha_venta >= $startDate && $pago->fecha_venta <= $endDate) {
                if (!isset($ingresosVentasNuevas[$metodo])) $ingresosVentasNuevas[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosVentasNuevas[$metodo]['usd'] += $montoUsd;
                $ingresosVentasNuevas[$metodo]['bs'] += $montoBs;
                $totalVentasNuevasUsd += $montoUsd;
                $totalVentasNuevasBs += $montoBs;
            } else {
                if (!isset($ingresosAbonos[$metodo])) $ingresosAbonos[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosAbonos[$metodo]['usd'] += $montoUsd;
                $ingresosAbonos[$metodo]['bs'] += $montoBs;
                $totalAbonosUsd += $montoUsd;
                $totalAbonosBs += $montoBs;
            }
        }

        $ventasPeriodo = VentaTienda::with(['miembro', 'persona', 'clienteForaneo'])
            ->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();
        $totalFacturado = $ventasPeriodo->sum(function($v) { return $v->total - $v->descuento_real + $v->cargo_servicio; });
        $totalPendiente = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->sum('pendiente');
        $totalContado = $totalFacturado - $totalPendiente;

        $ventasCredito = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->filter(function($v) {
            return $v->pendiente > 0;
        })->values();
        
        $totalCreditoOtorgado = $ventasCredito->sum('pendiente');

        return response()->json([
            'startDate' => $startDate,
            'endDate' => $endDate,
            'ingresosVentasNuevas' => $ingresosVentasNuevas,
            'ingresosAbonos' => $ingresosAbonos,
            'totalVentasNuevasUsd' => $totalVentasNuevasUsd,
            'totalVentasNuevasBs' => $totalVentasNuevasBs,
            'totalAbonosUsd' => $totalAbonosUsd,
            'totalAbonosBs' => $totalAbonosBs,
            'totalPuroDivisas' => $totalPuroDivisas,
            'totalFacturado' => $totalFacturado,
            'totalPendiente' => $totalPendiente,
            'totalContado' => $totalContado,
            'ventasCredito' => $ventasCredito,
            'totalCreditoOtorgado' => $totalCreditoOtorgado
        ]);
    }

    public function reporteVentasPdf(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());
        $formato = $request->query('format', 'carta'); // 'carta' o 'ticket'
        
        // Pagos realizados en el rango de fechas
        $pagos = DB::table('pago_venta_tienda')
            ->join('pagos_tienda', 'pago_venta_tienda.id_pago', '=', 'pagos_tienda.id')
            ->join('ventas_tienda', 'pago_venta_tienda.id_venta', '=', 'ventas_tienda.id')
            ->whereBetween('pagos_tienda.fecha_pago', [$startDate, $endDate])
            ->select(
                'pagos_tienda.metodo_pago',
                'pago_venta_tienda.monto_abonado_usd',
                'pagos_tienda.monto_bs',
                'ventas_tienda.fecha as fecha_venta',
                'pagos_tienda.fecha_pago'
            )
            ->get();

        $ingresosVentasNuevas = [];
        $ingresosAbonos = [];
        $totalVentasNuevasUsd = 0;
        $totalVentasNuevasBs = 0;
        $totalAbonosUsd = 0;
        $totalAbonosBs = 0;
        $totalPuroDivisas = 0;

        foreach ($pagos as $pago) {
            $montoUsd = (float) $pago->monto_abonado_usd;
            $montoBs = (float) $pago->monto_bs;
            $metodo = $pago->metodo_pago;

            $isBsMethod = str_contains(strtolower($metodo), 'transferencia') || 
                          str_contains(strtolower($metodo), 'pago móvil') || 
                          str_contains(strtolower($metodo), 'pos') || 
                          str_contains(strtolower($metodo), 'punto de venta') ||
                          str_contains(strtolower($metodo), 'ves') ||
                          str_contains(strtolower($metodo), 'bs');
                          
            if (!$isBsMethod) {
                $totalPuroDivisas += $montoUsd;
            }

            // Es venta nueva si la fecha de la venta está dentro del rango consultado
            // Y el pago también. Como filtramos pagos en este rango, verificaremos si la venta fue antes del startDate
            if ($pago->fecha_venta >= $startDate && $pago->fecha_venta <= $endDate) {
                if (!isset($ingresosVentasNuevas[$metodo])) $ingresosVentasNuevas[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosVentasNuevas[$metodo]['usd'] += $montoUsd;
                $ingresosVentasNuevas[$metodo]['bs'] += $montoBs;
                $totalVentasNuevasUsd += $montoUsd;
                $totalVentasNuevasBs += $montoBs;
            } else {
                // Abono a una deuda anterior al rango
                if (!isset($ingresosAbonos[$metodo])) $ingresosAbonos[$metodo] = ['usd' => 0, 'bs' => 0];
                $ingresosAbonos[$metodo]['usd'] += $montoUsd;
                $ingresosAbonos[$metodo]['bs'] += $montoBs;
                $totalAbonosUsd += $montoUsd;
                $totalAbonosBs += $montoBs;
            }
        }

        // 2. Facturación del Periodo (Excluyendo Anuladas y Pendientes sin finalizar)
        $ventasPeriodo = VentaTienda::with('miembro')
            ->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();
        $totalFacturado = $ventasPeriodo->sum(function($v) { return $v->total - $v->descuento_real + $v->cargo_servicio; });
        // Asegurar que el pendiente y crédito sumen lo mismo
        $totalPendiente = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->sum('pendiente');
        $totalContado = $totalFacturado - $totalPendiente;

        // Facturas a crédito para listado
        $ventasCredito = $ventasPeriodo->whereIn('estado', ['Credito', 'Parcial'])->filter(function($v) {
            return $v->pendiente > 0;
        });
        $totalCreditoOtorgado = 0;

        if ($formato === 'ticket') {
            // Un ticket típicamente es de 80mm de ancho. Le daremos una altura grande y el sistema lo recorta
            $pdf = new \TCPDF('P', 'mm', array(80, 297));
            $pdf->SetMargins(2, 2, 2);
        } else {
            $pdf = new \TCPDF('P', 'mm', 'LETTER');
            $pdf->SetMargins(15, 15, 15);
        }
        
        $pdf->SetCreator('Fondo2');
        $pdf->SetAuthor('Tienda');
        $pdf->SetTitle('Reporte de Ventas');
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();

        // Estilos
        $fontSizeTitle = $formato === 'ticket' ? '12px' : '18px';
        $fontSizeSub = $formato === 'ticket' ? '10px' : '13px';
        $fontSizeText = $formato === 'ticket' ? '8px' : '11px';
        $fontFamily = $formato === 'ticket' ? 'Helvetica, Arial, sans-serif' : 'Helvetica, Arial, sans-serif';
        $tableStyle = $formato === 'ticket' ? "width: 100%; border-collapse: collapse; font-size: 8px; font-family: {$fontFamily};" : "width: 100%; border-collapse: collapse; font-size: 11px; font-family: {$fontFamily}; color: #334155;";
        $thStyle = $formato === 'ticket' ? 'border-bottom: 1px dashed #333; font-weight:bold; padding: 4px 0;' : 'background-color:#f8fafc; border-bottom: 2px solid #cbd5e1; font-weight:bold; padding: 8px; color: #0f172a;';
        $tdStyle = $formato === 'ticket' ? 'padding: 3px 0;' : 'border-bottom: 1px solid #e2e8f0; padding: 7px; color: #334155;';

        $rangoTexto = $startDate === $endDate ? $startDate : "{$startDate} al {$endDate}";

        if ($formato === 'ticket') {
            $html = "
                <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'>
                    <strong style='font-size: 10px;'>Unión de Ganaderos del Municipio<br>Rosario de Perijá - TASCA</strong><br>
                    <span style='font-size: 8px;'>RIF: J-07002231-0</span><br>
                    <span style='font-size: 8px;'>Tlf: 02634511191</span><br>
                    <span style='font-size: 7px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span><br>
                </div>
                <table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table>
                <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'><br>
                    <strong style='font-size: 11px;'>REPORTE DE CIERRE DE CAJA</strong><br>
                    <span style='font-size: 8px;'>Fechas: {$rangoTexto}</span><br>
                </div>
                <br><table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table><br>
            ";
            $separador = "<br><table width=\"100%\"><tr><td style=\"border-top: 1px dashed #333;\"></td></tr></table><br>";
        } else {
            $html = "
                <table width=\"100%\" cellpadding=\"8\" style=\"background-color:#0f172a; color:#ffffff; font-family: {$fontFamily};\">
                    <tr>
                        <td width=\"55%\">
                            <strong style='font-size: 15px; letter-spacing: 1px; color:#e2e8f0;'>UNIÓN DE GANADEROS DEL MUNICIPIO ROSARIO DE PERIJÁ</strong><br>
                            <span style='font-size: 11px; color: #94a3b8;'>RIF: J-07002231-0 | Tlf: 02634511191</span><br>
                            <span style='font-size: 10px; color: #64748b;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span>
                        </td>
                        <td width=\"45%\" style=\"text-align: right;\">
                            <strong style='font-size: 24px; color: #38bdf8; letter-spacing: 2px;'>REPORTE DE CIERRE</strong><br>
                            <span style='font-size: 12px; color: #e2e8f0;'>Fechas: <strong>{$rangoTexto}</strong></span><br>
                            <span style='font-size: 10px; color: #94a3b8;'>Generado: " . date('d/m/Y h:i A') . "</span>
                        </td>
                    </tr>
                </table>
                <br><br>
            ";
            $separador = "<br><table width=\"100%\"><tr><td style=\"border-bottom: 2px solid #e2e8f0;\"></td></tr></table><br><br>";
        }

        // --- SECCIÓN 1: RESUMEN DE FACTURACIÓN ---
        $html .= "
            <h3 style='font-size:{$fontSizeSub}; font-family: {$fontFamily}; margin-bottom: 5px; text-align:center; color:#1e40af;'>RESUMEN DE FACTURACIÓN</h3>
            <table style='{$tableStyle}'>
                <tr>
                    <td style='{$tdStyle} text-align:left;'>Ventas al Contado (Pagado)</td>
                    <td style='{$tdStyle} text-align:right;'>$" . number_format($totalContado, 2) . "</td>
                </tr>
                <tr>
                    <td style='{$tdStyle} text-align:left;'>Ventas a Crédito (Pendiente)</td>
                    <td style='{$tdStyle} text-align:right;'>$" . number_format($totalPendiente, 2) . "</td>
                </tr>
        ";

        if ($formato === 'ticket') {
            $html .= "
                <tr style='font-weight:bold;'>
                    <td style='padding:4px; border-top:1px dashed #333;'>TOTAL FACTURADO</td>
                    <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalFacturado, 2) . "</td>
                </tr>
            </table>
            ";
        } else {
            $html .= "
                <tr style='background-color:#f1f5f9; color: #0f172a;'>
                    <td style='padding:8px; border-bottom: 2px solid #94a3b8;'><strong>TOTAL FACTURADO (Ventas Reales)</strong></td>
                    <td style='padding:8px; border-bottom: 2px solid #94a3b8; text-align:right;'><strong>$" . number_format($totalFacturado, 2) . "</strong></td>
                </tr>
            </table>
            ";
        }

        $html .= $separador;

        // --- SECCIÓN 2: INGRESOS RECIBIDOS (DINERO EN CAJA) ---
        $html .= "
            <table width=\"100%\">
                <tr>
                    <td style='background-color:#10b981; color:#ffffff; padding: 6px 10px;'>
                        <strong style='font-size:12px; font-family: {$fontFamily};'>DETALLE DE INGRESOS (DINERO RECIBIDO)</strong>
                    </td>
                </tr>
            </table>
            <br>
            <table style='{$tableStyle}'>
                <tr>
                    <th width=\"50%\" style='{$thStyle} text-align:left;'>MÉTODO DE PAGO (VENTAS NUEVAS)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>TOTAL (USD)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>EXACTO (Bs)</th>
                </tr>
        ";

        if (empty($ingresosVentasNuevas)) {
            $html .= "<tr><td colspan='3' style='text-align:center; {$tdStyle}'>No hay ingresos.</td></tr>";
        } else {
            foreach ($ingresosVentasNuevas as $metodo => $totales) {
                $bsStr = $totales['bs'] > 0 ? "Bs " . number_format($totales['bs'], 2) : "-";
                $html .= "<tr><td style='{$tdStyle}'>{$metodo}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($totales['usd'], 2) . "</td><td style='{$tdStyle} text-align:right;'>{$bsStr}</td></tr>";
            }
        }
        
        if ($formato === 'ticket') {
            $html .= "
                    <tr style='font-weight:bold;'>
                        <td style='padding:4px; border-top:1px dashed #333;'>SUBTOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalVentasNuevasUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalVentasNuevasBs, 2) . "</td>
                    </tr>
                </table>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#ecfdf5; color: #064e3b;'>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7;'><strong>SUBTOTAL INGRESOS NUEVOS</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7; text-align:right;'><strong>$" . number_format($totalVentasNuevasUsd, 2) . "</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #6ee7b7; text-align:right;'><strong>Bs " . number_format($totalVentasNuevasBs, 2) . "</strong></td>
                    </tr>
                </table>
            ";
        }

        $html .= "
            <br>
            <table style='{$tableStyle}'>
                <tr>
                    <th width=\"50%\" style='{$thStyle} text-align:left;'>MÉTODO DE PAGO (ABONOS A DEUDAS)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>TOTAL (USD)</th>
                    <th width=\"25%\" style='{$thStyle} text-align:right;'>EXACTO (Bs)</th>
                </tr>
        ";

        if (empty($ingresosAbonos)) {
            $html .= "<tr><td colspan='3' style='text-align:center; {$tdStyle}'>No hay abonos.</td></tr>";
        } else {
            foreach ($ingresosAbonos as $metodo => $totales) {
                $bsStr = $totales['bs'] > 0 ? "Bs " . number_format($totales['bs'], 2) : "-";
                $html .= "<tr><td style='{$tdStyle}'>{$metodo}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($totales['usd'], 2) . "</td><td style='{$tdStyle} text-align:right;'>{$bsStr}</td></tr>";
            }
        }

        if ($formato === 'ticket') {
            $html .= "
                    <tr style='font-weight:bold;'>
                        <td style='padding:4px; border-top:1px dashed #333;'>SUBTOTAL</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalAbonosUsd, 2) . "</td>
                        <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>Bs " . number_format($totalAbonosBs, 2) . "</td>
                    </tr>
                </table>

                <br><table width=\"100%\"><tr><td style=\"border-bottom: 1px dashed #333;\"></td></tr></table><br>
                <table style='{$tableStyle} margin-top: 5px;'>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>RECIBIDO (DIVISAS):</td>
                        <td style='text-align:right; padding-bottom:2px;'>$" . number_format($totalPuroDivisas, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>RECIBIDO (BS):</td>
                        <td style='text-align:right; padding-bottom:2px;'>Bs " . number_format($totalVentasNuevasBs + $totalAbonosBs, 2) . "</td>
                    </tr>
                    <tr style='font-size:{$fontSizeSub}; font-weight:bold;'>
                        <td style='text-align:left; padding-bottom:2px;'>TOTAL INGRESADO:</td>
                        <td style='text-align:right; padding-bottom:2px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                    </tr>
                </table>
            ";
        } else {
            $html .= "
                    <tr style='background-color:#fffbeb; color: #78350f;'>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d;'><strong>SUBTOTAL ABONOS</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d; text-align:right;'><strong>$" . number_format($totalAbonosUsd, 2) . "</strong></td>
                        <td style='padding:8px; border-bottom: 1px solid #fcd34d; text-align:right;'><strong>Bs " . number_format($totalAbonosBs, 2) . "</strong></td>
                    </tr>
                </table>

                <br><br>
                <table width=\"100%\" cellpadding=\"8\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td width=\"100%\" style=\"background-color:#f8fafc; border: 1px solid #cbd5e1; border-top: 4px solid #10b981;\">
                            <table width=\"100%\">
                                <tr>
                                    <td style='font-size:13px; color:#475569; padding-bottom: 4px;'>TOTAL RECIBIDO (DIVISAS):</td>
                                    <td style='font-size:14px; color:#0f172a; font-weight:bold; text-align:right; padding-bottom: 4px;'>$" . number_format($totalPuroDivisas, 2) . "</td>
                                </tr>
                                <tr>
                                    <td style='font-size:13px; color:#475569; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;'>TOTAL RECIBIDO (Bs):</td>
                                    <td style='font-size:14px; color:#0f172a; font-weight:bold; text-align:right; padding-bottom: 8px; border-bottom: 1px solid #cbd5e1;'>Bs " . number_format($totalVentasNuevasBs + $totalAbonosBs, 2) . "</td>
                                </tr>
                                <tr>
                                    <td style='font-size:15px; color:#047857; font-weight:bold; padding-top: 8px;'>TOTAL GENERAL INGRESADO (USD):</td>
                                    <td style='font-size:18px; color:#047857; font-weight:bold; text-align:right; padding-top: 8px;'>$" . number_format($totalVentasNuevasUsd + $totalAbonosUsd, 2) . "</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                <br>
            ";
        }

        // --- SECCIÓN 3: CUENTAS POR COBRAR (CRÉDITOS OTORGADOS) ---
        if ($ventasCredito->count() > 0) {
            $html .= $separador;
            $html .= "
                <table width=\"100%\">
                    <tr>
                        <td style='background-color:#f59e0b; color:#ffffff; padding: 6px 10px;'>
                            <strong style='font-size:12px; font-family: {$fontFamily};'>CUENTAS POR COBRAR (CRÉDITOS OTORGADOS)</strong>
                        </td>
                    </tr>
                </table>
                <br>
                <table style='{$tableStyle}'>
                    <tr>
                        <th width=\"60%\" style='{$thStyle} text-align:left;'>CLIENTE / COMPROBANTE</th>
                        <th width=\"40%\" style='{$thStyle} text-align:right;'>PENDIENTE (USD)</th>
                    </tr>
            ";
            foreach ($ventasCredito as $vc) {
                if ($vc->pendiente > 0) {
                    $totalCreditoOtorgado += $vc->pendiente;
                    $nombreCliente = $vc->miembro ? $vc->miembro->razon_social : "Factura #".$vc->id;
                    $html .= "<tr><td style='{$tdStyle}'>{$nombreCliente}</td><td style='{$tdStyle} text-align:right;'>$" . number_format($vc->pendiente, 2) . "</td></tr>";
                }
            }
            if ($formato === 'ticket') {
                $html .= "
                        <tr style='font-weight:bold;'>
                            <td style='padding:4px; border-top:1px dashed #333;'>TOTAL A CRÉDITO</td>
                            <td style='padding:4px; border-top:1px dashed #333; text-align:right;'>$" . number_format($totalCreditoOtorgado, 2) . "</td>
                        </tr>
                    </table>
                ";
            } else {
                $html .= "
                        <tr style='background-color:#f8fafc; color: #0f172a;'>
                            <td style='padding:8px; border-top: 2px solid #cbd5e1;'><strong>TOTAL A CRÉDITO</strong></td>
                            <td style='padding:8px; border-top: 2px solid #cbd5e1; text-align:right;'><strong>$" . number_format($totalCreditoOtorgado, 2) . "</strong></td>
                        </tr>
                    </table>
                ";
            }
        }

        $html .= "</div>";

        $pdf->writeHTML($html, true, false, true, false, '');

        $nombreUsuario = auth()->user() ? auth()->user()->name : 'Admin';

        if ($formato === 'carta') {
            $pdf->SetAutoPageBreak(false);
            $pdf->SetY(-35);
            $footerHtml = "
                <table width=\"100%\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td style=\"text-align:center; color:#94a3b8; font-size: 10px; border-top: 1px solid #e2e8f0; padding-top: 8px;\">
                            *** FIN DEL REPORTE ***<br>
                            <strong style='color:#64748b; font-size: 11px;'>SIGAMA</strong><br>
                            Sistema de Gestión Administrativa y Membresías de Agroproductores - {$nombreUsuario}
                        </td>
                    </tr>
                </table>
            ";
            $pdf->writeHTML($footerHtml, true, false, true, false, '');
            $pdf->SetAutoPageBreak(true, 15);
        } else {
            $footerHtml = "
                <br>
                <table width=\"100%\" style=\"font-family: {$fontFamily};\">
                    <tr>
                        <td style=\"text-align:center; color:#94a3b8; font-size: 9px;\">
                            *** FIN DEL REPORTE ***<br>
                            <strong>SIGAMA</strong><br>
                            Sistema de Gestión Administrativa<br>
                            Generado por: {$nombreUsuario}
                        </td>
                    </tr>
                </table>
            ";
            $pdf->writeHTML($footerHtml, true, false, true, false, '');
        }

        $pdf->Output('Reporte_Ventas_'.$rangoTexto.'.pdf', 'I');
    }

    public function getCreditosMiembro($id)
    {
        $ventas = VentaTienda::with(['detalles.producto', 'pagos'])
            ->where('id_cliente_miembro', $id)
            ->whereIn('estado', ['Credito', 'Parcial'])
            ->orderBy('fecha', 'desc')
            ->get();
            
        // We only want to return those that actually have a pending balance > 0
        $ventas = $ventas->filter(function($v) {
            return $v->pendiente > 0;
        })->values();

        return response()->json($ventas);
    }

    public function anularVenta($id)
    {
        $venta = VentaTienda::with('detalles')->findOrFail($id);
        
        if ($venta->estado === 'Anulada') {
            return response()->json(['error' => 'La venta ya está anulada.'], 400);
        }

        DB::beginTransaction();
        try {
            // Reponer stock
            foreach ($venta->detalles as $detalle) {
                $prod = ProductoTienda::with('insumo.lotes')->find($detalle->id_producto);
                if ($prod && $prod->insumo) {
                    $mlAReponer = $detalle->cantidad * ($prod->medida_descuento > 0 ? $prod->medida_descuento : 1);
                    // Reponer en el lote más reciente (o el último creado)
                    $ultimoLote = $prod->insumo->lotes()->orderBy('created_at', 'desc')->first();
                    if ($ultimoLote) {
                        $ultimoLote->stock_actual += $mlAReponer;
                        if ($ultimoLote->estado === 'Agotado' && $ultimoLote->stock_actual > 0) {
                            $ultimoLote->estado = 'Activo';
                        }
                        $ultimoLote->save();
                    }
                }
            }

            // Eliminar pagos asociados para limpiar finanzas si aplica
            DB::table('pago_venta_tienda')->where('id_venta', $id)->delete();

            $venta->estado = 'Anulada';
            $venta->save();

            DB::commit();
            return response()->json(['message' => 'Venta anulada correctamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }

    public function ticketVentaPdf($id)
    {
        $venta = VentaTienda::with(['clienteForaneo', 'miembro', 'persona', 'detalles.producto.insumo', 'pagos'])->findOrFail($id);
        
        // Calcular altura dinámica
        $baseHeight = 110;
        $itemsHeight = count($venta->detalles) * 6;
        $pagosHeight = $venta->pagos->count() * 5;
        $signatureHeight = in_array(strtolower($venta->estado), ['credito', 'parcial']) ? 30 : 0;
        
        $totalHeight = $baseHeight + $itemsHeight + $pagosHeight + $signatureHeight;

        $pdf = new \TCPDF('P', 'mm', array(80, $totalHeight));
        $pdf->SetMargins(4, 6, 4);
        $pdf->SetCreator('Fondo2');
        $pdf->SetAuthor('Tienda');
        $pdf->SetTitle('Ticket de Venta #' . $venta->id);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->AddPage();
        
        $fontFamily = 'Helvetica, Arial, sans-serif';
        $fecha = \Carbon\Carbon::parse($venta->created_at)->format('d/m/Y');
        $cliente = $venta->miembro ? $venta->miembro->razon_social : ($venta->clienteForaneo ? $venta->clienteForaneo->nombre : 'Consumidor Final');
        $rif = $venta->miembro ? $venta->miembro->rif : ($venta->clienteForaneo ? $venta->clienteForaneo->cedula_rif : '');
        $metodoPrincipal = $venta->pagos->count() > 0 ? $venta->pagos->first()->metodo_pago : 'N/A';

        // Usamos líneas punteadas con caracteres porque TCPDF las renderiza de manera muy confiable para formato ticket
        $dashes = "<div style='text-align:center; font-family: {$fontFamily}; font-size: 11px; letter-spacing: 2px; color: #333;'>- - - - - - - - - - - - - - - - - - - - - - - - - - - -</div>";

        $html = "
            <div style='text-align:center; font-family: {$fontFamily}; line-height: 1.3;'>
                <strong style='font-size: 10px;'>Unión de Ganaderos del Municipio<br>Rosario de Perijá - TASCA</strong><br>
                <span style='font-size: 8px;'>RIF: J-07002231-0</span><br>
                <span style='font-size: 8px;'>Tlf: 02634511191</span><br>
                <span style='font-size: 7px;'>Av. 18 de Octubre Local UGAVI N° 57000 Sector Aurora.<br>Villa del Rosario Municipio Rosario de Perijá</span>
            </div>
            
            {$dashes}
            
            <div style='text-align:center; font-family: {$fontFamily};'>
                <strong style='font-size: 11px;'>TICKET DE VENTA TASCA</strong>
            </div>
            
            <table style='width: 100%; font-size: 8px; font-family: {$fontFamily}; margin-top: 5px;'>
                <tr>
                    <td style='text-align:left; width: 50%;'>Ref: {$venta->id}</td>
                    <td style='text-align:right; width: 50%;'>Fecha: {$fecha}</td>
                </tr>
                <tr>
                    <td style='text-align:left;'>Estado: " . ucfirst(strtolower($venta->estado)) . "</td>
                    <td style='text-align:right;'>Caja: Tienda</td>
                </tr>
            </table>

            {$dashes}
            
            <div style='font-family: {$fontFamily}; font-size: 8px; line-height: 1.3;'>
                <strong>CLIENTE:</strong><br>
                {$cliente}
                " . ($rif ? "<br>RIF: {$rif}" : "") . "<br>
                Método: {$metodoPrincipal}
            </div>

            {$dashes}
            
            <table style='width: 100%; border-collapse: collapse; font-size: 8px; font-family: {$fontFamily};'>
                <tr>
                    <th style='text-align:left; font-weight:bold; padding-bottom: 4px; width: 65%;'>DESCRIPCIÓN</th>
                    <th style='text-align:center; font-weight:bold; padding-bottom: 4px; width: 15%;'>CANT.</th>
                    <th style='text-align:right; font-weight:bold; padding-bottom: 4px; width: 20%;'>MONTO</th>
                </tr>
        ";

        foreach ($venta->detalles as $det) {
            $nombre = $det->producto->nombre_completo ?? $det->producto->nombre;
            $html .= "
                <tr>
                    <td style='padding: 2px 0;'>{$nombre}</td>
                    <td style='padding: 2px 0; text-align:center;'>{$det->cantidad}</td>
                    <td style='padding: 2px 0; text-align:right;'>$" . number_format($det->subtotal, 2) . "</td>
                </tr>
            ";
        }

        $html .= "
            </table>
            
            {$dashes}
            
            <table style='width: 100%; border-collapse: collapse; font-size: 9px; font-family: {$fontFamily};'>
                <tr>
                    <td style='font-weight:bold; padding-top: 2px;'>TOTAL PAGADO (USD):</td>
                    <td style='text-align:right; font-weight:bold; padding-top: 2px;'>$" . number_format($venta->total, 2) . "</td>
                </tr>
        ";
        
        $totalBs = 0;
        foreach ($venta->pagos as $pago) {
            $totalBs += $pago->monto_bs;
        }

        if ($totalBs > 0) {
            $html .= "
                <tr>
                    <td style='font-weight:bold; padding-top: 4px;'>TOTAL PAGADO (Bs):</td>
                    <td style='text-align:right; font-weight:bold; padding-top: 4px;'>Bs. " . number_format($totalBs, 2) . "</td>
                </tr>
            ";
        }

        $html .= "</table>";

        $html .= "
            <div style='text-align:center; font-family: {$fontFamily}; margin-top: 10px;'>
                <strong style='font-size: 9px;'>*** GRACIAS POR SU COMPRA ***</strong><br>
                <span style='font-size: 7px; color: #444; display:block; margin-top: 4px;'>Este documento es un comprobante de venta interno de la Tienda y carece de validez fiscal o tributaria.</span>
            </div>
        ";

        if (in_array(strtolower($venta->estado), ['credito', 'parcial'])) {
            $html .= "
                <br><br><br>
                <div style='text-align:center; font-family: {$fontFamily}; font-size: 8px;'>
                    - - - - - - - - - - - - - - - - - - - -<br>
                    Firma del Cliente<br>
                    <strong>Saldo pendiente: $" . number_format($venta->pendiente, 2) . "</strong>
                </div>
            ";
        }

        $pdf->writeHTML($html, true, false, true, false, '');
        return response($pdf->Output('ticket_venta_'.$venta->id.'.pdf', 'S'))
            ->header('Content-Type', 'application/pdf');
    }

    public function getReporteRendimiento(Request $request)
    {
        $startDate = $request->query('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->query('end_date', Carbon::now()->toDateString());

        // Traer ventas dentro del rango (solo no anuladas ni pendientes)
        $ventas = VentaTienda::with(['detalles.producto'])
            ->whereBetween('fecha', [$startDate, $endDate])
            ->whereIn('estado', ['Pagada', 'Credito', 'Parcial'])
            ->get();

        $ingresosTotales = 0;
        $costoTotal = 0;
        $productosVendidos = 0;

        $ventasDiarias = [];
        $topProductos = [];

        // Pre-cargar todos los productos para incluir los "olvidados" (con 0 ventas en el periodo)
        $todosLosProductos = \App\Models\ProductoTienda::all();
        foreach ($todosLosProductos as $prod) {
            $topProductos[$prod->id] = [
                'nombre' => $prod->nombre_completo,
                'cantidad' => 0,
                'ingresos' => 0
            ];
        }

        foreach ($ventas as $venta) {
            $fecha = \Carbon\Carbon::parse($venta->fecha)->toDateString();
            if (!isset($ventasDiarias[$fecha])) {
                $ventasDiarias[$fecha] = 0;
            }
            
            $ingresoVenta = $venta->total + $venta->cargo_servicio - $venta->descuento_real;
            $ingresosTotales += $ingresoVenta;
            $ventasDiarias[$fecha] += $ingresoVenta;

            foreach ($venta->detalles as $detalle) {
                $producto = $detalle->producto;
                $costoUnitario = $producto ? $producto->costo_calculado : 0;
                $costoDetalle = $costoUnitario * $detalle->cantidad;
                $costoTotal += $costoDetalle;
                $productosVendidos += $detalle->cantidad;

                if ($producto) {
                    $idProd = $producto->id;
                    if (!isset($topProductos[$idProd])) {
                        $topProductos[$idProd] = [
                            'nombre' => $producto->nombre_completo,
                            'cantidad' => 0,
                            'ingresos' => 0
                        ];
                    }
                    $topProductos[$idProd]['cantidad'] += $detalle->cantidad;
                    $topProductos[$idProd]['ingresos'] += $detalle->subtotal;
                }
            }
        }

        $gananciaBruta = $ingresosTotales - $costoTotal;
        $margen = $ingresosTotales > 0 ? ($gananciaBruta / $ingresosTotales) * 100 : 0;
        $ticketPromedio = $ventas->count() > 0 ? $ingresosTotales / $ventas->count() : 0;

        // 1. Los 5 productos que generan mas liquidez (ingresos)
        $topLiquidez = $topProductos;
        usort($topLiquidez, function($a, $b) {
            return $b['ingresos'] <=> $a['ingresos'];
        });
        $topLiquidez = array_slice($topLiquidez, 0, 5);

        // 2. Los 5 productos con mas salida (cantidad)
        $topSalida = $topProductos;
        usort($topSalida, function($a, $b) {
            return $b['cantidad'] <=> $a['cantidad'];
        });
        $topSalida = array_slice($topSalida, 0, 5);

        // 3. Los 10 productos con menos salida (cantidad > 0)
        $menosSalida = array_filter($topProductos, function($prod) {
            return $prod['cantidad'] > 0;
        });
        usort($menosSalida, function($a, $b) {
            return $a['cantidad'] <=> $b['cantidad'];
        });
        $menosSalida = array_slice($menosSalida, 0, 10);

        // 4. Productos olvidados (0 ventas en su historia total)
        // Obtenemos los IDs de productos que sí tienen ventas registradas en alguna venta no anulada
        $productosConVentas = DB::table('ventas_tienda_detalles')
            ->join('ventas_tienda', 'ventas_tienda_detalles.id_venta', '=', 'ventas_tienda.id')
            ->whereNotIn('ventas_tienda.estado', ['Anulada', 'anulada'])
            ->pluck('ventas_tienda_detalles.id_producto')
            ->unique()
            ->toArray();
            
        $productosOlvidados = \App\Models\ProductoTienda::whereNotIn('id', $productosConVentas)
            ->get()
            ->map(function($prod) {
                return [
                    'nombre' => $prod->nombre_completo,
                    'cantidad' => 0,
                    'ingresos' => 0
                ];
            })
            ->toArray();

        // Formatear ventas diarias para Recharts
        $graficaVentas = [];
        foreach ($ventasDiarias as $fecha => $ingresos) {
            $graficaVentas[] = [
                'fecha' => $fecha,
                'ingresos' => round($ingresos, 2)
            ];
        }
        usort($graficaVentas, function($a, $b) {
            return strtotime($a['fecha']) <=> strtotime($b['fecha']);
        });

        // Desglose de pagos en el rango
        $pagos = DB::table('pago_venta_tienda')
            ->join('pagos_tienda', 'pago_venta_tienda.id_pago', '=', 'pagos_tienda.id')
            ->whereBetween('pagos_tienda.fecha_pago', [$startDate, $endDate])
            ->select('pagos_tienda.metodo_pago', DB::raw('SUM(pago_venta_tienda.monto_abonado_usd) as total'))
            ->groupBy('pagos_tienda.metodo_pago')
            ->get();
            
        $ventasPorMetodo = $pagos->map(function($p) {
            return [
                'metodo' => $p->metodo_pago,
                'monto' => round($p->total, 2)
            ];
        });
        // --- NUEVAS MÉTRICAS FINANCIERAS ---
        
        // 2. Inventario Valorizado Actual
        // Calculamos el valor real multiplicando el stock por el costo de cada lote activo para no duplicar por medida (botella, trago)
        $inventarioValorizado = \DB::table('lotes_tienda')
            ->where('estado', 'Activo')
            ->where('stock_actual', '>', 0)
            ->sum(\DB::raw('stock_actual * costo_unitario'));

        // 2. Cuentas por Cobrar Históricas (Ventas a Crédito/Parciales pendientes de cobro total)
        $cuentasPorCobrar = \App\Models\VentaTienda::with('pagos')
            ->whereIn('estado', ['Credito', 'Parcial'])
            ->get()
            ->sum(function($venta) {
                return $venta->pendiente;
            });

        // 3. Cuentas por Pagar Históricas
        // a) Compras pendientes o abonadas parcialmente
        $cuentasPorPagarCompras = DB::table('compras_tienda')
            ->whereIn('estado', ['Pendiente', 'Parcial'])
            ->select(DB::raw('SUM(total_usd - abono_usd) as total'))
            ->first()->total ?? 0;
            
        // b) Gastos Por Pagar
        $cuentasPorPagarGastos = DB::table('gastos_tienda')
            ->where('metodo_pago', 'Por Pagar')
            ->sum('monto_usd') ?? 0;
            
        $cuentasPorPagar = $cuentasPorPagarCompras + $cuentasPorPagarGastos;

        // 4. Métricas del Periodo (Gastos, Flujo)
        $gastosPeriodo = DB::table('gastos_tienda')
            ->whereBetween('fecha', [$startDate, $endDate])
            ->where('categoria', '!=', 'Compra de Mercancia')
            ->sum('monto_usd') ?? 0;

        $ingresosEfectivos = DB::table('pago_venta_tienda')
            ->join('pagos_tienda', 'pago_venta_tienda.id_pago', '=', 'pagos_tienda.id')
            ->whereBetween('pagos_tienda.fecha_pago', [$startDate, $endDate])
            ->sum('pago_venta_tienda.monto_abonado_usd') ?? 0;

        // Los pagos a proveedores por compra de mercancía ya se registran automáticamente en gastos_tienda 
        // bajo la categoría 'Compra de Mercancia', por lo que gastosPagadosPeriodo ya incluye todos los egresos.
        $gastosPagadosPeriodo = DB::table('gastos_tienda')
            ->whereBetween('fecha', [$startDate, $endDate])
            ->where('metodo_pago', '!=', 'Por Pagar')
            ->sum('monto_usd') ?? 0;

        $egresosEfectivos = $gastosPagadosPeriodo;
        $flujoCajaNeto = $ingresosEfectivos - $egresosEfectivos;
        
        // Ganancia Neta recalculada considerando Gastos
        $gananciaNeta = $gananciaBruta - $gastosPeriodo;

        return response()->json([
            'kpis' => [
                'total_ventas' => $ventas->count(),
                'productos_vendidos' => $productosVendidos,
                'ingresos_totales' => round($ingresosTotales, 2),
                'costo_total' => round($costoTotal, 2),
                'ganancia_bruta' => round($gananciaBruta, 2),
                'ganancia_neta' => round($gananciaNeta, 2),
                'gastos_periodo' => round($gastosPeriodo, 2),
                'margen' => round($margen, 2),
                'ticket_promedio' => round($ticketPromedio, 2)
            ],
            'finanzas' => [
                'inventario_valorizado' => round($inventarioValorizado, 2),
                'cuentas_por_cobrar' => round($cuentasPorCobrar, 2),
                'cuentas_por_pagar' => round($cuentasPorPagar, 2),
                'flujo_caja_neto' => round($flujoCajaNeto, 2),
                'ingresos_efectivos' => round($ingresosEfectivos, 2),
                'egresos_efectivos' => round($egresosEfectivos, 2)
            ],
            'grafica_ventas_diarias' => $graficaVentas,
            'top_liquidez' => $topLiquidez,
            'top_salida' => $topSalida,
            'menos_salida' => $menosSalida,
            'olvidados' => $productosOlvidados,
            'ventas_por_metodo' => $ventasPorMetodo
        ]);
    }

    public function getMenuPublico()
    {
        $productos = \App\Models\ProductoTienda::with('insumo')->get();
        $disponibles = $productos->filter(function($p) {
            return $p->stock > 0;
        })->map(function($p) {
            return [
                'id' => $p->id,
                'nombre' => $p->nombre_completo,
                'categoria' => $p->insumo ? $p->insumo->categoria : 'General',
                'precio' => $p->precio,
                'precio_miembro' => $p->precio_miembro,
                'imagen' => $p->insumo ? $p->insumo->imagen : null
            ];
        })->values();
        $tasa = \DB::table('tasas')->orderBy('fecha', 'desc')->first();
        $tasaBcv = $tasa ? (float) $tasa->monto : 36.5;

        return response()->json([
            'productos' => $disponibles,
            'tasa_bcv' => $tasaBcv
        ]);
    }

    public function getMetricasInventario()
    {
        $totalProductos = \App\Models\InsumoTienda::count();
        
        $valorTotalCosto = \DB::table('lotes_tienda')
            ->where('estado', 'Activo')
            ->where('stock_actual', '>', 0)
            ->sum(\DB::raw('stock_actual * costo_unitario'));
            
        $insumos = \App\Models\InsumoTienda::with(['productos', 'lotesActivos'])->get();
        $valorTotalVenta = 0;
        
        foreach ($insumos as $insumo) {
            $stock = $insumo->stock_total;
            if ($stock > 0 && $insumo->productos->count() > 0) {
                $maxPrecio = $insumo->productos->max('precio');
                $valorTotalVenta += ($stock * $maxPrecio);
            }
        }
        
        return response()->json([
            'totalProductos' => $totalProductos,
            'valorTotalCosto' => (float) $valorTotalCosto,
            'valorTotalVenta' => (float) $valorTotalVenta
        ]);
    }
}
