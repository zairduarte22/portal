<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoTasca extends Model
{
    protected $table = 'pagos_tasca';
    protected $guarded = [];

    protected $casts = [
        'monto_usd' => 'decimal:2',
        'tasa' => 'decimal:2',
        'monto_bs' => 'decimal:2',
        'fecha_pago' => 'date',
    ];

    public function ventas()
    {
        return $this->belongsToMany(VentaTasca::class, 'pago_venta_tasca', 'id_pago', 'id_venta')->withPivot('monto_abonado_usd');
    }
}
