<?php

namespace App\Services;

use TCPDF;
use TCPDF_FONTS;
use App\Models\Entrega;
use App\Models\Pago;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class EntregaPdfService
{
    protected $assetsPath;
    protected $fonts = [];

    public function __construct()
    {
        $this->assetsPath = storage_path('app/private/carnet-assets/fonts');
    }

    protected function registrarFuentes(TCPDF $pdf)
    {
        $fuentes = [
            'Poppins-Bold' => 'Poppins-Bold.ttf',
            'Poppins-Medium' => 'Poppins-Medium.ttf',
            'Lato-Regular' => 'Lato/Lato-Regular.ttf',
            'Lato-Bold' => 'Lato/Lato-Bold.ttf',
        ];

        foreach ($fuentes as $nombre => $path) {
            $ruta = $this->assetsPath . '/' . $path;
            if (file_exists($ruta)) {
                $fontname = TCPDF_FONTS::addTTFfont($ruta, 'TrueTypeUnicode', '', 96);
                if ($fontname) {
                    $pdf->AddFont($fontname, '', '', false);
                    $this->fonts[$nombre] = $fontname;
                }
            }
        }
    }

    protected function getFont($nombre)
    {
        return $this->fonts[$nombre] ?? 'helvetica';
    }

    /**
     * Genera la planilla PDF de Entrega
     */
    public function generarPdf(Entrega $entrega)
    {
        // Setup PDF
        $pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
        
        $this->registrarFuentes($pdf);

        $pdf->SetCreator(PDF_CREATOR);
        $pdf->SetAuthor('SIGAMA');
        $pdf->SetTitle('Planilla de Entrega #' . $entrega->id);
        $pdf->setPrintHeader(false);
        $pdf->setPrintFooter(false);
        $pdf->SetAutoPageBreak(true, 15);
        $pdf->SetMargins(20, 20, 20);

        // Get Pagos and calculate Invoice Range
        $pagos = Pago::where('entrega_id', $entrega->id)->get();
        
        // UGAVI Invoice range
        $ugaviMin = $pagos->whereNotNull('factura_ugavi')->min('factura_ugavi');
        $ugaviMax = $pagos->whereNotNull('factura_ugavi')->max('factura_ugavi');
        $rangoUgavi = $ugaviMin ? "$ugaviMin al $ugaviMax" : "N/A";

        // Fondo/Club Invoice range
        $fondoMin = $pagos->whereNotNull('factura_fondo')->min('factura_fondo');
        $fondoMax = $pagos->whereNotNull('factura_fondo')->max('factura_fondo');
        $rangoFondo = $fondoMin ? "$fondoMin al $fondoMax" : "N/A";
        
        $periodo = Carbon::parse($entrega->rango_desde)->format('d/m/Y') . ' al ' . Carbon::parse($entrega->rango_hasta)->format('d/m/Y');

        // Página 1: UGAVI
        $this->addPageContent($pdf, 'PLANILLA DE ENTREGA UGAVI (60%)', $periodo, $rangoUgavi, [
            'base_usd' => floatval($entrega->ugavi_base_usd),
            'base_bs' => floatval($entrega->ugavi_base_bs),
            'descuentos_usd' => floatval($entrega->descuento_cruces_usd) * 0.60,
            'descuentos_bs' => floatval($entrega->descuento_cruces_bs) * 0.60,
            'transferido_usd' => floatval($entrega->monto_pagado_ugavi_usd),
            'transferido_bs' => floatval($entrega->monto_pagado_ugavi_bs),
            'referencia_usd' => $entrega->referencia_ugavi_usd,
            'referencia_bs' => $entrega->referencia_ugavi_bs,
        ]);

        // Página 2: UGAVI Club
        $this->addPageContent($pdf, 'PLANILLA DE ENTREGA UGAVI CLUB (20%)', $periodo, $rangoFondo, [
            'base_usd' => floatval($entrega->club_base_usd),
            'base_bs' => floatval($entrega->club_base_bs),
            'descuentos_usd' => floatval($entrega->descuento_cruces_usd) * 0.20,
            'descuentos_bs' => floatval($entrega->descuento_cruces_bs) * 0.20,
            'transferido_usd' => floatval($entrega->monto_pagado_club_usd),
            'transferido_bs' => floatval($entrega->monto_pagado_club_bs),
            'referencia_usd' => $entrega->referencia_club_usd,
            'referencia_bs' => $entrega->referencia_club_bs,
        ]);

        return $pdf->Output('entrega_'.$entrega->id.'.pdf', 'S');
    }

    private function addPageContent($pdf, $titulo, $periodo, $rangoFacturas, $data)
    {
        $pdf->AddPage();
        
        // Estilos / Colores
        // Verde oscuro (Ej: #047857)
        $colorVerdePrincipal = [4, 120, 87];
        // Verde claro (Ej: #D1FAE5)
        $colorFondoTabla = [209, 250, 229];
        // Gris oscuro
        $colorTexto = [55, 65, 81];

        // Logo centrado
        $logoWidth = 30;
        $logoX = (210 - $logoWidth) / 2; // A4 ancho es 210mm
        $logoPath = storage_path('app/private/carnet-assets/img/logo-verde.png');
        if (file_exists($logoPath)) {
            $pdf->Image($logoPath, $logoX, 15, $logoWidth, 0, 'PNG', '', 'T', false, 300, '', false, false, 0, false, false, false);
        }

        // Título Principal (centrado debajo del logo)
        $pdf->SetY(60); // Ajustar según el alto real del logo
        $pdf->SetTextColor($colorVerdePrincipal[0], $colorVerdePrincipal[1], $colorVerdePrincipal[2]);
        $pdf->SetFont($this->getFont('Poppins-Bold'), '', 18);
        $pdf->Cell(0, 10, $titulo, 0, 1, 'C');
        $pdf->Ln(2);

        // Subtítulos
        $pdf->SetTextColor($colorTexto[0], $colorTexto[1], $colorTexto[2]);
        $pdf->SetFont($this->getFont('Lato-Bold'), '', 12);
        $pdf->Cell(45, 8, 'Período Procesado:', 0, 0);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 12);
        $pdf->Cell(0, 8, $periodo, 0, 1);

        $pdf->SetFont($this->getFont('Lato-Bold'), '', 12);
        $pdf->Cell(45, 8, 'Rango de Cuotas:', 0, 0);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 12);
        $pdf->Cell(0, 8, $rangoFacturas, 0, 1);
        $pdf->Ln(8);

        // Tabla de Montos
        // Anchos de columnas
        $wConcepto = 60;
        $wMontoBs = 55;
        $wMontoUsd = 55;
        
        // Table Header
        $pdf->SetFillColor($colorVerdePrincipal[0], $colorVerdePrincipal[1], $colorVerdePrincipal[2]);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont($this->getFont('Poppins-Medium'), '', 11);
        
        // Headers con bordes
        $pdf->Cell($wConcepto, 10, ' Concepto', 1, 0, 'L', true);
        $pdf->Cell($wMontoBs, 10, 'Monto (BS) ', 1, 0, 'R', true);
        $pdf->Cell($wMontoUsd, 10, 'Monto (USD) ', 1, 1, 'R', true);

        // Reset Text Color
        $pdf->SetTextColor($colorTexto[0], $colorTexto[1], $colorTexto[2]);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 11);

        // Fondo alterno
        $fill = false;
        $pdf->SetFillColor(245, 245, 245);

        // Row: Recibido (Base)
        $pdf->Cell($wConcepto, 12, ' Total Recibido (Base)', 1, 0, 'L', $fill);
        $pdf->Cell($wMontoBs, 12, number_format($data['base_bs'], 2, ',', '.') . ' Bs. ', 1, 0, 'R', $fill);
        $pdf->Cell($wMontoUsd, 12, '$ ' . number_format($data['base_usd'], 2, ',', '.') . ' ', 1, 1, 'R', $fill);
        $fill = !$fill;

        // Row: Descuentos
        $pdf->Cell($wConcepto, 12, ' Menos: Descuentos', 1, 0, 'L', $fill);
        $pdf->Cell($wMontoBs, 12, number_format($data['descuentos_bs'], 2, ',', '.') . ' Bs. ', 1, 0, 'R', $fill);
        $pdf->Cell($wMontoUsd, 12, '$ ' . number_format($data['descuentos_usd'], 2, ',', '.') . ' ', 1, 1, 'R', $fill);

        // Row: Total Transferido (Resaltado)
        $pdf->SetFont($this->getFont('Poppins-Bold'), '', 12);
        $pdf->SetFillColor($colorFondoTabla[0], $colorFondoTabla[1], $colorFondoTabla[2]);
        $pdf->SetTextColor($colorVerdePrincipal[0], $colorVerdePrincipal[1], $colorVerdePrincipal[2]);
        
        $pdf->Cell($wConcepto, 12, ' TOTAL TRANSFERIDO', 1, 0, 'L', true);
        $pdf->Cell($wMontoBs, 12, number_format($data['transferido_bs'], 2, ',', '.') . ' Bs. ', 1, 0, 'R', true);
        $pdf->Cell($wMontoUsd, 12, '$ ' . number_format($data['transferido_usd'], 2, ',', '.') . ' ', 1, 1, 'R', true);
        
        $pdf->Ln(8);
        
        // Referencias
        $pdf->SetTextColor($colorTexto[0], $colorTexto[1], $colorTexto[2]);
        $pdf->SetFont($this->getFont('Lato-Bold'), '', 11);
        $pdf->Cell(45, 8, 'Referencia (BS):', 0, 0);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 11);
        $pdf->Cell(0, 8, $data['referencia_bs'] ?: 'N/A', 0, 1);
        
        $pdf->SetFont($this->getFont('Lato-Bold'), '', 11);
        $pdf->Cell(45, 8, 'Referencia (USD):', 0, 0);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 11);
        $pdf->Cell(0, 8, $data['referencia_usd'] ?: 'N/A', 0, 1);
        
        // --- Bloque de Firmas ---
        $pdf->Ln(35);
        $yFirmas = $pdf->GetY();
        
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 10);
        // Lineas
        $pdf->SetX(20);
        $pdf->Cell(75, 5, '__________________________________', 0, 0, 'C');
        $pdf->SetX(115);
        $pdf->Cell(75, 5, '__________________________________', 0, 1, 'C');
        
        // Cargos
        $pdf->SetFont($this->getFont('Lato-Bold'), '', 10);
        $pdf->SetX(20);
        $pdf->Cell(75, 5, 'Entregado por:', 0, 0, 'C');
        $pdf->SetX(115);
        $pdf->Cell(75, 5, 'Recibido por:', 0, 1, 'C');
        
        // Nombres
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 10);
        $pdf->SetX(20);
        $pdf->Cell(75, 5, 'Zair Duarte', 0, 0, 'C');
        $pdf->SetX(115);
        $pdf->Cell(75, 5, 'Leonel Ramos', 0, 1, 'C');

        // Instituciones
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 8);
        $pdf->SetTextColor(100, 100, 100);
        $pdf->SetX(20);
        $pdf->MultiCell(75, 4, 'Fondo de UGAVI para Desarrollo Agropecuario', 0, 'C', false, 0);
        $pdf->SetX(115);
        $pdf->MultiCell(75, 4, 'Unión de Ganaderos del Municipio Rosario de Perijá del Estado Zulia', 0, 'C', false, 1);
        
        // ------------------------

        $pdf->Ln(15);
        
        // Footer message
        $pdf->SetTextColor(150, 150, 150);
        $pdf->SetFont($this->getFont('Lato-Regular'), '', 10);
        $pdf->Cell(0, 10, 'Documento generado automáticamente por el sistema SIGAMA', 0, 1, 'C');
    }
}
