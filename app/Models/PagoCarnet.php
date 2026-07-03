<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PagoCarnet extends Model
{
    use HasFactory;

    protected $table = 'pagos_carnets';

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'id_miembro',
        'fecha',
        'monto',
        'monto_bs',
        'tasa_cambio',
        'precio_unitario',
        'metodo_pago',
        'referencia',
        'cantidad_carnets',
        'estado'
    ];

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_miembro');
    }
}
