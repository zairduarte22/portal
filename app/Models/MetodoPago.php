<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MetodoPago extends Model
{
    use HasFactory;

    protected $table = 'metodos_pago';

    protected $fillable = [
        'nombre',
        'id_banco',
        'propietario'
    ];

    public function banco()
    {
        return $this->belongsTo(Banco::class, 'id_banco');
    }
}
