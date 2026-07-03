<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('entregas', function (Blueprint $table) {
            $table->decimal('monto_pagado_club_bs', 15, 2)->default(0)->after('monto_pagado_ugavi_usd');
            $table->decimal('monto_pagado_club_usd', 15, 2)->default(0)->after('monto_pagado_club_bs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entregas', function (Blueprint $table) {
            $table->dropColumn(['monto_pagado_club_bs', 'monto_pagado_club_usd']);
        });
    }
};
