<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use Carbon\Carbon;

class ExportController extends Controller
{
    public function exportarLibroVentas(Request $request)
    {
        $fechaInicio = $request->query('desde');
        $fechaFin = $request->query('hasta');

        $query = DB::table('libro_ventas')
            ->leftJoin('miembros', 'libro_ventas.id_miembro', '=', 'miembros.id')
            ->select(
                'libro_ventas.*',
                'miembros.razon_social as miembro_nombre',
                'miembros.rif as miembro_rif'
            );

        if ($fechaInicio) {
            $query->where('libro_ventas.fecha', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->where('libro_ventas.fecha', '<=', $fechaFin);
        }

        $resultados = $query->orderBy('libro_ventas.fecha', 'asc')
            ->orderBy('libro_ventas.numero_factura', 'asc')
            ->get();

        if ($resultados->isEmpty()) {
            // Retorna un script simple que cierra la pestaña y alerta
            return response("<script>alert('No hay registros en el periodo seleccionado.'); window.close();</script>");
        }

        $f_inicio_str = $fechaInicio ? Carbon::parse($fechaInicio)->format('d/m/Y') : '';
        $f_fin_str = $fechaFin ? Carbon::parse($fechaFin)->format('d/m/Y') : '';
        $periodo_str = $f_inicio_str && $f_fin_str ? "{$f_inicio_str} AL {$f_fin_str}" : "TODOS LOS REGISTROS";
        $mes_anio = $fechaFin ? Carbon::parse($fechaFin)->format('m/Y') : Carbon::now()->format('m/Y');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("Libro de Ventas");

        $this->aplicarEstilosSeniat($sheet, $periodo_str, "Libro de ventas del:", "Ventas");

        $totales = ['total_ventas' => 0, 'ventas_no_gravadas' => 0];
        $r_idx = 6;

        foreach ($resultados as $idx => $row) {
            $monto_total = (float)$row->monto_bs;
            $totales['total_ventas'] += $monto_total;
            $totales['ventas_no_gravadas'] += $monto_total;

            $fecha_str = $row->fecha ? Carbon::parse($row->fecha)->format('d/m/Y') : '';
            $num_control = $row->numero_control ?? 'S/N';
            
            $rif = $row->miembro_rif ?? 'V-000000000';
            $razon_social = $row->miembro_nombre ?? ($row->beneficiario ?? 'CONTRIBUYENTE NO REGISTRADO');

            $fila_datos = [
                $idx + 1,                     // 1
                $fecha_str,                   // 2
                "",                           // 3
                "",                           // 4
                $rif,                         // 5
                $razon_social,                // 6
                "",                           // 7
                $row->numero_factura ?? 'S/N',// 8
                $num_control,                 // 9
                "", "", "", "",               // 10-13
                $monto_total,                 // 14
                $monto_total,                 // 15
                0.00, "16,00", 0.00,          // 16-18
                0.00, "8,00", 0.00,           // 19-21
                0.00, "12,00", 0.00,          // 22-24
                0.00, "8,00", 0.00,           // 25-27
                0.00,                         // 28
                0.00                          // 29
            ];

            $this->llenarFilaDatos($sheet, $r_idx, $fila_datos);
            $r_idx++;
        }

        $this->llenarTotalesYResumen($sheet, $r_idx, $periodo_str, $totales, "TOTAL LIBRO DE VENTAS", "Ventas");

        $safe_filename = str_replace([' ', '/'], ['_', '-'], $periodo_str);
        return $this->descargarExcel($spreadsheet, "Libro_Ventas_" . $safe_filename);
    }

    public function exportarLibroCompras(Request $request)
    {
        $fechaInicio = $request->query('desde');
        $fechaFin = $request->query('hasta');

        $query = DB::table('libro_compras')
            ->leftJoin('proveedor', 'libro_compras.id_proveedor', '=', 'proveedor.id')
            ->select(
                'libro_compras.*',
                'proveedor.razon_social as proveedor_nombre',
                'proveedor.rif as proveedor_rif'
            );

        if ($fechaInicio) {
            $query->where('libro_compras.fecha', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->where('libro_compras.fecha', '<=', $fechaFin);
        }

        $resultados = $query->orderBy('libro_compras.fecha', 'asc')
            ->orderBy('libro_compras.numero_factura', 'asc')
            ->get();

        if ($resultados->isEmpty()) {
            return response("<script>alert('No hay registros en el periodo seleccionado.'); window.close();</script>");
        }

        $f_inicio_str = $fechaInicio ? Carbon::parse($fechaInicio)->format('d/m/Y') : '';
        $f_fin_str = $fechaFin ? Carbon::parse($fechaFin)->format('d/m/Y') : '';
        $periodo_str = $f_inicio_str && $f_fin_str ? "{$f_inicio_str} AL {$f_fin_str}" : "TODOS LOS REGISTROS";
        $mes_anio = $fechaFin ? Carbon::parse($fechaFin)->format('m/Y') : Carbon::now()->format('m/Y');

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("Libro de Compras");

        $this->aplicarEstilosSeniat($sheet, $periodo_str, "Libro de compras del:", "Compras");

        $totales = ['total_ventas' => 0, 'ventas_no_gravadas' => 0];
        $r_idx = 6;

        foreach ($resultados as $idx => $row) {
            $monto_total = (float)$row->monto_bs;
            $totales['total_ventas'] += $monto_total;
            $totales['ventas_no_gravadas'] += $monto_total;

            $fecha_str = $row->fecha ? Carbon::parse($row->fecha)->format('d/m/Y') : '';
            $num_control = $row->numero_control ?? 'S/N';
            
            $rif = $row->proveedor_rif ?? 'V-000000000';
            $razon_social = $row->proveedor_nombre ?? 'PROVEEDOR NO REGISTRADO';

            $fila_datos = [
                $idx + 1,                     // 1
                $fecha_str,                   // 2
                "",                           // 3
                "",                           // 4
                $rif,                         // 5
                $razon_social,                // 6
                "",                           // 7
                $row->numero_factura ?? 'S/N',// 8
                $num_control,                 // 9
                "", "", "", "",               // 10-13
                $monto_total,                 // 14
                $monto_total,                 // 15
                0.00, "16,00", 0.00,          // 16-18
                0.00, "8,00", 0.00,           // 19-21
                0.00, "12,00", 0.00,          // 22-24
                0.00, "8,00", 0.00,           // 25-27
                0.00,                         // 28
                0.00                          // 29
            ];

            $this->llenarFilaDatos($sheet, $r_idx, $fila_datos);
            $r_idx++;
        }

        $this->llenarTotalesYResumen($sheet, $r_idx, $periodo_str, $totales, "TOTAL LIBRO DE COMPRAS", "Compras");

        $safe_filename = str_replace([' ', '/'], ['_', '-'], $periodo_str);
        return $this->descargarExcel($spreadsheet, "Libro_Compras_" . $safe_filename);
    }

    private function aplicarEstilosSeniat($sheet, $mes_anio, $titulo_libro, $tipo_operacion)
    {
        $styleBorderThin = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]];
        $styleFontBold = ['font' => ['bold' => true]];
        $styleAlignCenter = [
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
                'wrapText' => true
            ]
        ];

