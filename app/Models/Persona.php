<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Persona extends Model
{
    public $timestamps = false;
    protected $guarded = [];

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_miembro');
    }
}
