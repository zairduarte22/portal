<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VentaTascaDetalle extends Model
{
    protected $table = 'ventas_tasca_detalles';
    protected $guarded = [];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function venta()
    {
        return $this->belongsTo(VentaTasca::class, 'id_venta');
    }

    public function producto()
    {
        return $this->belongsTo(ProductoTasca::class, 'id_producto');
    }
}
