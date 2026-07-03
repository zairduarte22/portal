<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use App\Models\Tasa;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FetchTasaCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:fetch-tasa';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch the official USD exchange rate from DolarAPI and save it to the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Fetching official USD exchange rate...');

        try {
            $response = Http::timeout(10)->get('https://ve.dolarapi.com/v1/dolares/oficial');

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['promedio'])) {
                    $monto = $data['promedio'];
                    $fecha = Carbon::now()->toDateString(); // Format: YYYY-MM-DD

                    $tasa = Tasa::updateOrCreate(
                        ['fecha' => $fecha],
                        ['monto' => $monto]
                    );

                    $this->info("Successfully saved exchange rate: {$monto} Bs/$ for {$fecha}");
                    Log::info("Tasa de cambio actualizada: {$monto} Bs/$ para {$fecha}");
                    
                    return Command::SUCCESS;
                } else {
                    $this->error('The API response did not contain the "promedio" key.');
                    Log::error('FetchTasaCommand Error: Missing "promedio" key in response', ['response' => $data]);
                    return Command::FAILURE;
                }
            } else {
                $this->error('Failed to fetch data from API. Status Code: ' . $response->status());
                Log::error('FetchTasaCommand Error: API request failed', [
                    'status' => $response->status(),
                    'body' => $response->body()
                ]);
                return Command::FAILURE;
            }
        } catch (\Exception $e) {
            $this->error('An exception occurred: ' . $e->getMessage());
            Log::error('FetchTasaCommand Exception: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
