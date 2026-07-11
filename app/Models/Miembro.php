<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Miembro extends Authenticatable
{
    use Notifiable;

    public $timestamps = false;
    protected $guarded = [];
    protected $hidden = ['password', 'token_acceso'];

    protected $casts = [
        'congelado' => 'boolean',
        'congelado_hasta' => 'date:Y-m-d',
    ];

    public function facturas()
    {
        return $this->hasMany(Factura::class, 'id_miembro');
    }

    public function actualizarSaldoPendiente()
    {
        $this->saldo_pendiente = $this->facturas()->sum('pendiente');
        
        if ($this->saldo_pendiente >= 100) {
            $this->solvencia = 'Insolvente';
        } else {
            $this->solvencia = 'Solvente';
        }
        
        $this->save();
    }
}