        $sheet->setCellValue('A1', "FONDO DE UGAVI PARA DESARROLLO AGROPECUARIO");
        $sheet->getStyle('A1')->applyFromArray($styleFontBold);
        $sheet->setCellValue('A2', "RIF: J-30646602-9");
        $sheet->getStyle('A2')->applyFromArray($styleFontBold);
        $sheet->setCellValue('A3', "{$titulo_libro} " . $mes_anio);
        $sheet->getStyle('A3')->applyFromArray($styleFontBold);

        // Nivel 1 cabeceras
        $sheet->mergeCells('P4:R4'); $sheet->setCellValue('P4', "{$tipo_operacion} a no contribuyentes")->getStyle('P4')->applyFromArray($styleFontBold)->applyFromArray($styleAlignCenter);
        $sheet->mergeCells('S4:U4'); $sheet->setCellValue('S4', "{$tipo_operacion} a no contribuyentes")->getStyle('S4')->applyFromArray($styleFontBold)->applyFromArray($styleAlignCenter);
        $sheet->mergeCells('V4:X4'); $sheet->setCellValue('V4', "{$tipo_operacion} a contribuyentes")->getStyle('V4')->applyFromArray($styleFontBold)->applyFromArray($styleAlignCenter);
        $sheet->mergeCells('Y4:AA4'); $sheet->setCellValue('Y4', "{$tipo_operacion} a contribuyentes")->getStyle('Y4')->applyFromArray($styleFontBold)->applyFromArray($styleAlignCenter);

