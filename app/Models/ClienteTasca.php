<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ClienteTasca extends Model
{
    protected $table = 'clientes_tasca';
    protected $guarded = [];

    public function ventas()
    {
        return $this->hasMany(VentaTasca::class, 'id_cliente_tasca');
    }
}
