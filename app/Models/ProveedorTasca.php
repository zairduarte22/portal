<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProveedorTasca extends Model
{
    protected $table = 'proveedores_tasca';
    protected $guarded = [];

    public function compras()
    {
        return $this->hasMany(CompraTasca::class, 'proveedor_id');
    }

    public function gastos()
    {
        return $this->hasMany(GastoTasca::class, 'proveedor_id');
    }
}