        for ($col = 16; $col <= 27; $col++) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col);
            $sheet->getStyle($colLetter . '4')->applyFromArray($styleBorderThin);
        }

        $headers_f5 = [
            "Número de\noperación", "Fecha de la\nfactura", "Número\nReporte\nGlobal",
            "Número de\nMáquina\nFiscal", "RIF", "Nombre o Razón Social",
            "Número de\nplanilla de\nexportación", "Número de\nfactura",
            "Número de\ncontrol de\nfactura", "Número de\nNota de\ndébito",
            "Número de\nNota de\ncrédito", "Tipo de\ntransacción", "Número de\nfactura\nafectada",
            "Total {$tipo_operacion}\nincluyendo\nIVA", "{$tipo_operacion}\ninternas\nno gravadas",
            "Base\nimponible", "%\nAlícuota", "Impuesto\nIVA",
            "Base\nimponible", "%\nAlícuota", "Impuesto\nIVA",
            "Base\nimponible", "%\nAlícuota", "Impuesto\nIVA",
            "Base\nimponible", "%\nAlícuota", "Impuesto\nIVA",
            "IVA\nretenido\npor el\ncomprador", "IVA\npercibido"
        ];

        foreach ($headers_f5 as $col => $text) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1);
            $sheet->setCellValue($colLetter . '5', $text);
            $sheet->getStyle($colLetter . '5')->applyFromArray($styleFontBold)->applyFromArray($styleAlignCenter)->applyFromArray($styleBorderThin);
        }

        $anchos = [10, 12, 10, 10, 15, 55, 15, 12, 12, 10, 10, 10, 10, 15, 15, 10, 8, 10, 10, 8, 10, 10, 8, 10, 10, 8, 10, 10, 10];
        foreach ($anchos as $i => $w) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);
            $sheet->getColumnDimension($colLetter)->setWidth($w);
        }
        $sheet->getRowDimension(5)->setRowHeight(60);
    }

    private function llenarFilaDatos($sheet, $r_idx, $fila_datos)
    {
        $styleBorderThin = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]];
        $styleAlignLeft = ['alignment' => ['horizontal' => Alignment::HORIZONTAL_LEFT, 'vertical' => Alignment::VERTICAL_CENTER]];

        foreach ($fila_datos as $c_idx => $val) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c_idx + 1);
            $cell = $colLetter . $r_idx;
            $sheet->setCellValue($cell, $val);
            $sheet->getStyle($cell)->applyFromArray($styleBorderThin);

            if (in_array($c_idx + 1, [14, 15, 16, 18, 19, 21, 22, 24, 25, 27, 28, 29])) {
                $sheet->getStyle($cell)->getNumberFormat()->setFormatCode('#,##0.00');
            }

            if (in_array($c_idx + 1, [5, 6])) {
                $sheet->getStyle($cell)->applyFromArray($styleAlignLeft);
            } else {
                $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
        }
    }

    private function llenarTotalesYResumen($sheet, $last_row, $mes_anio, $totales, $titulo_totales, $tipo_operacion)
    {
        $styleBorderThin = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]];
        $styleFontBold = ['font' => ['bold' => true]];

        $sheet->mergeCells("A{$last_row}:M{$last_row}");
        $sheet->setCellValue("A{$last_row}", "{$titulo_totales} {$mes_anio}");
        $sheet->getStyle("A{$last_row}")->applyFromArray($styleFontBold)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);

        for ($c = 1; $c <= 13; $c++) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c);
            $sheet->getStyle("{$colLetter}{$last_row}")->applyFromArray($styleBorderThin);
        }

        $valores_totales = [
            14 => $totales['total_ventas'], 15 => $totales['ventas_no_gravadas'],
            16 => 0.00, 18 => 0.00, 19 => 0.00, 21 => 0.00, 22 => 0.00, 24 => 0.00, 25 => 0.00, 27 => 0.00, 28 => 0.00, 29 => 0.00  
        ];
        $alicuotas_fijas = [17 => "16,00", 20 => "8,00", 23 => "12,00", 26 => "8,00"];

        for ($col_idx = 14; $col_idx <= 29; $col_idx++) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col_idx);
            $cell = "{$colLetter}{$last_row}";
            $sheet->getStyle($cell)->applyFromArray($styleFontBold)->applyFromArray($styleBorderThin);
            
            if (isset($valores_totales[$col_idx])) {
                $sheet->setCellValue($cell, $valores_totales[$col_idx]);
                $sheet->getStyle($cell)->getNumberFormat()->setFormatCode('#,##0.00');
            } elseif (isset($alicuotas_fijas[$col_idx])) {
                $sheet->setCellValue($cell, $alicuotas_fijas[$col_idx]);
                $sheet->getStyle($cell)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            }
        }

        // Resumen
        $start_resumen = $last_row + 3;
        $conceptos = [
            ["Total General de {$tipo_operacion} incluyendo Iva", $totales['total_ventas']],
            ["Total General de {$tipo_operacion} sin Derecho a Debito Fiscal", $totales['ventas_no_gravadas']],
            ["Total General base Imponible", 0.00],
            ["Total {$tipo_operacion} a no contribuyentes", 0.00],
            ["Total {$tipo_operacion} a contribuyentes", 0.00],
            ["Total General Impuesto Iva 12%", 0.00], 
            ["Total Impuesto Iva 16% A No Contribuyentes", 0.00],
            ["Total Impuesto Iva 12% A Contribuyentes", 0.00],
            ["Total General Impuesto Iva 8%", 0.00],
            ["Total Impuesto Iva 8% A No Contribuyentes", 0.00],
            ["Total Impuesto Iva 8% A Contribuyentes", 0.00],
            ["Total General Iva retenido en el periodo (por el vendedor)", 0.00],
            ["Total Iva acumulado por descontar", 0.00],
            ["Total General Iva Percibido", 0.00]
        ];

        $sheet->mergeCells("B{$start_resumen}:F{$start_resumen}");
        $sheet->setCellValue("B{$start_resumen}", "Resumen del Libro de {$tipo_operacion} {$mes_anio}");
        $sheet->getStyle("B{$start_resumen}:F{$start_resumen}")->applyFromArray($styleFontBold)->applyFromArray($styleBorderThin);
        $sheet->setCellValue("G{$start_resumen}", "Montos");
        $sheet->getStyle("G{$start_resumen}")->applyFromArray($styleFontBold)->applyFromArray($styleBorderThin)->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        foreach ($conceptos as $i => $item) {
            $curr_row = $start_resumen + $i + 1;
            $sheet->mergeCells("B{$curr_row}:F{$curr_row}");
            $sheet->setCellValue("B{$curr_row}", $item[0]);
            $sheet->getStyle("B{$curr_row}:F{$curr_row}")->applyFromArray($styleBorderThin);
            
            $sheet->setCellValue("G{$curr_row}", $item[1]);
            $sheet->getStyle("G{$curr_row}")->applyFromArray($styleBorderThin)->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("G{$curr_row}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_RIGHT);
        }
    }

    private function descargarExcel($spreadsheet, $filename)
    {
        $writer = new Xlsx($spreadsheet);
        
        $callback = function() use($writer) {
            $writer->save('php://output');
        };

        return response()->streamDownload($callback, "{$filename}.xlsx", [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Cache-Control' => 'max-age=0',
        ]);
    }
    public function exportarConciliacion(Request $request)
    {
        $moneda = $request->query('moneda', 'ves');
        $titulo_moneda = $moneda === 'ves' ? 'BOLÍVARES (VES)' : 'DÓLARES (USD)';
        
        $fechaInicio = $request->query('desde');
        $fechaFin = $request->query('hasta');

        $query = $moneda === 'ves' ? DB::table('cuenta_banco') : DB::table('cuenta_moneda_extranjera');
        
        if ($fechaInicio) {
            $query->where('fecha', '>=', $fechaInicio);
        }
        if ($fechaFin) {
            $query->where('fecha', '<=', $fechaFin);
        }

        $resultados = $query->orderBy('fecha', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        if ($resultados->isEmpty()) {
            return response("<script>alert('No hay registros en el periodo seleccionado.'); window.close();</script>");
        }

        $f_inicio_str = $fechaInicio ? Carbon::parse($fechaInicio)->format('d/m/Y') : '';
        $f_fin_str = $fechaFin ? Carbon::parse($fechaFin)->format('d/m/Y') : '';
        $periodo_str = $f_inicio_str && $f_fin_str ? "{$f_inicio_str} AL {$f_fin_str}" : "TODOS LOS REGISTROS";

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle("Libro de Banco");

        $styleBorderThin = ['borders' => ['allBorders' => ['borderStyle' => Border::BORDER_THIN]]];
        $headerFill = [
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FF006400'], // Dark Green
            ],
            'font' => ['bold' => true, 'color' => ['argb' => 'FFFFFFFF']],
            'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
        ];
        $grisClaro = [
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => 'FFF2F2F2'],
            ]
        ];

        // --- ENCABEZADO PERSONALIZADO ---
        $sheet->mergeCells('A1:H1');
        $sheet->setCellValue('A1', "REGISTRO LIBRO DE BANCO");
        $sheet->getStyle('A1')->getFont()->setBold(true)->setSize(14);
        $sheet->getStyle('A1')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

        $sheet->setCellValue('A2', "BANCO: BANCO NACIONAL DE CRÉDITO");
        $sheet->setCellValue('A3', "CUENTA: 0191-0012-6069-0210-0002-041");
        $sheet->setCellValue('A4', "MONEDA: {$titulo_moneda}");
        $sheet->setCellValue('A5', "PERIODO: {$periodo_str}");

        $sheet->getStyle('A2:A5')->getFont()->setBold(true);

        // --- CABECERA DE TABLA ---
        $headers = ["FECHA", "OP", "REFERENCIA", "BENEFICIARIO", "DESCRIPCIÓN", "INGRESOS", "EGRESOS", "SALDO"];
        foreach ($headers as $col => $text) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($col + 1);
            $sheet->setCellValue($colLetter . '7', $text);
            $sheet->getStyle($colLetter . '7')->applyFromArray($headerFill)->applyFromArray($styleBorderThin);
        }

        // --- FILA DE SALDO INICIAL ---
        $saldo_inicial = 0;
        if ($fechaInicio) {
            $table = $moneda === 'ves' ? 'cuenta_banco' : 'cuenta_moneda_extranjera';
            $ingresosPrevios = DB::table($table)->where('fecha', '<', $fechaInicio)->sum('debe');
            $egresosPrevios = DB::table($table)->where('fecha', '<', $fechaInicio)->sum('haber');
            $saldo_inicial = floatval($ingresosPrevios) - floatval($egresosPrevios);
        }
        $sheet->setCellValue('A8', "---")->getStyle('A8')->applyFromArray($styleBorderThin);
        $sheet->setCellValue('E8', "SALDO ANTERIOR AL PERIODO")->getStyle('E8')->applyFromArray($styleBorderThin);
        $sheet->getStyle('E8')->getFont()->setItalic(true);
        $sheet->setCellValue('H8', $saldo_inicial)->getStyle('H8')->applyFromArray($styleBorderThin);
        $sheet->getStyle('H8')->getNumberFormat()->setFormatCode('#,##0.00');
        $sheet->getStyle('H8')->getFont()->setBold(true);

        // Colorear fila de saldo inicial
        for ($c = 1; $c <= 8; $c++) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c);
            $sheet->getStyle("{$colLetter}8")->applyFromArray($grisClaro);
            $sheet->getStyle("{$colLetter}8")->applyFromArray($styleBorderThin);
        }

        // --- LLENAR DATOS ---
        $saldo_acumulado = $saldo_inicial;
        $r_idx = 9;

        foreach ($resultados as $row) {
            $f_val = $row->fecha ? Carbon::parse($row->fecha)->format('d/m/Y') : '-';
            
            $ingreso = floatval($row->debe ?? 0);
            $egreso = floatval($row->haber ?? 0);
            $saldo_acumulado += ($ingreso - $egreso);

            $sheet->setCellValue("A{$r_idx}", $f_val);
            $sheet->setCellValue("B{$r_idx}", $row->tipo_operacion ?? '-');
            $sheet->setCellValue("C{$r_idx}", $row->referencia ?? '-');
            $sheet->setCellValue("D{$r_idx}", $row->beneficiario ?? '-');
            $sheet->setCellValue("E{$r_idx}", $row->descripcion ?? '-');
            
            $sheet->setCellValue("F{$r_idx}", $ingreso);
            $sheet->setCellValue("G{$r_idx}", $egreso);
            $sheet->setCellValue("H{$r_idx}", $saldo_acumulado);

            for ($c = 1; $c <= 8; $c++) {
                $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($c);
                $sheet->getStyle("{$colLetter}{$r_idx}")->applyFromArray($styleBorderThin);
            }

            $sheet->getStyle("F{$r_idx}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("G{$r_idx}")->getNumberFormat()->setFormatCode('#,##0.00');
            $sheet->getStyle("H{$r_idx}")->getNumberFormat()->setFormatCode('#,##0.00');

            $r_idx++;
        }

        // Ajuste de anchos
        $anchos = [12, 10, 15, 25, 35, 15, 15, 15];
        foreach ($anchos as $i => $w) {
            $colLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($i + 1);
            $sheet->getColumnDimension($colLetter)->setWidth($w);
        }

        $safe_filename = str_replace([' ', '/'], ['_', '-'], $periodo_str);
        return $this->descargarExcel($spreadsheet, "Libro_Banco_" . strtoupper($moneda) . "_" . $safe_filename);
    }

    public function reporteGeneralPagos(Request $request)
    {
        $f_inicio_str = $request->input('desde');
        $f_fin_str = $request->input('hasta');

        $query = DB::table('pagos');
        if ($f_inicio_str) {
            $query->where('fecha', '>=', $f_inicio_str);
        }
        if ($f_fin_str) {
            $query->where('fecha', '<=', $f_fin_str);
        }
        $pagos = $query->orderBy('factura_ugavi', 'asc')->get();

        $facturas_completo = [];
        foreach ($pagos as $p) {
            $facturas_completo[] = [
                'FECHA' => $p->fecha,
                'FACT_UGAVI' => $p->factura_ugavi,
                'METODO_PAGO' => $p->metodo_pago,
                'MONTO_BS' => floatval($p->monto_bs),
                'MONTO_DIVISAS' => floatval($p->monto)
            ];
        }

        $f_inicio_str = $f_inicio_str ?: date('Y-m-d');
        $f_fin_str = $f_fin_str ?: date('Y-m-d');
        
        $fecha_inicio = strtotime($f_inicio_str);
        $fecha_fin = strtotime($f_fin_str);

        // Incluir el archivo con la lógica del reporte
        require_once storage_path('app/private/reports/ReporteCuotas.php');

        // Formato para el filtro de fechas (requerido por generarReporteConFormatoImagen)
        $filtroReporte = [$f_inicio_str, $f_fin_str];

        // Llamar a la función que genera el PDF
        $pdfContent = generarReporteConFormatoImagen(
            $facturas_completo,
            $filtroReporte,
            true, // descargarPdf
            storage_path('app/private/carnet-assets/img/logo.png')
        );

        if (!$pdfContent) {
            return response("<script>alert('No se pudo generar el reporte.'); window.close();</script>");
        }

        return response($pdfContent, 200)
            ->header('Content-Type', 'application/pdf')
            ->header('Content-Disposition', 'inline; filename="Reporte_General_Pagos.pdf"');
    }
}
