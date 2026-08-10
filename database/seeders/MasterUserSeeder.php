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
            'name' => 'Administrador',
            'email' => 'admin@admin.com',
            'username' => 'admin',
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'is_master' => true,
            'modules' => json_encode(['Dashboard', 'MembersList', 'PersonasList', 'Reports', 'PagosPanel', 'CarnetsPanel', 'LibrosPanel', 'ConciliacionPanel', 'ObligacionesPanel', 'VentasTascaPanel', 'GestionTascaPanel', 'ConfiguracionesPanel'])
        ]);
    }
}
