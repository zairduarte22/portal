<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompraTasca extends Model
{
    use HasFactory;

    protected $table = 'compras_tasca';

    protected $fillable = [
        'fecha_compra',
        'referencia_factura',
        'proveedor_id',
        'total_usd',
        'abono_usd',
        'estado',
    ];

    public function lotes()
    {
        return $this->hasMany(LoteTasca::class, 'compra_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(ProveedorTasca::class, 'proveedor_id');
    }

    public function gastos()
    {
        return $this->hasMany(GastoTasca::class, 'compra_id');
    }
}
