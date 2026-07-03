<?php

namespace App\Http\Controllers;

use App\Models\Obligacion;
use App\Models\AbonoObligacion;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ObligacionesController extends Controller
{
    public function getConfig()
    {
        $path = storage_path('app/public/obligaciones_config.json');
        $config = ['categorias' => [], 'terceros' => []];
        if (file_exists($path)) {
            $config = json_decode(file_get_contents($path), true);
        }
        
        $bancos = DB::table('bancos')->select('id', 'nombre', 'divisa as moneda')->get();
        
        return response()->json([
            'categorias' => $config['categorias'] ?? [],
            'terceros' => $config['terceros'] ?? [],
            'bancos' => $bancos
        ]);
    }

    public function updateConfig(Request $request)
    {
        $path = storage_path('app/public/obligaciones_config.json');
        $config = ['categorias' => [], 'terceros' => []];
        if (file_exists($path)) {
            $config = json_decode(file_get_contents($path), true);
        }

        if ($request->has('categoria') && !in_array($request->categoria, $config['categorias'])) {
            $config['categorias'][] = $request->categoria;
        }

        if ($request->has('tercero') && !in_array($request->tercero, $config['terceros'])) {
            $config['terceros'][] = $request->tercero;
        }

        file_put_contents($path, json_encode($config, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        
        return response()->json(['message' => 'Configuración actualizada', 'config' => $config]);
    }

    public function index(Request $request)
    {
        $tipo = $request->query('tipo', 'COBRAR');
        
        $obligaciones = Obligacion::with('bancoOrigen')
            ->with(['abonos' => function($q) {
                $q->orderBy('fecha', 'desc');
            }])
            ->where('tipo_obligacion', $tipo)
            ->orderBy('estado', 'asc')
            ->orderBy('fecha_emision', 'desc')
            ->get();
            
        return response()->json($obligaciones);
    }

    public function store(Request $request)
    {
        if (empty($request->banco_origen_id)) {
            $request->merge(['banco_origen_id' => null]);
        }

        $request->validate([
            'tipo_obligacion' => 'required|in:COBRAR,PAGAR',
            'categoria' => 'required|string',
            'tercero' => 'required|string',
            'monto_original' => 'required|numeric|min:0.01',
            'moneda' => 'required|in:VES,USD',
            'fecha_emision' => 'required|date',
            'banco_origen_id' => 'nullable|integer|exists:bancos,id',
            'referencia' => 'required_with:banco_origen_id|string|nullable'
        ]);

        DB::beginTransaction();
        try {
            $obligacion = Obligacion::create($request->all());

            // Si salió (o entró) de un banco, hay que registrar el movimiento bancario.
            if ($obligacion->banco_origen_id) {
                $banco = DB::table('bancos')->where('id', $obligacion->banco_origen_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                
                $debe = $obligacion->tipo_obligacion === 'COBRAR' ? $obligacion->monto_original : 0;
                $haber = $obligacion->tipo_obligacion === 'PAGAR' ? $obligacion->monto_original : 0;
                
                $descSuffix = $obligacion->descripcion ? " - {$obligacion->descripcion}" : "";
                $descPrefix = $obligacion->tipo_obligacion === 'COBRAR' ? "otorgado a" : "recibido de";
                $beneficiario = $obligacion->tipo_obligacion === 'COBRAR' ? $obligacion->tercero : 'Ingreso Particular';

                DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $obligacion->fecha_emision,
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia ?? ('REF-' . $obligacion->id),
                    'descripcion' => "{$obligacion->categoria} {$descPrefix} {$obligacion->tercero}{$descSuffix}",
                    'beneficiario' => $beneficiario,
                    'debe' => $debe,
                    'haber' => $haber,
                    'id_obligacion' => $obligacion->id
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Obligación creada exitosamente', 'obligacion' => $obligacion], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function abonar(Request $request, $id)
    {
        if (empty($request->banco_id)) {
            $request->merge(['banco_id' => null]);
        }

        $request->validate([
            'fecha' => 'required|date',
            'monto_abonado' => 'required|numeric|min:0.01',
            'monto_banco' => 'required|numeric|min:0',
            'moneda_pago' => 'required|in:VES,USD',
            'banco_id' => 'nullable|integer|exists:bancos,id',
            'referencia' => 'required_with:banco_id|string|nullable'
        ]);

        $obligacion = Obligacion::findOrFail($id);

        if ($obligacion->estado === 'PAGADA') {
            return response()->json(['error' => 'Esta obligación ya está pagada'], 400);
        }

        DB::beginTransaction();
        try {
            $abono = new AbonoObligacion($request->all());
            $abono->obligacion_id = $obligacion->id;
            $abono->save();

            $obligacion->monto_abonado += $abono->monto_abonado;
            if (round($obligacion->monto_abonado, 2) >= round($obligacion->monto_original, 2)) {
                $obligacion->estado = 'PAGADA';
            } else {
                $obligacion->estado = 'PARCIAL';
            }
            $obligacion->save();

            // Insertar en la conciliación bancaria
            if ($abono->banco_id) {
                $banco = DB::table('bancos')->where('id', $abono->banco_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                
                $debe = 0;
                $haber = 0;

                if ($obligacion->tipo_obligacion === 'COBRAR') {
                    // Nos están pagando, el dinero entra al banco
                    $debe = $abono->monto_banco;
                } else {
                    // Estamos pagando una deuda, el dinero sale del banco
                    $haber = $abono->monto_banco;
                }

                $descSuffix = $obligacion->descripcion ? " - {$obligacion->descripcion}" : "";
                $beneficiario = $obligacion->tipo_obligacion === 'COBRAR' ? 'Ingreso Particular' : $obligacion->tercero;

                DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $abono->fecha,
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $abono->referencia ?? ('ABONO-'.$abono->id),
                    'descripcion' => "Abono a {$obligacion->categoria} de {$obligacion->tercero}{$descSuffix}",
                    'beneficiario' => $beneficiario,
                    'debe' => $debe,
                    'haber' => $haber,
                    'id_abono_obligacion' => $abono->id
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Abono registrado exitosamente', 'abono' => $abono]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
    {
        if (empty($request->banco_origen_id)) {
            $request->merge(['banco_origen_id' => null]);
        }

        $request->validate([
            'categoria' => 'required|string',
            'tercero' => 'required|string',
            'monto_original' => 'required|numeric|min:0.01',
            'fecha_emision' => 'required|date',
            'banco_origen_id' => 'nullable|integer|exists:bancos,id',
            'referencia' => 'required_with:banco_origen_id|string|nullable'
        ]);

        $obligacion = Obligacion::findOrFail($id);

        if ($request->monto_original < $obligacion->monto_abonado) {
            return response()->json(['error' => 'El monto original no puede ser menor al monto ya abonado.'], 400);
        }

        DB::beginTransaction();
        try {
            $obligacion->update($request->all());

            // Recalcular estado
            if ($obligacion->monto_abonado >= $obligacion->monto_original) {
                $obligacion->estado = 'PAGADA';
            } elseif ($obligacion->monto_abonado > 0) {
                $obligacion->estado = 'PARCIAL';
            } else {
                $obligacion->estado = 'PENDIENTE';
            }
            $obligacion->save();

            // Borrar movimiento bancario viejo
            DB::table('cuenta_banco')->where('id_obligacion', $obligacion->id)->delete();
            DB::table('cuenta_moneda_extranjera')->where('id_obligacion', $obligacion->id)->delete();

            // Crear nuevo si aplica
            if ($obligacion->banco_origen_id) {
                $banco = DB::table('bancos')->where('id', $obligacion->banco_origen_id)->first();
                $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
                
                $debe = $obligacion->tipo_obligacion === 'COBRAR' ? $obligacion->monto_original : 0;
                $haber = $obligacion->tipo_obligacion === 'PAGAR' ? $obligacion->monto_original : 0;
                
                $descSuffix = $obligacion->descripcion ? " - {$obligacion->descripcion}" : "";
                $descPrefix = $obligacion->tipo_obligacion === 'COBRAR' ? "otorgado a" : "recibido de";
                $beneficiario = $obligacion->tipo_obligacion === 'COBRAR' ? $obligacion->tercero : 'Ingreso Particular';

                DB::table($tablaBanco)->insert([
                    'id_banco' => $banco->id,
                    'fecha' => $obligacion->fecha_emision,
                    'tipo_operacion' => 'TRANSF',
                    'referencia' => $request->referencia ?? ('REF-' . $obligacion->id),
                    'descripcion' => "{$obligacion->categoria} {$descPrefix} {$obligacion->tercero}{$descSuffix}",
                    'beneficiario' => $beneficiario,
                    'debe' => $debe,
                    'haber' => $haber,
                    'id_obligacion' => $obligacion->id
                ]);
            }

            DB::commit();
            return response()->json(['message' => 'Obligación actualizada exitosamente', 'obligacion' => $obligacion]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $obligacion = Obligacion::findOrFail($id);
            // La base de datos eliminará en cascada los abonos y los movimientos bancarios
            $obligacion->delete();
            return response()->json(['message' => 'Obligación eliminada exitosamente']);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function updateAbono(Request $request, $id)
    {
        $request->validate([
            'fecha' => 'required|date',
            'monto_abonado' => 'required|numeric|min:0.01',
            'monto_banco' => 'required|numeric|min:0.01',
            'moneda_pago' => 'required|in:VES,USD',
            'banco_id' => 'required|integer|exists:bancos,id',
            'referencia' => 'required|string'
        ]);

        DB::beginTransaction();
        try {
            $abono = AbonoObligacion::findOrFail($id);
            $obligacion = Obligacion::findOrFail($abono->obligacion_id);

            $restante_sin_este_abono = $obligacion->monto_original - ($obligacion->monto_abonado - $abono->monto_abonado);
            if ($request->monto_abonado > $restante_sin_este_abono) {
                return response()->json(['error' => 'El abono supera el monto restante de la obligación.'], 400);
            }

            $abono->update($request->all());

            $total_abonado = AbonoObligacion::where('obligacion_id', $obligacion->id)->sum('monto_abonado');
            $obligacion->monto_abonado = $total_abonado;
            
            if ($obligacion->monto_abonado >= $obligacion->monto_original) {
                $obligacion->estado = 'PAGADA';
            } elseif ($obligacion->monto_abonado > 0) {
                $obligacion->estado = 'PARCIAL';
            } else {
                $obligacion->estado = 'PENDIENTE';
            }
            $obligacion->save();

            DB::table('cuenta_banco')->where('id_abono_obligacion', $abono->id)->delete();
            DB::table('cuenta_moneda_extranjera')->where('id_abono_obligacion', $abono->id)->delete();

            $banco = DB::table('bancos')->where('id', $abono->banco_id)->first();
            $tablaBanco = $banco->divisa === 'VES' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
            
            $debe = 0;
            $haber = 0;

            if ($obligacion->tipo_obligacion === 'COBRAR') {
                $haber = $abono->monto_banco;
            } else {
                $debe = $abono->monto_banco;
            }

            $descSuffix = $obligacion->descripcion ? " - {$obligacion->descripcion}" : "";
            $beneficiario = $obligacion->tipo_obligacion === 'COBRAR' ? 'Ingreso Particular' : $obligacion->tercero;

            DB::table($tablaBanco)->insert([
                'id_banco' => $banco->id,
                'fecha' => $abono->fecha,
                'tipo_operacion' => 'TRANSF',
                'referencia' => $abono->referencia,
                'descripcion' => "Abono a {$obligacion->categoria} de {$obligacion->tercero}{$descSuffix}",
                'beneficiario' => $beneficiario,
                'debe' => $debe,
                'haber' => $haber,
                'id_abono_obligacion' => $abono->id
            ]);

            DB::commit();
            return response()->json(['message' => 'Abono actualizado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function destroyAbono($id)
    {
        DB::beginTransaction();
        try {
            $abono = AbonoObligacion::findOrFail($id);
            $obligacion = Obligacion::findOrFail($abono->obligacion_id);
            
            $abono->delete();

            $total_abonado = AbonoObligacion::where('obligacion_id', $obligacion->id)->sum('monto_abonado');
            $obligacion->monto_abonado = $total_abonado;
            
            if ($obligacion->monto_abonado >= $obligacion->monto_original) {
                $obligacion->estado = 'PAGADA';
            } elseif ($obligacion->monto_abonado > 0) {
                $obligacion->estado = 'PARCIAL';
            } else {
                $obligacion->estado = 'PENDIENTE';
            }
            $obligacion->save();

            DB::commit();
            return response()->json(['message' => 'Abono eliminado exitosamente']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }
}
