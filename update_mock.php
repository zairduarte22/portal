<?php
$miembros = DB::table('miembros')->get()->toArray();

$mockData = array_map(function($m) {
    return [
        'id' => (int)$m->id,
        'razon_social' => $m->razon_social,
        'acronimo' => $m->acronimo ?: '',
        'rif' => $m->rif,
        'fecha_ingreso' => $m->fecha_ingreso,
        'tipo' => $m->tipo,
        'direccion' => $m->direccion,
        'hacienda' => $m->hacienda ?: '',
        'hectareas' => (float)$m->hectareas,
        'solvencia' => $m->solvencia,
        'saldo_pendiente' => (float)$m->saldo_pendiente,
        'ultimo_mes' => $m->ultimo_mes,
        'correo' => $m->correo ?: '',
        'telefono' => $m->telefono ?: '',
        'tipo_explotacion' => $m->tipo_explotacion ?: 'Leche y Carne',
        'tractores' => (int)$m->tractores,
        'plantas_electricas' => (int)$m->plantas_electricas,
        'convenio' => (int)$m->convenio,
        'carnets_disponibles' => (int)$m->carnets_disponibles,
        'cupo_gasoil' => (int)$m->cupo_gasoil,
        'distribuidor_diesel' => $m->distribuidor_diesel ?: '',
        'cantidad_animales' => (int)$m->cantidad_animales,
        'produccion_leche_diaria' => (float)$m->produccion_leche_diaria,
        'municipio' => $m->municipio ?: 'N/A',
        'parroquia' => $m->parroquia ?: 'N/A'
    ];
}, $miembros);

$json = json_encode($mockData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);

$filePath = 'resources/js/app/components/mockData.ts';
$content = file_get_contents($filePath);

$content = preg_replace('/export const MIEMBROS_MOCK: Miembro\[\] = \[[\s\S]*?\];/', "export const MIEMBROS_MOCK: Miembro[] = $json;", $content);

file_put_contents($filePath, $content);
echo "mockData.ts updated with DB records.\n";
