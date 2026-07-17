<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductoTasca extends Model
{
    protected $table = 'productos_tasca';
    protected $guarded = [];

    protected $casts = [
        'precio' => 'decimal:2',
        'medida_descuento' => 'decimal:2',
    ];

    protected $appends = ['stock', 'nombre_completo', 'costo_calculado'];

    public function getCostoCalculadoAttribute()
    {
        if ($this->tipo === 'servicio') {
            return 0; // Services do not have an inventory cost
        }

        if ($this->tipo === 'compuesto') {
            $costoTotal = 0;
            if ($this->relationLoaded('componentes')) {
                foreach ($this->componentes as $comp) {
                    $costoTotal += $comp->costo_calculado * $comp->pivot->cantidad;
                }
            } else {
                foreach ($this->componentes()->get() as $comp) {
                    $costoTotal += $comp->costo_calculado * $comp->pivot->cantidad;
                }
            }
            return $costoTotal;
        }

        if ($this->id_insumo) {
            $insumo = $this->relationLoaded('insumo') ? $this->insumo : null;
            if ($insumo) {
                $lote = null;
                if ($insumo->relationLoaded('lotesActivos')) {
                    $lote = $insumo->lotesActivos->first();
                } elseif ($insumo->relationLoaded('lotes')) {
                    $lote = $insumo->lotes->where('estado', 'Activo')->where('stock_actual', '>', 0)->sortBy('fecha_compra')->first();
                } else {
                    $lote = $insumo->lotesActivos()->first();
                }
                
                if ($lote) {
                    $medida = $this->medida_descuento > 0 ? $this->medida_descuento : 1;
                    return round($lote->costo_unitario * $medida, 2);
                }
            } else if (!$this->relationLoaded('insumo')) {
                // Si la relación no está cargada, fall back al DB (esto ocurre si es un solo producto)
                if ($this->insumo && $this->insumo->lotesActivos) {
                    $lote = $this->insumo->lotesActivos->first();
                    if ($lote) {
                        $medida = $this->medida_descuento > 0 ? $this->medida_descuento : 1;
                        return round($lote->costo_unitario * $medida, 2);
                    }
                }
            }
        }
        return $this->precio; // Fallback to normal price if no cost found
    }

    public function getNombreCompletoAttribute()
    {
        if ($this->id_insumo) {
            $insumo = $this->relationLoaded('insumo') ? $this->insumo : InsumoTasca::find($this->id_insumo);
            if ($insumo) {
                if (stripos($this->nombre, $insumo->nombre) !== false) {
                    return $this->nombre;
                }
                return $insumo->nombre . ' - ' . $this->nombre;
            }
        }
        return $this->nombre;
    }

    public function detalles()
    {
        return $this->hasMany(VentaTascaDetalle::class, 'id_producto');
    }

    public function insumo()
    {
        return $this->belongsTo(InsumoTasca::class, 'id_insumo');
    }

    public function componentes()
    {
        return $this->belongsToMany(ProductoTasca::class, 'productos_compuestos_detalles', 'id_padre', 'id_hijo')
                    ->withPivot('cantidad');
    }

    public function getStockAttribute()
    {
        if ($this->tipo === 'servicio') {
            return 999999; // Unlimited stock for services
        }

        if ($this->tipo === 'compuesto') {
            $maxCombos = 999999;
            $comps = $this->relationLoaded('componentes') ? $this->componentes : $this->componentes()->get();
            if ($comps->isEmpty()) return 0;
            
            foreach ($comps as $comp) {
                if ($comp->pivot->cantidad > 0) {
                    $possible = floor($comp->stock / $comp->pivot->cantidad);
                    if ($possible < $maxCombos) {
                        $maxCombos = $possible;
                    }
                }
            }
            return $maxCombos;
        }

        if (!$this->id_insumo) {
            return 0;
        }
        
        $insumo = $this->relationLoaded('insumo') ? $this->insumo : InsumoTasca::find($this->id_insumo);
        if (!$insumo) return 0;
        
        $totalMl = $insumo->stock_total;
        $medidaDescuento = $this->medida_descuento > 0 ? $this->medida_descuento : 1;
        
        return floor($totalMl / $medidaDescuento);
    }
}
