<?php

namespace App\Traits;

use App\Services\TiendaContext;
use Illuminate\Database\Eloquent\Builder;

trait BelongsToTienda
{
    /**
     * Boot the trait.
     */
    protected static function bootBelongsToTienda()
    {
        // Añadir el Global Scope para filtrar por tienda_id
        static::addGlobalScope('tienda_id', function (Builder $builder) {
            $context = app(TiendaContext::class);
            $tiendaId = $context->getTiendaId();

            if ($tiendaId !== null) {
                $builder->where($builder->getModel()->getTable() . '.tienda_id', $tiendaId);
            }
        });

        // Asignar el tienda_id automáticamente al crear
        static::creating(function ($model) {
            if (!$model->tienda_id) {
                $context = app(TiendaContext::class);
                $tiendaId = $context->getTiendaId();
                if ($tiendaId) {
                    $model->tienda_id = $tiendaId;
                }
            }
        });
    }

    /**
     * Relationship to Tienda
     */
    public function tienda()
    {
        return $this->belongsTo(\App\Models\Tienda::class, 'tienda_id');
    }
}
