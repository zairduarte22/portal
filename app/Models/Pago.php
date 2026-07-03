<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Pago extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $casts = [
        'fecha' => 'date:Y-m-d',
    ];

    protected $fillable = [
        'fecha',
        'monto',
        'monto_bs',
        'tasa_cambio',
        'metodo_pago',
        'factura_ugavi',
        'factura_fondo',
        'referencia',
        'estado',
        'entrega_id'
    ];
    
    public function entrega()
    {
        return $this->belongsTo(Entrega::class);
    }
    
    // Un pago puede estar vinculado a varias facturas
    public function facturas()
    {
        return $this->belongsToMany(Factura::class, 'vinculacion_pagos', 'id_pago', 'id_factura')
                    ->withPivot('monto_aplicado', 'descuento');
    }
}
