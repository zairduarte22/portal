<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Entrega extends Model
{
    protected $guarded = [];

    public function pagos()
    {
        return $this->hasMany(Pago::class);
    }
}
