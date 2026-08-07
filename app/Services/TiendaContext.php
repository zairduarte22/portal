<?php

namespace App\Services;

class TiendaContext
{
    protected ?int $tiendaId = null;

    public function setTiendaId(?int $id)
    {
        $this->tiendaId = $id;
    }

    public function getTiendaId(): ?int
    {
        return $this->tiendaId;
    }
}
