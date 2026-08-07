<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategoriasFondoSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $id = \Illuminate\Support\Facades\DB::table('categoria_fondos')->insertGetId([
            'categoria' => 'Cuotas de Miembro',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        \Illuminate\Support\Facades\DB::table('cuenta_banco')->update(['categoria_id' => $id]);
        \Illuminate\Support\Facades\DB::table('cuenta_moneda_extranjera')->update(['categoria_id' => $id]);
    }
}
