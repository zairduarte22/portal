<?php

namespace App\Services;

use TCPDF;
use TCPDF_FONTS;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class CarnetPdfService
{
    protected $cardWidthPt = 242.68;
    protected $cardHeightPt = 153.07;
    protected $assetsPath;

    public function __construct()
    {
        $this->assetsPath = storage_path('app/private/carnet-assets');
    }

    /**
     * Registra las fuentes Poppins
     */
    protected function registrarFuentes(TCPDF $pdf)
    {
        $fuentes = [
            'Poppins-Bold' => 'Poppins-Bold.ttf',
            'Poppins-Medium' => 'Poppins-Medium.ttf',
        ];

        foreach ($fuentes as $nombreLogico => $nombreArchivo) {
            $rutaFuente = $this->assetsPath . '/fonts/' . $nombreArchivo;
            if (file_exists($rutaFuente)) {
                $fontname = TCPDF_FONTS::addTTFfont($rutaFuente, 'TrueTypeUnicode', '', 96);
                if ($fontname) {
                    $pdf->AddFont($fontname, '', '', false);
                    $this->nombresFuentes[$nombreLogico] = $fontname;
                }
            } else {
                Log::warning("No se encontró la fuente en: $rutaFuente");
            }
        }
    }

    protected $nombresFuentes = [];

    protected function getFontName($nombreLogico)
    {
        return $this->nombresFuentes[$nombreLogico] ?? 'helvetica';
    }

    public function generarPdfCarnet($carnet)
    {
        $tempDir = storage_path('app/private/tmp_qr_codes');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $uuid = Str::uuid()->toString();
        $tempQrPath = $tempDir . '/qr_' . $uuid . '.svg';
        $tempPdfPath = $tempDir . '/carnet_' . $uuid . '.pdf';

        try {
            $persona = $carnet->persona;
            $miembro = $carnet->miembro;
            
            // Relación de Vinculación para Director o Presidente
            $esPresidente = false;
            $esDirector = false;
            if ($miembro && $persona) {
                // Asume que la relación vinculacion está en DB::table('vinculacion')
                $vinc = DB::table('vinculacion')->where('id_persona', $persona->id)
                    ->where('id_miembro', $miembro->id)
                    ->first();
                if ($vinc) {
                    $esPresidente = $vinc->presidente;
                    $esDirector = $vinc->director;
                }
            }

            $esRutaEspecial = $esPresidente || $esDirector || ($persona->honorario ?? false) || ($persona->ex_presidente ?? false);

            if ($esRutaEspecial) {
                if ($esPresidente || ($persona->ex_presidente ?? false)) {
                    $frontBg = 'presidente.png';
                    $backBg = 'presidente-back.png';
                } else {
                    $frontBg = 'director.png';
                    $backBg = 'director-back.png';
                }
                
                $textoAnverso = $persona->nombre ?? '';
                $textoReversoSuperior = $miembro ? $miembro->razon_social : 'Fondo UGAVI';
                $textoReversoCentral = $miembro ? $miembro->rif : '';
                $textoReversoEsquina = $miembro ? strval($miembro->id) : '';
                $fechaVencimientoStr = "29/02/2028";
            } else {
                $frontBg = 'front-final.png';
                $backBg = 'back-final.png';
                $textoAnverso = $miembro->razon_social ?? '';
                $textoReversoSuperior = $persona->nombre ?? '';
                $textoReversoCentral = "V-" . ($persona->ci_numero ?? '');
                $textoReversoEsquina = strval($miembro->id ?? '');
                // Convertir fecha de emisión
                $fechaVencimientoStr = $carnet->fecha_vencimiento ? date('d/m/Y', strtotime($carnet->fecha_vencimiento)) : '';
            }

            // Inicializar el Canvas en Puntos (pt)
            $pdf = new TCPDF('L', 'pt', [$this->cardWidthPt, $this->cardHeightPt], true, 'UTF-8', false);
            // Disable auto page break to prevent unexpected shifts
            $pdf->SetAutoPageBreak(false);
            $pdf->SetCreator(PDF_CREATOR);
            $pdf->SetAuthor('Membresias UGAVI');
            $pdf->SetTitle('Carnet');
            $pdf->setPrintHeader(false);
            $pdf->setPrintFooter(false);
            $pdf->SetAutoPageBreak(FALSE, 0);
            $pdf->SetMargins(0, 0, 0);

            $this->registrarFuentes($pdf);

            // ==========================================
            // --- PÁGINA 1: ANVERSO ---
            // ==========================================
            $pdf->AddPage();
            
            $frontImgPath = $this->assetsPath . '/img/' . $frontBg;
            if (file_exists($frontImgPath)) {
                $pdf->Image($frontImgPath, 0, 0, $this->cardWidthPt, $this->cardHeightPt, '', '', '', false, 300, '', false, false, 0);
            }

            if ($esRutaEspecial) {
                // Dorado
                $pdf->SetTextColor(211, 176, 56);
                $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 11);
                $anchoMaximo = 30;
                $espacioEntreLineas = 12;
            } else {
                // Negro
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 9);
                $anchoMaximo = 21;
                $espacioEntreLineas = 10;
            }

            $lineasAnverso = explode("\n", wordwrap($textoAnverso, $anchoMaximo, "\n", true));
            
            $yBasePython = count($lineasAnverso) > 1 ? 130 : 133;
            // Python Y_rl = CARD_HEIGHT - yBasePython
            // TCPDF Y_tc = CARD_HEIGHT - Y_rl = yBasePython
            $yInicialTcpf = $yBasePython - ($esRutaEspecial ? 11 : 9);

            foreach ($lineasAnverso as $i => $linea) {
                $yActual = $yInicialTcpf + ($i * $espacioEntreLineas);
                $pdf->SetXY(0, $yActual);
                $pdf->MultiCell($this->cardWidthPt, 0, $linea, 0, 'C', false, 1);
            }

            // ==========================================
            // --- PÁGINA 2: REVERSO ---
            // ==========================================
            $pdf->AddPage();
            
            $backImgPath = $this->assetsPath . '/img/' . $backBg;
            if (file_exists($backImgPath)) {
                $pdf->Image($backImgPath, 0, 0, $this->cardWidthPt, $this->cardHeightPt, '', '', '', false, 300, '', false, false, 0);
            }

            if ($esRutaEspecial) {
                $pdf->SetTextColor(255, 255, 255);
                $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 8);
                $anchoMaximoRev = 30;
                $espacioEntreLineasRev = 10;
            } else {
                $pdf->SetTextColor(0, 0, 0);
                $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 11);
                $nuevoAncho = max(round(strlen($textoReversoSuperior) / 2) + 5, 20);
                $anchoMaximoRev = $nuevoAncho;
                $espacioEntreLineasRev = 12;
            }

            $lineasReverso = explode("\n", wordwrap($textoReversoSuperior, $anchoMaximoRev, "\n", true));
            
            $yInicialRev = 28.62 - ($esRutaEspecial ? 8 : 11);

            foreach ($lineasReverso as $i => $linea) {
                $yActual = $yInicialRev + ($i * $espacioEntreLineasRev);
                $pdf->SetXY(0, $yActual);
                $pdf->MultiCell($this->cardWidthPt, 0, $linea, 0, 'C', false, 1);
            }

            // Central
            $yCentral = $yInicialRev + (count($lineasReverso) * $espacioEntreLineasRev);
            $pdf->SetFont($this->getFontName('Poppins-Medium'), '', 7);
            if ($esRutaEspecial) {
                $pdf->SetTextColor(255, 255, 255);
            } else {
                $pdf->SetTextColor(0, 0, 0);
            }
            $pdf->SetXY(0, $yCentral);
            $pdf->MultiCell($this->cardWidthPt, 0, $textoReversoCentral, 0, 'C', false, 1);

            // Fecha de Vencimiento
            $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 5);
            if ($esRutaEspecial) {
                $pdf->SetTextColor(0, 0, 0);
            } else {
                $pdf->SetTextColor(255, 255, 255);
            }
            $pdf->SetXY(82, 88.5 - 5);
            $pdf->Cell(0, 0, $fechaVencimientoStr, 0, 0, 'L');

            // Esquina
            $textoReversoEsquina = $miembro ? strval($miembro->id) : '';
            $pdf->SetFont($this->getFontName('Poppins-Bold'), '', 7);
            
            if ($esRutaEspecial) {
                $pdf->SetTextColor(0, 0, 0);
            } else {
                $pdf->SetTextColor(255, 255, 255);
            }
            
            $wStr = $pdf->GetStringWidth($textoReversoEsquina);
            $pdf->Text(222 - $wStr, 22.90 - 7, $textoReversoEsquina);

            // --- QR CODE ---
            $serverName = config('app.url', 'https://membresiasugavi.info');
            $urlVerificacion = rtrim($serverName, '/') . "/c/" . $carnet->numero_carnet;
            
            QrCode::format('svg')->size(150)->margin(1)->generate($urlVerificacion, $tempQrPath);
            
            $qrWidthPt = 48.27;
            $qrHeightPt = 48.27;
            $qrXPt = 177;
            $qrYPt = 81.10;
            
            $pdf->ImageSVG($tempQrPath, $qrXPt, $qrYPt, $qrWidthPt, $qrHeightPt);

            // Salvar
            $pdf->Output($tempPdfPath, 'F');

            return $tempPdfPath;

        } catch (Exception $e) {
            if (file_exists($tempPdfPath)) {
                @unlink($tempPdfPath);
            }
            throw $e;
        } finally {
            if (file_exists($tempQrPath)) {
                @unlink($tempQrPath);
            }
        }
    }
}
