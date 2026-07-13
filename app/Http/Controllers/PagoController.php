<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Miembro;
use App\Models\Factura;
use App\Models\Pago;
use App\Models\Tasa;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PagoController extends Controller
{
    public function init()
    {
        $miembros = Miembro::all();
        $facturas = Factura::where('pendiente', '>', 0)->get();
        
        $pagos = Pago::with('facturas.miembro')
            ->orderBy('fecha', 'desc')
            ->orderBy('factura_fondo', 'desc')
            ->take(100)->get();
        
        // Obtener la tasa de cambio más reciente disponible, en lugar de forzar que sea exactamente de hoy
        $tasaHoy = Tasa::orderBy('fecha', 'desc')->first();
        $costoCarnet = env('PRECIO_POR_CREDITO_USD', 25);

        return response()->json([
            'miembros' => $miembros,
            'facturas' => $facturas,
            'pagos' => $pagos,
            'tasa_dia' => $tasaHoy ? $tasaHoy->monto : null,
            'costo_carnet' => $costoCarnet
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'monto' => 'required|numeric',
            'monto_bs' => 'required|numeric',
            'tasa_cambio' => 'required|numeric',
            'fecha' => 'required|date',
            'metodo_pago' => 'required|string',
            'referencia' => 'nullable|string',
            'facturas' => 'required|array',
        ]);

        $mp = $request->metodo_pago;
        $table = null;
        if ($mp === 'Pago Movil/Transferencia') $table = 'cuenta_banco';
        elseif ($mp === 'Zelle' || $mp === 'Efectivo Divisas') $table = 'cuenta_moneda_extranjera';
        elseif ($mp === 'Cruces') $table = 'cruces';

        if ($table && !$request->force_duplicate_reference) {
            $existing = DB::table($table)
                ->where('referencia', $request->referencia)
                ->where('fecha', $request->fecha)
                ->first();
                
            if ($existing) {
                return response()->json([
                    'message' => "Ya existe un movimiento bancario con la referencia '{$request->referencia}' y fecha '{$request->fecha}'. ¿Deseas sumar este pago al movimiento existente?",
                    'requires_confirmation' => true
                ], 409);
            }
        }

        DB::beginTransaction();
        try {
            // Generar secuencias si los campos vienen vacíos
            $facturaUgavi = $request->input('factura_ugavi');
            if (empty($facturaUgavi)) {
                $facturaUgavi = DB::selectOne("SELECT nextval('seq_factura_ugavi') AS val")->val;
            }

            $facturaFondo = $request->input('factura_fondo');
            if (empty($facturaFondo)) {
                $facturaFondo = DB::selectOne("SELECT nextval('seq_factura_fondo') AS val")->val;
            }

            // Crear el Pago
            $pago = Pago::create([
                'fecha' => $request->fecha,
                'monto' => $request->monto,
                'monto_bs' => $request->monto_bs,
                'tasa_cambio' => $request->tasa_cambio,
                'metodo_pago' => $request->metodo_pago,
                'referencia' => $request->referencia ?? 'CRUCE',
                'factura_ugavi' => $facturaUgavi,
                'factura_fondo' => $facturaFondo
            ]);

            // Procesar las Facturas seleccionadas y la Vinculación
            foreach ($request->facturas as $fData) {
                $factura = Factura::findOrFail($fData['id']);
                $aplicado = $fData['monto_aplicado'];
                $descuento = $fData['descuento'] ?? 0;

                // Reducir el saldo pendiente de la factura (Monto que se paga + el descuento que perdona la deuda)
                $nuevoPendiente = max(0, $factura->pendiente - ($aplicado + $descuento));
                $factura->pendiente = $nuevoPendiente;
                $factura->save();

                // Crear el registro en la tabla intermedia
                $pago->facturas()->attach($factura->id, [
                    'monto_aplicado' => $aplicado,
                    'descuento' => $descuento
                ]);

                // Actualizar saldo del miembro
                $factura->miembro->actualizarSaldoPendiente();
            }

            // --- FLUJO CONTABLE ---
            
            // 1. Inserción en libro_ventas (20% del monto)
            $miembroId = $request->facturas[0]['id'] ? Factura::find($request->facturas[0]['id'])->id_miembro : null;
            
            $idVenta = DB::table('libro_ventas')->insertGetId([
                'id_pago' => $pago->id,
                'id_miembro' => $miembroId,
                'fecha' => $request->fecha,
                'tipo' => 'Ingreso',
                'metodo_pago' => $request->metodo_pago,
                'monto' => $pago->monto * 0.20,
                'monto_bs' => $pago->monto_bs * 0.20,
                'referencia' => $pago->referencia,
                'numero_factura' => $facturaFondo,
                'numero_control' => "00-" . $facturaFondo,
            ]);

            // 2. Inserción en Bancos / Conciliación (100% del monto)
            $mp = $request->metodo_pago;
            $tableToUpdate = null;
            $montoToSum = 0;
            $bancoId = null;
            $tipoOperacion = '';
            
            if ($mp === 'Pago Movil/Transferencia') {
                $tableToUpdate = 'cuenta_banco';
                $montoToSum = $pago->monto_bs;
                $bancoId = DB::table('bancos')->where('nombre', 'BNC (Banco Nacional de Credito)')->value('id');
                $tipoOperacion = 'TRANSF';
            } elseif ($mp === 'Zelle') {
                $tableToUpdate = 'cuenta_moneda_extranjera';
                $montoToSum = $pago->monto;
                $bancoId = DB::table('bancos')->where('nombre', 'Zelle')->value('id');
                $tipoOperacion = 'TRANSF';
            } elseif ($mp === 'Efectivo Divisas') {
                $tableToUpdate = 'cuenta_moneda_extranjera';
                $montoToSum = $pago->monto;
                $bancoId = DB::table('bancos')->where('nombre', 'Efectivo Divisas')->value('id');
                $tipoOperacion = 'TRANSF';
            } elseif ($mp === 'Cruces') {
                $tableToUpdate = 'cruces';
                $montoToSum = $pago->monto;
                $bancoId = null;
                $tipoOperacion = '';
            }

            if ($tableToUpdate) {
                $existing = DB::table($tableToUpdate)
                    ->where('referencia', $pago->referencia)
                    ->where('fecha', $request->fecha)
                    ->first();

                if ($existing) {
                    // Update existing
                    if ($tableToUpdate === 'cruces') {
                        DB::table($tableToUpdate)->where('id', $existing->id)->update([
                            'haber' => $existing->haber + $montoToSum,
                            'descripcion' => $existing->descripcion . " / FACT#" . $facturaFondo
                        ]);
                    } else {
                        DB::table($tableToUpdate)->where('id', $existing->id)->update([
                            'debe' => $existing->debe + $montoToSum,
                            'descripcion' => $existing->descripcion . " / FACT#" . $facturaFondo
                        ]);
                    }
                } else {
                    // Insert new
                    if ($tableToUpdate === 'cruces') {
                        DB::table('cruces')->insert([
                            'id_venta' => $idVenta,
                            'id_banco' => null,
                            'fecha' => $request->fecha,
                            'referencia' => $pago->referencia ?? 'CRUCE',
                            'descripcion' => "FACT#" . $facturaFondo,
                            'haber' => $pago->monto
                        ]);
                    } else {
                        if ($bancoId) {
                            DB::table($tableToUpdate)->insert([
                                'id_banco' => $bancoId,
                                'id_venta' => $idVenta,
                                'fecha' => $request->fecha,
                                'tipo_operacion' => $tipoOperacion,
                                'referencia' => $pago->referencia,
                                'descripcion' => "FACT#" . $facturaFondo,
                                'beneficiario' => 'Ingreso Particular',
                                'debe' => $montoToSum,
                                'haber' => 0
                            ]);
                        }
                    }
                }
            }

            // Generar cuenta por cobrar si es un Cruce
            if ($mp === 'Cruces') {
                \App\Models\Obligacion::create([
                    'tipo_obligacion' => 'COBRAR',
                    'categoria' => 'Cruce de Pagos',
                    'tercero' => 'UGAVI',
                    'descripcion' => "Cuenta por cobrar por pago mediante Cruce (Factura #{$facturaFondo})",
                    'monto_original' => $pago->monto_bs,
                    'monto_abonado' => 0,
                    'moneda' => 'VES',
                    'fecha_emision' => $request->fecha,
                    'fecha_limite' => null,
                    'banco_origen_id' => null,
                    'estado' => 'PENDIENTE'
                ]);
            }

            DB::commit();

            return response()->json([
                'message' => 'Pago procesado exitosamente',
                'pago' => $pago
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Illuminate\Support\Facades\Log::error('Payment Error: ' . $e->getMessage() . "\n" . $e->getTraceAsString());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function marcarImpreso($id)
    {
        $pago = Pago::findOrFail($id);
        $pago->impreso = true;
        $pago->save();
        return response()->json(['message' => 'Marcado como impreso', 'pago' => $pago]);
    }

    public function update(Request $request, $id)
    {
        $pago = Pago::findOrFail($id);
        $request->validate([
            'fecha' => 'required|date',
            'metodo_pago' => 'required|string',
            'referencia' => 'nullable|string',
        ]);
        
        $oldFecha = $pago->fecha;
        $oldReferencia = $pago->referencia;
        $oldMetodo = $pago->metodo_pago;

        $dataToUpdate = $request->only(['fecha', 'metodo_pago']);
        $dataToUpdate['referencia'] = $request->referencia ?? 'CRUCE';
        
        DB::beginTransaction();
        try {
            $pago->update($dataToUpdate);
            
            // 1. Update libro_ventas
            $libroVenta = DB::table('libro_ventas')->where('id_pago', $pago->id)->first();
            if ($libroVenta) {
                DB::table('libro_ventas')->where('id_pago', $pago->id)->update([
                    'fecha' => $request->fecha,
                    'metodo_pago' => $request->metodo_pago,
                    'referencia' => $dataToUpdate['referencia']
                ]);
                
                // Helper mapping
                $getBankMapping = function($mp, $pagoObj) {
                    if ($mp === 'Pago Movil/Transferencia') {
                        return [
                            'table' => 'cuenta_banco',
                            'montoToSum' => $pagoObj->monto_bs,
                            'bancoId' => DB::table('bancos')->where('nombre', 'BNC (Banco Nacional de Credito)')->value('id'),
                            'tipoOperacion' => 'TRANSF'
                        ];
                    } elseif ($mp === 'Zelle') {
                        return [
                            'table' => 'cuenta_moneda_extranjera',
                            'montoToSum' => $pagoObj->monto,
                            'bancoId' => DB::table('bancos')->where('nombre', 'Zelle')->value('id'),
                            'tipoOperacion' => 'TRANSF'
                        ];
                    } elseif ($mp === 'Efectivo Divisas') {
                        return [
                            'table' => 'cuenta_moneda_extranjera',
                            'montoToSum' => $pagoObj->monto,
                            'bancoId' => DB::table('bancos')->where('nombre', 'Efectivo Divisas')->value('id'),
                            'tipoOperacion' => 'TRANSF'
                        ];
                    } elseif ($mp === 'Cruces') {
                        return [
                            'table' => 'cruces',
                            'montoToSum' => $pagoObj->monto,
                            'bancoId' => null,
                            'tipoOperacion' => ''
                        ];
                    }
                    return null;
                };

                $oldMapping = $getBankMapping($oldMetodo, $pago);
                $newMapping = $getBankMapping($request->metodo_pago, $pago);
                
                if ($oldMapping && $newMapping) {
                    $oldTable = $oldMapping['table'];
                    $newTable = $newMapping['table'];
                    
                    // Encontrar el registro contable original por id_venta o por referencia+fecha
                    $bankRecord = DB::table($oldTable)->where('id_venta', $libroVenta->id)->first();
                    if (!$bankRecord) {
                        $bankRecord = DB::table($oldTable)->where('referencia', $oldReferencia)->where('fecha', $oldFecha)->first();
                    }
                    
                    if ($bankRecord) {
                        if ($oldMetodo === $request->metodo_pago) {
                            // Solo actualizamos fecha y referencia
                            DB::table($oldTable)->where('id', $bankRecord->id)->update([
                                'fecha' => $request->fecha,
                                'referencia' => $dataToUpdate['referencia']
                            ]);
                        } else {
                            // Se cambio de metodo de pago, restamos del viejo y agregamos al nuevo
                            $col = ($oldTable === 'cruces') ? 'haber' : 'debe';
                            if ($bankRecord->$col > $oldMapping['montoToSum']) {
                                // Estaba agrupado con otros pagos, solo le restamos nuestro monto
                                DB::table($oldTable)->where('id', $bankRecord->id)->update([
                                    $col => $bankRecord->$col - $oldMapping['montoToSum']
                                ]);
                            } else {
                                // Era el unico pago de ese movimiento, lo borramos
                                DB::table($oldTable)->where('id', $bankRecord->id)->delete();
                            }
                            
                            // Lo insertamos en la tabla/banco nuevos
                            $existingNew = DB::table($newTable)
                                ->where('referencia', $dataToUpdate['referencia'])
                                ->where('fecha', $request->fecha)
                                ->first();
                                
                            if ($existingNew) {
                                $colNew = ($newTable === 'cruces') ? 'haber' : 'debe';
                                DB::table($newTable)->where('id', $existingNew->id)->update([
                                    $colNew => $existingNew->$colNew + $newMapping['montoToSum'],
                                    'descripcion' => $existingNew->descripcion . " / FACT#" . str_replace("00-", "", $libroVenta->numero_control)
                                ]);
                            } else {
                                if ($newTable === 'cruces') {
                                    DB::table('cruces')->insert([
                                        'id_venta' => $libroVenta->id,
                                        'id_banco' => null,
                                        'fecha' => $request->fecha,
                                        'referencia' => $dataToUpdate['referencia'],
                                        'descripcion' => "FACT#" . str_replace("00-", "", $libroVenta->numero_control),
                                        'haber' => $newMapping['montoToSum']
                                    ]);
                                } else {
                                    DB::table($newTable)->insert([
                                        'id_banco' => $newMapping['bancoId'],
                                        'id_venta' => $libroVenta->id,
                                        'fecha' => $request->fecha,
                                        'tipo_operacion' => $newMapping['tipoOperacion'],
                                        'referencia' => $dataToUpdate['referencia'],
                                        'descripcion' => "FACT#" . str_replace("00-", "", $libroVenta->numero_control),
                                        'beneficiario' => 'Ingreso Particular',
                                        'debe' => $newMapping['montoToSum'],
                                        'haber' => 0
                                    ]);
                                }
                            }
                        }
                    }
                }
            }
            
            DB::commit();
            return response()->json(['message' => 'Actualizado exitosamente', 'pago' => $pago]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => 'Error al actualizar: ' . $e->getMessage()], 500);
        }
    }

    public function anular($id)
    {
        $pago = Pago::with('facturas')->findOrFail($id);
        
        DB::beginTransaction();
        try {
            if ($pago->estado !== 'Anulada') {
                foreach ($pago->facturas as $factura) {
                    $vinculacion = DB::table('vinculacion_pagos')
                        ->where('id_pago', $pago->id)
                        ->where('id_factura', $factura->id)
                        ->first();
                        
                    if ($vinculacion) {
                        $factura->pendiente = $factura->pendiente + $vinculacion->monto_aplicado + ($vinculacion->descuento ?? 0);
                        $factura->save();
                        
                        $factura->miembro->actualizarSaldoPendiente();
                    }
                }
                $pago->estado = 'Anulada';
                $pago->save();

                if ($pago->metodo_pago === 'Cruces') {
                    $obligacion = \App\Models\Obligacion::where('tipo_obligacion', 'COBRAR')
                        ->where('tercero', 'UGAVI')
                        ->where('descripcion', "Cuenta por cobrar por pago mediante Cruce (Factura #{$pago->factura_fondo})")
                        ->first();
                    
                    if ($obligacion) {
                        if ($obligacion->monto_abonado > 0) {
                            throw new \Exception("No se puede anular este pago por cruce porque la cuenta por cobrar a UGAVI ya tiene abonos registrados o está pagada.");
                        }
                        $obligacion->delete();
                    }
                }
            }
            DB::commit();
            return response()->json(['message' => 'Pago anulado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $pago = Pago::with('facturas')->findOrFail($id);
        
        DB::beginTransaction();
        try {
            if ($pago->estado !== 'Anulada') {
                foreach ($pago->facturas as $factura) {
                    $vinculacion = DB::table('vinculacion_pagos')
                        ->where('id_pago', $pago->id)
                        ->where('id_factura', $factura->id)
                        ->first();
                        
                    if ($vinculacion) {
                        $factura->pendiente = $factura->pendiente + $vinculacion->monto_aplicado + ($vinculacion->descuento ?? 0);
                        $factura->save();
                        
                        $factura->miembro->actualizarSaldoPendiente();
                    }
                }
            }

            // CASCADE DELETE: Libros and Conciliacion
            $ventas = DB::table('libro_ventas')->where('id_pago', $pago->id)->get();
            foreach ($ventas as $venta) {
                DB::table('cuenta_banco')->where('id_venta', $venta->id)->delete();
                DB::table('cuenta_moneda_extranjera')->where('id_venta', $venta->id)->delete();
                DB::table('cruces')->where('id_venta', $venta->id)->delete();
                DB::table('libro_ventas')->where('id', $venta->id)->delete();
            }

            if ($pago->metodo_pago === 'Cruces') {
                $obligacion = \App\Models\Obligacion::where('tipo_obligacion', 'COBRAR')
                    ->where('tercero', 'UGAVI')
                    ->where('descripcion', "Cuenta por cobrar por pago mediante Cruce (Factura #{$pago->factura_fondo})")
                    ->first();
                
                if ($obligacion) {
                    if ($obligacion->monto_abonado > 0) {
                        throw new \Exception("No se puede eliminar este pago por cruce porque la cuenta por cobrar a UGAVI ya tiene abonos registrados o está pagada.");
                    }
                    $obligacion->delete();
                }
            }

            DB::table('vinculacion_pagos')->where('id_pago', $pago->id)->delete();
            $pago->delete();
            DB::commit();
            return response()->json(['message' => 'Pago eliminado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
