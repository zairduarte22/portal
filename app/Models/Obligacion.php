<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Obligacion extends Model
{
    use HasFactory;

    protected $table = 'obligaciones';

    protected $casts = [
        'fecha_emision' => 'date:Y-m-d',
        'fecha_limite' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'tipo_obligacion',
        'categoria',
        'tercero',
        'descripcion',
        'monto_original',
        'monto_abonado',
        'moneda',
        'fecha_emision',
        'fecha_limite',
        'banco_origen_id',
        'estado'
    ];

    public function abonos()
    {
        return $this->hasMany(AbonoObligacion::class, 'obligacion_id');
    }

    public function bancoOrigen()
    {
        return $this->belongsTo(Banco::class, 'banco_origen_id');
    }
}
