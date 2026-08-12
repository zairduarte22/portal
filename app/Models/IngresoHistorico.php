<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IngresoHistorico extends Model
{
    use HasFactory;

    protected $table = 'ingresos_historicos';
    protected $fillable = ['fecha', 'monto', 'descripcion'];
}
