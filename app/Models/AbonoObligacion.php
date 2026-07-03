<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AbonoObligacion extends Model
{
    use HasFactory;

    protected $table = 'abonos_obligaciones';

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'obligacion_id',
        'fecha',
        'monto_abonado',
        'monto_banco',
        'moneda_pago',
        'tasa_cambio',
        'banco_id',
        'referencia'
    ];

    public function obligacion()
    {
        return $this->belongsTo(Obligacion::class, 'obligacion_id');
    }

    public function banco()
    {
        return $this->belongsTo(Banco::class, 'banco_id');
    }
}
