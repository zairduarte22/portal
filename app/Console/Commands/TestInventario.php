<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Http\Controllers\InventarioTascaController;

class TestInventario extends Command
{
    protected $signature = 'test:inventario';
    protected $description = 'Test InventarioTascaController getInsumos';

    public function handle()
    {
        try {
            $controller = app()->make(InventarioTascaController::class);
            $response = $controller->getInsumos();
            $data = $response->getData();
            file_put_contents('insumos_response.json', json_encode($data, JSON_PRETTY_PRINT));
            $this->info("SUCCESS. File written to insumos_response.json");
        } catch (\Throwable $e) {
            $this->error("ERROR: " . $e->getMessage());
            $this->error($e->getTraceAsString());
        }
    }
}
