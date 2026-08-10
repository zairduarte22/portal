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
        'divisa',
        'propietario',
        'para_membresias'
    ];

    public function tiendas()
    {
        return $this->belongsToMany(Tienda::class, 'banco_tienda', 'banco_id', 'tienda_id');
    }
}
