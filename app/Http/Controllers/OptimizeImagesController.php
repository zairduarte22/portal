<?php

namespace App\Http\Controllers;

use App\Models\InsumoTasca;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OptimizeImagesController extends Controller
{
    public function optimize()
    {
        $insumos = InsumoTasca::whereNotNull('imagen')->get();
        $results = [
            'total' => $insumos->count(),
            'optimized' => 0,
            'errors' => 0,
            'skipped' => 0,
            'details' => []
        ];

        $max = 800;

        foreach ($insumos as $insumo) {
            $currentPath = $insumo->imagen;
            
            // Check if file exists in public storage
            if (!Storage::disk('public')->exists($currentPath)) {
                $results['skipped']++;
                $results['details'][] = "Insumo ID {$insumo->id}: Archivo no encontrado ({$currentPath})";
                continue;
            }

            $absolutePath = storage_path('app/public/' . $currentPath);
            $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

            // Only process jpg, jpeg, png, webp
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                $results['skipped']++;
                $results['details'][] = "Insumo ID {$insumo->id}: Extensión no soportada ({$extension})";
                continue;
            }

            list($width, $height) = @getimagesize($absolutePath);
            
            if (!$width || !$height) {
                $results['errors']++;
                $results['details'][] = "Insumo ID {$insumo->id}: No se pudo obtener el tamaño de la imagen";
                continue;
            }

            // Determine if we need to resize
            $newWidth = $width;
            $newHeight = $height;
            $needsResize = false;

            if ($width > $max || $height > $max) {
                $ratio = $width / $height;
                if ($width > $height) {
                    $newWidth = $max;
                    $newHeight = $max / $ratio;
                } else {
                    $newHeight = $max;
                    $newWidth = $max * $ratio;
                }
                $needsResize = true;
            }

            // We also want to enforce webp. If it's not webp, or needs resize, we process it.
            if ($extension !== 'webp' || $needsResize) {
                try {
                    $src = null;
                    if ($extension == 'jpg' || $extension == 'jpeg') $src = @imagecreatefromjpeg($absolutePath);
                    elseif ($extension == 'png') $src = @imagecreatefrompng($absolutePath);
                    elseif ($extension == 'webp') $src = @imagecreatefromwebp($absolutePath);

                    if ($src) {
                        $dst = imagecreatetruecolor($newWidth, $newHeight);
                        // Transparent background for PNG/WEBP
                        imagealphablending($dst, false);
                        imagesavealpha($dst, true);
                        $transparent = imagecolorallocatealpha($dst, 255, 255, 255, 127);
                        imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);

                        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

                        // Generate new filename
                        $newFilename = 'productos_tasca/' . uniqid() . '.webp';
                        $newAbsolutePath = storage_path('app/public/' . $newFilename);

                        // Ensure directory exists
                        if (!file_exists(dirname($newAbsolutePath))) {
                            mkdir(dirname($newAbsolutePath), 0755, true);
                        }

                        // Save as webp with 80% quality
                        if (imagewebp($dst, $newAbsolutePath, 80)) {
                            // Update DB
                            $insumo->update(['imagen' => $newFilename]);

                            // Delete old image if filename changed
                            if ($currentPath !== $newFilename && Storage::disk('public')->exists($currentPath)) {
                                Storage::disk('public')->delete($currentPath);
                            }

                            $results['optimized']++;
                            $results['details'][] = "Insumo ID {$insumo->id}: Optimizado y convertido a WEBP (" . round(filesize($newAbsolutePath) / 1024, 2) . " KB)";
                        } else {
                            $results['errors']++;
                            $results['details'][] = "Insumo ID {$insumo->id}: Error al guardar el archivo WEBP";
                        }

                        imagedestroy($src);
                        imagedestroy($dst);
                    } else {
                        $results['errors']++;
                        $results['details'][] = "Insumo ID {$insumo->id}: Error al leer la imagen original";
                    }
                } catch (\Exception $e) {
                    $results['errors']++;
                    $results['details'][] = "Insumo ID {$insumo->id}: Exception - " . $e->getMessage();
                }
            } else {
                $results['skipped']++;
                $results['details'][] = "Insumo ID {$insumo->id}: Ya está optimizado (WEBP, tamaño adecuado)";
            }
        }

        return response()->json([
            'message' => 'Proceso de optimización finalizado',
            'results' => $results
        ]);
    }
}
