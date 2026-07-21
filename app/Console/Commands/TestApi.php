<?php
namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Http\Request;

class TestApi extends Command
{
    protected $signature = 'test:api';
    protected $description = 'Test API direct output';

    public function handle()
    {
        $request = Request::create('/api/tasca/insumos', 'GET');
        $response = app()->handle($request);
        file_put_contents('api_response_raw.txt', $response->getContent());
        $this->info("Written to api_response_raw.txt");
    }
}
