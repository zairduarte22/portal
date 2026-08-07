<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\BeneficiarioFondo;

class BeneficiariosFondoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $bancos = DB::table('cuenta_banco')->select('beneficiario')->distinct()->get();
        $bancosUsd = DB::table('cuenta_moneda_extranjera')->select('beneficiario')->distinct()->get();

        $nombres = collect($bancos)->concat($bancosUsd)->pluck('beneficiario')->unique()->filter()->values();

        foreach ($nombres as $nombre) {
            $beneficiario = BeneficiarioFondo::firstOrCreate(['nombre' => $nombre]);

            DB::table('cuenta_banco')
                ->where('beneficiario', $nombre)
                ->update(['beneficiario_id' => $beneficiario->id]);

            DB::table('cuenta_moneda_extranjera')
                ->where('beneficiario', $nombre)
                ->update(['beneficiario_id' => $beneficiario->id]);
        }
    }
}
