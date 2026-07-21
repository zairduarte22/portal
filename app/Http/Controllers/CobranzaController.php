<?php

namespace App\Http\Controllers;

use App\Models\Miembro;
use App\Jobs\SendWhatsAppReminderJob;
use Illuminate\Http\Request;

class CobranzaController extends Controller
{
    public function enviarMasivo(Request $request)
    {
        $request->validate([
            'miembro_ids' => 'required|array',
            'miembro_ids.*' => 'integer|exists:miembros,id'
        ]);

        // Buscamos a los miembros que tengan teléfono y que deban algo (> 0)
        $miembros = Miembro::whereIn('id', $request->miembro_ids)
                           ->whereNotNull('telefono')
                           ->where('telefono', '!=', '')
                           ->where('saldo_pendiente', '>', 0)
                           ->get();

        $delayMinutes = 0;
        
        foreach ($miembros as $miembro) {
            // Se despacha el job a la cola de Laravel, agregando 2 minutos de separación por cada uno
            SendWhatsAppReminderJob::dispatch($miembro)
                ->delay(now()->addMinutes($delayMinutes));
            
            $delayMinutes += 2;
        }

        return response()->json([
            'message' => 'Cola de cobranza iniciada correctamente',
            'total_procesados' => $miembros->count(),
            'tiempo_estimado_minutos' => $delayMinutes
        ]);
    }

    public function getLogs()
    {
        $logs = \App\Models\WhatsappLog::leftJoin('miembros', 'whatsapp_logs.miembro_id', '=', 'miembros.id')
            ->select('whatsapp_logs.*', 'miembros.razon_social as nombre_miembro', 'miembros.rif')
            ->orderBy('whatsapp_logs.created_at', 'desc')
            ->take(500)
            ->get();
            
        return response()->json($logs);
    }

    public function getLogsRecientes(Request $request)
    {
        $lastCheck = $request->query('last_check');
        
        $query = \App\Models\WhatsappLog::leftJoin('miembros', 'whatsapp_logs.miembro_id', '=', 'miembros.id')
            ->select('whatsapp_logs.*', 'miembros.razon_social as nombre_miembro');

        if ($lastCheck) {
            $query->where('whatsapp_logs.created_at', '>', $lastCheck);
        } else {
            // Si es la primera vez que consulta, no devolver todos, solo los de los últimos 20 segundos
            $query->where('whatsapp_logs.created_at', '>', now()->subSeconds(20));
        }

        $logs = $query->orderBy('whatsapp_logs.created_at', 'asc')->get();
        return response()->json($logs);
    }
}
