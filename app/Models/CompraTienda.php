<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompraTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    use HasFactory;

    protected $table = 'compras_tienda';

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
        return $this->hasMany(LoteTienda::class, 'compra_id');
    }

    public function proveedor()
    {
        return $this->belongsTo(ProveedorTienda::class, 'proveedor_id');
    }

    public function gastos()
    {
        return $this->hasMany(GastoTienda::class, 'compra_id');
    }
}
