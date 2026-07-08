<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class MasterUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::create([
            'name' => 'Zair (Master)',
            'email' => 'zair@admin.com',
            'username' => 'zair',
            'password' => \Illuminate\Support\Facades\Hash::make('Luis*2108'),
            'is_master' => true,
            'modules' => json_encode(['Dashboard', 'MembersList', 'PersonasList', 'Reports', 'PagosPanel', 'CarnetsPanel', 'LibrosPanel', 'ConciliacionPanel', 'ObligacionesPanel', 'VentasTascaPanel', 'GestionTascaPanel', 'ConfiguracionesPanel'])
        ]);
    }
}
