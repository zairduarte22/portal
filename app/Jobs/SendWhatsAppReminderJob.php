<?php

namespace App\Jobs;

use App\Models\Miembro;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SendWhatsAppReminderJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $miembro;

    public function __construct(Miembro $miembro)
    {
        $this->miembro = $miembro;
    }

    public function handle(): void
    {
        $telefono = $this->miembro->telefono;
        if (!$telefono) return;
        
        $telefono_limpio = preg_replace('/\D/', '', $telefono);
        if (empty($telefono_limpio)) return;

        $meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        $mes_actual = $meses[now()->month - 1];

        // saldo_pendiente es positivo cuando deben dinero.
        // Lo recargamos para tener el saldo fresco en el momento en que se procese el job
        $this->miembro->actualizarSaldoPendiente();
        $saldo_actual = $this->miembro->saldo_pendiente;
        
        if ($saldo_actual <= 0) return; // No debe nada

        $saldo_positivo = $saldo_actual;
        $mensaje = "";
        $dia = now()->day;

        // Python logic adaptation
        if ($saldo_actual > 0 && $saldo_actual <= 25) {
            if ($dia <= 10 && $saldo_positivo == 25) {
                $saldo_positivo -= 5;
                $mensaje = "Estimado afiliado *{$this->miembro->razon_social}*,\n\n"
                         . "Le saludamos cordialmente desde la administración de *UGAVI*.\n"
                         . "Le informamos que ya se encuentra disponible el proceso de recepción de aportes mensuales.\n "
                         . "*Aproveche el incentivo por pronto pago antes del día 10 de este mes:*\n\n"
                         . "> *CONCEPTO*:     Aporte Mensual\n"
                         . "> *PERÍODO*:      {$mes_actual}\n"
                         . "> *MONTO NORMAL*:  " . ($saldo_positivo + 5) . "$\n"
                         . "> *CON DESCUENTO*: {$saldo_positivo}$ (Hasta el 10)\n\n"
                         . "`Agradecemos su constante compromiso con nuestra institución. Puede reportar su pago respondiendo directamente a este mensaje.`";
            } elseif ($dia >= 11 && $dia <= 15) {
                $mensaje = "Estimado afiliado *{$this->miembro->razon_social}*,\n\n"
                         . "Reciba un cordial saludo de parte de la administración de *UGAVI*.\n"
                         . "*Nos comunicamos de manera preventiva para hacer de su conocimiento el estado actual de su cuenta para el mes en curso:*\n\n"
                         . "> *Miembro:* {$this->miembro->razon_social}\n"
                         . "> *Mes:* {$mes_actual}\n"
                         . "> *Monto a registrar:* {$saldo_positivo}$\n\n"
                         . "`Le extendemos una cordial invitación a gestionar su aporte con antelación para mantener la fluidez de nuestras operaciones gremiales. Quedamos a su entera orden.`";
            } else {
                $mensaje = "Estimado afiliado *{$this->miembro->razon_social}*,\n\n"
                         . "Le saludamos cordialmente desde la administración de *UGAVI*.\n"
                         . "*Ante la proximidad del cierre administrativo correspondiente al mes de *{$mes_actual}*, le hacemos llegar un atento recordatorio para invitarle a procesar su aporte mensual:*\n\n"
                         . "> *⚠️ FECHA LÍMITE: Cierre de mes*\n"
                         . "> *⚠️ SALDO ACTUAL:  {$saldo_positivo}$*\n\n"
                         . "`Anticipar este trámite le garantiza mantener su cuenta al día y libre de acumulaciones para el próximo período. ¡Gracias por su valioso y oportuno apoyo de siempre!`";
            }
        } elseif ($saldo_actual > 25 && $saldo_actual <= 100) {
            if ($dia <= 10) {
                $saldo_positivo -= 5;
            }
            $mensaje = "Estimado afiliado *{$this->miembro->razon_social}*,\n\n"
                     . "Le saludamos cordialmente de parte del equipo administrativo de *UGAVI*.\n"
                     . "*Por medio de la presente, le notificamos que su cuenta registra un saldo acumulado pendiente por concepto de cuotas de membresía:*\n\n"
                     . "🔹 *Detalle de cuenta:* 🔹\n"
                     . "> Razón Social: {$this->miembro->razon_social}\n"
                     . "> Estado actual: *Compromiso Pendiente*\n"
                     . "> Monto acumulado: $ {$saldo_positivo}\n\n"
                     . "`Le solicitamos de la manera más atenta regularizar estos aportes a la brevedad posible para evitar el acumulado de saldos de cara a la próxima facturación. Puede reportar su transferencia por esta vía.`";
        } else { // owes > 100
            if ($dia <= 10) {
                $saldo_positivo -= 5;
            }
            $mensaje = "⚠️ *NOTIFICACIÓN DE COMPROMISO ADMINISTRATIVO VENCIDO*\n"
                     . " *UNIÓN DE GANADEROS DEL MUNICIPIO ROSARIO DE PERIJÁ (UGAVI)*\n\n"
                     . "Estimado productor *{$this->miembro->razon_social}*,\n\n"
                     . "Por instrucciones de la dirección de administración, nos dirigimos a usted para presentarle formalmente el requerimiento de pago sobre su código de miembro:\n\n"
                     . "*REPORTE DE SALDO DEUDOR*\n"
                     . "> AFILIADO: {$this->miembro->razon_social}\n"
                     . "> ESTADO:   VENCIDO / REZAGADO\n"
                     . "> MONTO:    $ {$saldo_positivo}\n\n"
                     . "Le recordamos respetuosamente que el cumplimiento de los aportes es indispensable para la emisión de solvencias, acceso a servicios y beneficios gremiales.\n\n"
                     . "`Le solicitamos comunicarse con las oficinas administrativas a la brevedad para conciliar su situación. Agradecemos su inmediata atención.`";
        }

        $url = env('NODE_WA_API_URL', 'http://localhost:3000/wa-api/enviar-recordatorio');
        
        try {
            $response = Http::timeout(10)->post($url, [
                'telefono' => $telefono_limpio,
                'mensaje' => $mensaje
            ]);
            
            if ($response->successful()) {
                Log::info("WhatsApp enviado con éxito al ID {$this->miembro->id}");
                \App\Models\WhatsappLog::create([
                    'miembro_id' => $this->miembro->id,
                    'telefono' => $telefono_limpio,
                    'estado' => 'Enviado',
                    'detalles' => 'Mensaje procesado correctamente'
                ]);
            } else {
                Log::warning("Fallo al enviar WhatsApp al ID {$this->miembro->id} - Status: " . $response->status());
                \App\Models\WhatsappLog::create([
                    'miembro_id' => $this->miembro->id,
                    'telefono' => $telefono_limpio,
                    'estado' => 'Error',
                    'detalles' => 'Status: ' . $response->status() . ' - Body: ' . $response->body()
                ]);
            }
        } catch (\Exception $e) {
            Log::error("Error enviando WhatsApp (Cobranza) al ID {$this->miembro->id}: " . $e->getMessage());
            \App\Models\WhatsappLog::create([
                'miembro_id' => $this->miembro->id,
                'telefono' => $telefono_limpio,
                'estado' => 'Error',
                'detalles' => 'Excepción: ' . $e->getMessage()
            ]);
        }
    }
}
