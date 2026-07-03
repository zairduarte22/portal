<?php
DB::statement('TRUNCATE TABLE facturas RESTART IDENTITY CASCADE;');
$miembros = DB::table('miembros')->get();
foreach($miembros as $m) {
    DB::table('facturas')->insert([
        'id_miembro' => $m->id, 
        'fecha' => now(), 
        'mes_cuota' => '2026-06-01', 
        'pendiente' => 25
    ]);
}
echo 'Invoices created for ' . count($miembros) . " members.\n";
