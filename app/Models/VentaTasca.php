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
    ];

    protected $appends = ['pendiente'];

    public function getPendienteAttribute()
    {
        $totalPagado = $this->pagos()->sum('pago_venta_tasca.monto_abonado_usd');
        $totalVenta = $this->total - $this->descuento;
        $pendiente = $totalVenta - $totalPagado;
        return max(0, round($pendiente, 2));
    }

    public function clienteForaneo()
    {
        return $this->belongsTo(ClienteTasca::class, 'id_cliente_tasca');
    }

    public function miembro()
    {
        return $this->belongsTo(Miembro::class, 'id_cliente_miembro');
    }

    public function detalles()
    {
        return $this->hasMany(VentaTascaDetalle::class, 'id_venta');
    }

    public function pagos()
    {
        return $this->belongsToMany(PagoTasca::class, 'pago_venta_tasca', 'id_venta', 'id_pago')->withPivot('monto_abonado_usd');
    }
}
