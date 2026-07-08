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

    protected $appends = ['stock', 'nombre_completo'];

    public function getNombreCompletoAttribute()
    {
        if ($this->id_insumo && $this->insumo) {
            // Si el nombre de la presentación ya contiene el nombre del insumo, no lo duplicamos (ej. "Cacique" en ambos)
            if (stripos($this->nombre, $this->insumo->nombre) !== false) {
                return $this->nombre;
            }
            return $this->insumo->nombre . ' - ' . $this->nombre;
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

    public function getStockAttribute()
    {
        if (!$this->id_insumo) {
            return 0;
        }
        
        $insumo = $this->insumo;
        if (!$insumo) return 0;
        
        $totalMl = $insumo->stock_total;
        $medidaDescuento = $this->medida_descuento > 0 ? $this->medida_descuento : 1;
        
        return floor($totalMl / $medidaDescuento);
    }
}
