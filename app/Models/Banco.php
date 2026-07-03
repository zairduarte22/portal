<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Banco extends Model
{
    use HasFactory;

    protected $table = 'bancos';
    
    // Si la tabla no tiene timestamps, deshabilitalos
    public $timestamps = false;

    protected $fillable = [
        'nombre',
        'titular',
        'divisa'
    ];
}
