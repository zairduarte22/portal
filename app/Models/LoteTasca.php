<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoteTasca extends Model
{
    use HasFactory;

    protected $table = 'lotes_tasca';

    protected $fillable = [
        'compra_id',
        'id_insumo',
        'codigo_lote',
        'proveedor_id',
        'cantidad_comprada',
        'costo_unitario',
        'stock_actual',
        'fecha_compra',
        'fecha_caducidad',
        'estado'
    ];

    public function insumo()
    {
        return $this->belongsTo(InsumoTasca::class, 'id_insumo');
    }

    public function compra()
    {
        return $this->belongsTo(CompraTasca::class, 'compra_id');
    }

    // public function proveedor()
    // {
    //     return $this->belongsTo(Proveedor::class, 'proveedor_id');
    // }
}
