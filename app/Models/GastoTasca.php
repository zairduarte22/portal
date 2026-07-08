<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class GastoTasca extends Model
{
    protected $table = 'gastos_tasca';
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
        return $this->belongsTo(ProveedorTasca::class, 'proveedor_id');
    }

    public function compra()
    {
        return $this->belongsTo(CompraTasca::class, 'compra_id');
    }
}
