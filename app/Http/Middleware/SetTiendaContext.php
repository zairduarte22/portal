<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\TiendaContext;

class SetTiendaContext
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Intentar obtener de header X-Tienda-Id
        $tiendaId = $request->header('X-Tienda-Id');

        // 2. Si no hay header, intentar de la ruta (slug) si estamos en una ruta que lo provee
        if (!$tiendaId && $request->route('slug')) {
            $tienda = \Illuminate\Support\Facades\DB::table('tiendas')->where('slug', $request->route('slug'))->first();
            if ($tienda) {
                $tiendaId = $tienda->id;
            }
        }
        
        // 3. Fallback a la tienda principal (Tasca) si es requerido (opcional)
        if (!$tiendaId) {
            $tiendaId = 1; // Default
        }

        if ($tiendaId) {
            app(TiendaContext::class)->setTiendaId((int) $tiendaId);
        }

        return $next($request);
    }
}
