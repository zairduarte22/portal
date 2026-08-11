<?php

namespace App\Http\Controllers;

use App\Models\InsumoTienda;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class OptimizeImagesController extends Controller
{
    public function optimize(Request $request)
    {
        $limit = 5;
        $offset = (int) $request->get('offset', 0);

        $totalImages = InsumoTienda::whereNotNull('imagen')->count();
        $insumos = InsumoTienda::whereNotNull('imagen')
            ->orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
        
        if ($insumos->isEmpty()) {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'>
                <h1 style='color:green;'>¡Optimización Completada!</h1>
                <p>Se procesaron <b>{$totalImages}</b> imágenes en total.</p>
                <p>Ya puedes cerrar esta ventana.</p>
            </body></html>");
        }

        $max = 800;

        foreach ($insumos as $insumo) {
            $currentPath = $insumo->imagen;
            
            // Check if file exists in public storage
            if (!Storage::disk('public')->exists($currentPath)) {
                continue;
            }

            $absolutePath = storage_path('app/public/' . $currentPath);
            $extension = strtolower(pathinfo($absolutePath, PATHINFO_EXTENSION));

            // Only process jpg, jpeg, png, webp
            if (!in_array($extension, ['jpg', 'jpeg', 'png', 'webp'])) {
                continue;
            }

            list($width, $height) = @getimagesize($absolutePath);
            
            if (!$width || !$height) {
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
                        }

                        imagedestroy($src);
                        imagedestroy($dst);
                    }
                } catch (\Exception $e) {
                    // Log silently
                }
            }
        }

        $nextOffset = $offset + $limit;
        $progress = min($nextOffset, $totalImages);
        $percent = round(($progress / $totalImages) * 100);
        $url = url('/optimizar-imagenes-tasca?offset=' . $nextOffset);

        return response("<html>
        <head>
            <meta http-equiv='refresh' content='1;url={$url}'>
            <style>
                body { font-family:sans-serif; text-align:center; padding:50px; }
                .progress-bar { width: 80%; max-width: 500px; margin: 20px auto; background-color: #f3f3f3; border-radius: 10px; overflow: hidden; }
                .progress { height: 25px; background-color: #4caf50; width: {$percent}%; transition: width 0.5s; }
            </style>
        </head>
        <body>
            <h2>Optimizando Imágenes...</h2>
            <p>Procesando lote: <b>{$progress}</b> de <b>{$totalImages}</b> ({$percent}%)</p>
            <div class='progress-bar'><div class='progress'></div></div>
            <p style='color:#666; font-size:14px;'>Por favor, no cierres esta ventana. Se recargará automáticamente en 1 segundo...</p>
        </body>
        </html>");
    }

    public function fixRotation()
    {
        $insumos = InsumoTienda::whereNotNull('imagen')->get();
        
        $html = "<html><head><meta name='viewport' content='width=device-width, initial-scale=1'></head><body style='font-family:sans-serif; text-align:center; background:#f4f4f4;'>
            <h2 style='padding:20px;'>Reparador de Imágenes</h2>
            <p>Haz clic en 'Rotar' para girar la imagen 90 grados. Si necesitas girarla más, dale varias veces.</p>
            <div style='display:flex; flex-wrap:wrap; justify-content:center; gap:20px; padding:20px;'>";
        
        foreach($insumos as $insumo) {
            $url = asset('storage/' . $insumo->imagen);
            $rotUrl = url("/rotar-imagen/{$insumo->id}");
            
            $html .= "<div style='background:white; border-radius:8px; box-shadow:0 2px 5px rgba(0,0,0,0.1); padding:15px; width:220px;'>
                        <div style='height:200px; display:flex; align-items:center; justify-content:center; margin-bottom:10px;'>
                            <img src='{$url}?v=".time()."' style='max-width:100%; max-height:100%; object-fit:contain;' />
                        </div>
                        <strong style='display:block; margin-bottom:10px; font-size:14px;'>{$insumo->nombre}</strong>
                        <button onclick=\"rotar(this, '{$rotUrl}')\" style='padding:8px 15px; background:#000; color:white; border:none; border-radius:5px; cursor:pointer; width:100%;'>↻ Rotar 90°</button>
                      </div>";
        }
        
        $html .= "</div>
        <script>
            function rotar(btn, url) {
                btn.innerHTML = 'Rotando...';
                btn.disabled = true;
                fetch(url).then(res => location.reload());
            }
        </script>
        </body></html>";
        return response($html);
    }

    public function rotateImage($id)
    {
        $insumo = InsumoTienda::findOrFail($id);
        if (!$insumo->imagen) return response()->json(['error' => 'No image'], 404);
        
        $path = storage_path('app/public/' . $insumo->imagen);
        if (!file_exists($path)) return response()->json(['error' => 'No file'], 404);
        
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        $src = null;
        if ($ext == 'webp') $src = @imagecreatefromwebp($path);
        elseif ($ext == 'jpg' || $ext == 'jpeg') $src = @imagecreatefromjpeg($path);
        elseif ($ext == 'png') $src = @imagecreatefrompng($path);
        
        if ($src) {
            // Rotar 270 grados (counter-clockwise) equivale a 90 grados a la derecha
            $dst = imagerotate($src, 270, 0); 
            
            // Si tiene transparencia
            imagealphablending($dst, false);
            imagesavealpha($dst, true);
            
            if ($ext == 'webp') imagewebp($dst, $path, 80);
            elseif ($ext == 'jpg' || $ext == 'jpeg') imagejpeg($dst, $path, 80);
            elseif ($ext == 'png') imagepng($dst, $path, 8);
            
            imagedestroy($src);
            imagedestroy($dst);
            return response()->json(['success' => true]);
        }
        return response()->json(['error' => 'Could not read image'], 500);
    }

    public function rotateAll(Request $request)
    {
        $limit = 10;
        $offset = (int) $request->get('offset', 0);

        $totalImages = InsumoTienda::whereNotNull('imagen')->count();
        $insumos = InsumoTienda::whereNotNull('imagen')
            ->orderBy('id')
            ->offset($offset)
            ->limit($limit)
            ->get();
        
        if ($insumos->isEmpty()) {
            return response("<html><body style='font-family:sans-serif; text-align:center; padding:50px;'>
                <h1 style='color:green;'>¡Rotación Completada!</h1>
                <p>Se rotaron <b>{$totalImages}</b> imágenes exitosamente a la derecha.</p>
            </body></html>");
        }

        foreach ($insumos as $insumo) {
            $path = storage_path('app/public/' . $insumo->imagen);
            if (!file_exists($path)) continue;
            
            $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
            $src = null;
            if ($ext == 'webp') $src = @imagecreatefromwebp($path);
            elseif ($ext == 'jpg' || $ext == 'jpeg') $src = @imagecreatefromjpeg($path);
            elseif ($ext == 'png') $src = @imagecreatefrompng($path);
            
            if ($src) {
                // Rotar 270 grados (counter-clockwise) equivale a 90 grados a la derecha
                $dst = imagerotate($src, 270, 0); 
                
                // Si tiene transparencia
                imagealphablending($dst, false);
                imagesavealpha($dst, true);
                
                if ($ext == 'webp') imagewebp($dst, $path, 80);
                elseif ($ext == 'jpg' || $ext == 'jpeg') imagejpeg($dst, $path, 80);
                elseif ($ext == 'png') imagepng($dst, $path, 8);
                
                imagedestroy($src);
                imagedestroy($dst);
            }
        }

        $nextOffset = $offset + $limit;
        $progress = min($nextOffset, $totalImages);
        $percent = round(($progress / $totalImages) * 100);
        $url = url('/rotar-todas-imagenes-tasca?offset=' . $nextOffset);

        return response("<html>
        <head>
            <meta http-equiv='refresh' content='1;url={$url}'>
            <style>
                body { font-family:sans-serif; text-align:center; padding:50px; }
                .progress-bar { width: 80%; max-width: 500px; margin: 20px auto; background-color: #f3f3f3; border-radius: 10px; overflow: hidden; }
                .progress { height: 25px; background-color: #4caf50; width: {$percent}%; transition: width 0.5s; }
            </style>
        </head>
        <body>
            <h2>Rotando Imágenes 90° a la derecha...</h2>
            <p>Procesando lote: <b>{$progress}</b> de <b>{$totalImages}</b> ({$percent}%)</p>
            <div class='progress-bar'><div class='progress'></div></div>
            <p style='color:#666; font-size:14px;'>Por favor, no cierres esta ventana. Se recargará automáticamente en 1 segundo...</p>
        </body>
        </html>");
    }
}
