<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClienteTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    protected $table = 'clientes_tienda';
    protected $guarded = [];

    public function ventas()
    {
        return $this->hasMany(VentaTienda::class, 'id_cliente_tienda');
    }
}
