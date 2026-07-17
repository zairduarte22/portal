<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VentaTasca extends Model
{
    protected $table = 'ventas_tasca';
    protected $guarded = [];

    protected $casts = [
        'total' => 'decimal:2',
        'descuento' => 'decimal:2',
        'fecha' => 'date',
        'fecha_vencimiento' => 'date',
    ];

    protected $appends = ['pendiente'];

    public function getPendienteAttribute()
    {
        // Verificar si es crédito vencido y tiene descuento
        if ($this->estado === 'Credito' && $this->descuento > 0 && $this->fecha_vencimiento) {
            if (now()->startOfDay()->gt($this->fecha_vencimiento->startOfDay())) {
                // Si está vencida, el descuento se pierde. No guardamos acá para evitar loops, 
                // pero sí lo reflejamos en el pendiente temporalmente. El controlador lo guardará cuando se llame.
            }
        }

        if ($this->relationLoaded('pagos')) {
            $totalPagado = $this->pagos->sum('pivot.monto_abonado_usd');
        } else {
            $totalPagado = $this->pagos()->sum('pago_venta_tasca.monto_abonado_usd');
        }
        
        $descuentoReal = $this->getDescuentoRealAttribute();
        $totalVenta = $this->total - $descuentoReal;
        $pendiente = $totalVenta - $totalPagado;
        return max(0, round($pendiente, 2));
    }

    public function getDescuentoRealAttribute()
    {
        if ($this->estado === 'Credito' && $this->descuento > 0 && $this->fecha_vencimiento) {
            if (now()->startOfDay()->gt($this->fecha_vencimiento->startOfDay())) {
                return 0; // Descuento perdido por vencimiento
            }
        }
        return $this->descuento;
    }

    public function clienteForaneo()
    {
        return $this->belongsTo(ClienteTasca::class, 'id_cliente_tasca');
    }

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_cliente_miembro');
    }

    public function persona()
    {
        return $this->belongsTo(Persona::class, 'id_persona');
    }

    public function detalles()
    {
        return $this->hasMany(VentaTascaDetalle::class, 'id_venta');
    }

    public function pagos()
    {
        return $this->belongsToMany(PagoTasca::class, 'pago_venta_tasca', 'id_venta', 'id_pago')->withPivot('monto_abonado_usd');
    }

    public function autorizador()
    {
        return $this->belongsTo(Persona::class, 'id_autorizador');
    }
}
