<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\DocumentoMiembro;
use Illuminate\Support\Facades\Storage;

class DocumentoMiembroController extends Controller
{
    public function index($id_miembro)
    {
        return DocumentoMiembro::where('id_miembro', $id_miembro)->get();
    }

    public function store(Request $request)
    {
        $tipo = $request->input('tipo');

        $mimesRule = 'mimes:pdf';
        if ($tipo === 'Hierro (Imagen)') {
            $mimesRule = 'mimes:jpg,jpeg,png';
        }

        $request->validate([
            'id_miembro' => 'required|integer|exists:miembros,id',
            'tipo' => 'required|string',
            'archivo' => ['required', 'file', $mimesRule, 'max:10240'], // Max 10MB
        ], [
            'archivo.mimes' => $tipo === 'Hierro (Imagen)' 
                ? 'El archivo del hierro debe ser una imagen (jpg, jpeg, png).' 
                : "El documento '$tipo' debe ser un archivo PDF.",
            'archivo.max' => 'El archivo no debe pesar más de 10 MB.',
        ]);

        $id_miembro = $request->input('id_miembro');
        $tipo = $request->input('tipo');

        // Check if a document of this type already exists for this member
        $existingDoc = DocumentoMiembro::where('id_miembro', $id_miembro)->where('tipo', $tipo)->first();

        if ($existingDoc) {
            // Delete old file
            if (Storage::disk('local')->exists($existingDoc->ruta_archivo)) {
                Storage::disk('local')->delete($existingDoc->ruta_archivo);
            } elseif (Storage::disk('public')->exists($existingDoc->ruta_archivo)) {
                Storage::disk('public')->delete($existingDoc->ruta_archivo);
            }
        }

        // Save new file to 'local' (private) disk
        $file = $request->file('archivo');
        $filename = time() . '_' . preg_replace('/[^A-Za-z0-9_\-.]/', '_', $file->getClientOriginalName());
        $path = $file->storeAs("documentos_miembros/{$id_miembro}", $filename, 'local');

        if ($existingDoc) {
            $existingDoc->update(['ruta_archivo' => $path]);
            return response()->json($existingDoc, 200);
        } else {
            $doc = DocumentoMiembro::create([
                'id_miembro' => $id_miembro,
                'tipo' => $tipo,
                'ruta_archivo' => $path,
            ]);
            return response()->json($doc, 201);
        }
    }

    public function destroy($id)
    {
        $documento = DocumentoMiembro::findOrFail($id);

        if (Storage::disk('local')->exists($documento->ruta_archivo)) {
            Storage::disk('local')->delete($documento->ruta_archivo);
        } elseif (Storage::disk('public')->exists($documento->ruta_archivo)) {
            Storage::disk('public')->delete($documento->ruta_archivo);
        }

        $documento->delete();

        return response()->json(['message' => 'Document deleted']);
    }

    public function download($id)
    {
        $documento = DocumentoMiembro::findOrFail($id);

        if (Storage::disk('local')->exists($documento->ruta_archivo)) {
            $path = Storage::disk('local')->path($documento->ruta_archivo);
        } elseif (Storage::disk('public')->exists($documento->ruta_archivo)) {
            $path = Storage::disk('public')->path($documento->ruta_archivo);
        } else {
            abort(404, 'Documento no encontrado.');
        }

        return response()->file($path);
    }
}
