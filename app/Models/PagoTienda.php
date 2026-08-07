<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PagoTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    protected $table = 'pagos_tienda';
    protected $guarded = [];

    protected $casts = [
        'monto_usd' => 'decimal:2',
        'tasa' => 'decimal:2',
        'monto_bs' => 'decimal:2',
        'fecha_pago' => 'date',
    ];

    public function ventas()
    {
        return $this->belongsToMany(VentaTienda::class, 'pago_venta_tienda', 'id_pago', 'id_venta')->withPivot('monto_abonado_usd');
    }
}
