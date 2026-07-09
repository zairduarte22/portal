<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CarnetEmitido extends Model
{
    use HasFactory;

    protected $table = 'carnets_emitidos';

    protected $casts = [
        'fecha_emision' => 'date:Y-m-d',
        'fecha_vencimiento' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'id',
        'id_persona',
        'id_miembro',
        'fecha_emision',
        'fecha_vencimiento',
        'estado'
    ];

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_persona');
    }

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_miembro');
    }
}
