<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BeneficiarioFondo extends Model
{
    use HasFactory;

    protected $table = 'beneficiarios_fondo';

    protected $fillable = [
        'nombre',
    ];
}
