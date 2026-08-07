<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GastoTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    protected $table = 'gastos_tienda';
    protected $fillable = [
        'categoria',
        'descripcion',
        'monto_usd',
        'monto_bs',
        'metodo_pago',
        'referencia_pago',
        'fecha',
        'referencia_factura',
        'proveedor_id'
    ];

    public function proveedor()
    {
        return $this->belongsTo(ProveedorTienda::class, 'proveedor_id');
    }

    public function compra()
    {
        return $this->belongsTo(CompraTienda::class, 'compra_id');
    }
}
