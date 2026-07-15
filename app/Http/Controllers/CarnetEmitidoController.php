<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\CarnetEmitido;
use App\Models\Miembro;
use App\Services\CarnetPdfService;
use Illuminate\Support\Str;

class CarnetEmitidoController extends Controller
{
    public function index()
    {
        return CarnetEmitido::with(['miembro', 'persona'])->orderBy('created_at', 'desc')->get();
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id_persona' => 'required|integer|exists:personas,id',
            'id_miembro' => 'nullable|integer|exists:miembros,id',
            'fecha_emision' => 'required|date',
            'fecha_vencimiento' => 'nullable|date',
            'estado' => 'nullable|string',
        ]);

        if (!empty($data['id_miembro'])) {
            $miembro = Miembro::find($data['id_miembro']);
            if (!$miembro || $miembro->carnets_disponibles <= 0) {
                return response()->json(['error' => 'No hay créditos de carnets disponibles para esta hacienda.'], 400);
            }

            // Restar el crédito
            $miembro->decrement('carnets_disponibles', 1);
        }

        // Crear el carnet
        $carnet = CarnetEmitido::create($data);

        return response()->json($carnet, 201);
    }

    public function destroy($id)
    {
        $carnet = CarnetEmitido::find($id);
        if (!$carnet) {
            return response()->json(['error' => 'Carnet no encontrado'], 404);
        }

        if (!empty($carnet->id_miembro)) {
            $miembro = Miembro::find($carnet->id_miembro);
            if ($miembro) {
                // Devolver el crédito
                $miembro->increment('carnets_disponibles', 1);
            }
        }

        $carnet->delete();

        return response()->json(['message' => 'Carnet eliminado y crédito devuelto.']);
    }

    public function descargarPdf($id, CarnetPdfService $pdfService)
    {
        $carnet = CarnetEmitido::with(['persona', 'miembro'])->findOrFail($id);
        
        try {
            $pdfPath = $pdfService->generarPdfCarnet($carnet);
            
            return response()->download($pdfPath, "carnet_{$carnet->persona->ci_numero}.pdf")->deleteFileAfterSend(true);
        } catch (\Exception $e) {
            return response()->json(['error' => 'No se pudo generar el carnet: ' . $e->getMessage()], 500);
        }
    }

    public function showPublic($id)
    {
        $carnet = CarnetEmitido::with(['persona', 'miembro'])->find($id);

        if (!$carnet) {
            return response()->json(['error' => 'Carnet no encontrado'], 404);
        }

        // Determinar cargo / tipo de carnet
        $cargo = 'Trabajador / Vinculado';
        if ($carnet->miembro && $carnet->persona) {
            $vinc = \Illuminate\Support\Facades\DB::table('vinculacion')
                ->where('id_persona', $carnet->persona->id)
                ->where('id_miembro', $carnet->miembro->id)
                ->first();
            if ($vinc) {
                if ($vinc->presidente) {
                    $cargo = 'Presidente';
                } elseif ($vinc->director) {
                    $cargo = 'Director';
                } elseif ($vinc->accionista) {
                    $cargo = 'Accionista';
                } elseif ($vinc->representante) {
                    $cargo = 'Representante';
                } else {
                    $cargo = 'Socio / Afiliado';
                }
            }
        }
        if ($carnet->persona->ex_presidente) {
            $cargo = 'Ex Presidente';
        } elseif ($carnet->persona->honorario) {
            $cargo = 'Miembro Honorario';
        }

        $vigente = true;
        $motivo_invalidez = null;

        if ($carnet->fecha_vencimiento && $carnet->fecha_vencimiento < now()) {
            $vigente = false;
            $motivo_invalidez = 'Carnet Vencido';
        } elseif ($carnet->estado === 'Vencido') {
            $vigente = false;
            $motivo_invalidez = 'Carnet Vencido';
        } elseif ($carnet->estado === 'Inactivo') {
            $vigente = false;
            $motivo_invalidez = 'Carnet Inactivo';
        }

        // Verificación de la solvencia
        $solvente = true;
        if ($carnet->miembro) {
            if ($carnet->miembro->solvencia !== 'Solvente') {
                $solvente = false;
                $vigente = false;
                $motivo_invalidez = 'Miembro Insolvente';
            }
        }

        return response()->json([
            'id' => $carnet->id,
            'fecha_emision' => $carnet->fecha_emision,
            'fecha_vencimiento' => $carnet->fecha_vencimiento,
            'vigente' => $vigente,
            'motivo_invalidez' => $motivo_invalidez,
            'cargo' => $cargo,
            'persona' => [
                'nombre' => $carnet->persona->nombre,
                'ci_numero' => $carnet->persona->ci_numero,
                'ci_tipo' => $carnet->persona->ci_tipo,
                'fotografia' => $carnet->persona->fotografia,
            ],
            'miembro' => $carnet->miembro ? [
                'razon_social' => $carnet->miembro->razon_social,
                'rif' => $carnet->miembro->rif,
                'logo' => $carnet->miembro->logo,
            ] : null,
        ]);
    }
}
