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
        $data['id'] = (string) Str::uuid();
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
}
