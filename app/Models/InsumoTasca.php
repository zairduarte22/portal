<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsumoTasca extends Model
{
    use HasFactory;

    protected $table = 'insumos_tasca';

    protected $fillable = [
        'nombre',
        'categoria'
    ];

    protected $appends = ['stock_total'];

    public function lotes()
    {
        return $this->hasMany(LoteTasca::class, 'id_insumo');
    }

    public function lotesActivos()
    {
        return $this->hasMany(LoteTasca::class, 'id_insumo')
                    ->where('estado', 'Activo')
                    ->where('stock_actual', '>', 0)
                    ->orderBy('fecha_compra', 'asc');
    }

    public function productos()
    {
        return $this->hasMany(ProductoTasca::class, 'id_insumo');
    }

    public function getStockTotalAttribute()
    {
        return $this->lotesActivos()->sum('stock_actual');
    }
}
