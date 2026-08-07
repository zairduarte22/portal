<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VentaTiendaDetalle extends Model
{
    protected $table = 'ventas_tienda_detalles';
    protected $guarded = [];

    protected $casts = [
        'precio_unitario' => 'decimal:2',
        'subtotal' => 'decimal:2',
    ];

    public function venta()
    {
        return $this->belongsTo(VentaTienda::class, 'id_venta');
    }

    public function producto()
    {
        return $this->belongsTo(ProductoTienda::class, 'id_producto');
    }
}
