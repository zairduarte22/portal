<?php
$facturas = DB::table('facturas')->get();
$pagos = DB::table('pagos')->get();
$vinculacion_pagos = DB::table('vinculacion_pagos')->get();

$out = "export const facturas: Factura[] = " . json_encode($facturas, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n\n";
$out .= "export const pagos: Pago[] = " . json_encode($pagos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n\n";
$out .= "export const vinculacion_pagos: VinculacionPago[] = " . json_encode($vinculacion_pagos, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . ";\n";

file_put_contents('dumped_facturas.txt', $out);
