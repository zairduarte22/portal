<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProveedorTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    protected $table = 'proveedores_tienda';
    protected $guarded = [];

    public function compras()
    {
        return $this->hasMany(CompraTienda::class, 'proveedor_id');
    }

    public function gastos()
    {
        return $this->hasMany(GastoTienda::class, 'proveedor_id');
    }
}
