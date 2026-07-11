<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Factura extends Model
{
    public $timestamps = false;
    protected $guarded = [];
    protected $appends = ['nro_control'];

    protected $casts = [
        'fecha' => 'date:Y-m-d',
        'fecha_vencimiento' => 'date:Y-m-d',
        'mes_cuota' => 'date:Y-m-d',
    ];

    public function getNroControlAttribute()
    {
        return $this->id ? '00-' . $this->id : null;
    }

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_miembro');
    }

    protected static function booted()
    {
        static::saved(function ($factura) {
            if ($factura->miembro) {
                $factura->miembro->actualizarSaldoPendiente();
            }
        });

        static::deleted(function ($factura) {
            if ($factura->miembro) {
                $factura->miembro->actualizarSaldoPendiente();
            }
        });
    }
}
