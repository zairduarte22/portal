<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DocumentoMiembro extends Model
{
    use HasFactory;

    protected $fillable = [
        'id_miembro',
        'tipo',
        'ruta_archivo',
    ];

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_miembro');
    }
}
