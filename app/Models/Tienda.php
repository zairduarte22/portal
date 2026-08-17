<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tienda extends Model
{
    public function bancos()
    {
        return $this->belongsToMany(Banco::class, 'banco_tienda', 'tienda_id', 'banco_id');
    }
}
