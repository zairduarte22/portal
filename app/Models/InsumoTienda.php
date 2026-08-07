<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InsumoTienda extends Model
{
    use \App\Traits\BelongsToTienda;

    use HasFactory;

    protected $table = 'insumos_tienda';

    protected $fillable = [
        'nombre',
        'categoria',
        'imagen'
    ];

    protected $appends = ['stock_total', 'imagen_url'];

    public function getImagenUrlAttribute()
    {
        if ($this->imagen) {
            return asset('storage/' . $this->imagen);
        }
        return null;
    }

    public function lotes()
    {
        return $this->hasMany(LoteTienda::class, 'id_insumo');
    }

    public function lotesActivos()
    {
        return $this->hasMany(LoteTienda::class, 'id_insumo')
                    ->where('estado', 'Activo')
                    ->where('stock_actual', '>', 0)
                    ->orderBy('fecha_compra', 'asc');
    }

    public function productos()
    {
        return $this->hasMany(ProductoTienda::class, 'id_insumo');
    }

    public function getStockTotalAttribute()
    {
        if ($this->relationLoaded('lotesActivos')) {
            return $this->lotesActivos->sum('stock_actual');
        }
        if ($this->relationLoaded('lotes')) {
            return $this->lotes->where('estado', 'Activo')->sum('stock_actual');
        }
        return $this->lotesActivos()->sum('stock_actual');
    }
}
