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
            $table->decimal('total_bs', 15, 2)->default(0)->after('rango_hasta');
            $table->decimal('total_usd', 15, 2)->default(0)->after('total_bs');
            $table->decimal('ugavi_base_bs', 15, 2)->default(0)->after('total_usd');
            $table->decimal('ugavi_base_usd', 15, 2)->default(0)->after('ugavi_base_bs');
            $table->decimal('club_base_bs', 15, 2)->default(0)->after('ugavi_base_usd');
            $table->decimal('club_base_usd', 15, 2)->default(0)->after('club_base_bs');
            $table->decimal('descuento_cruces_bs', 15, 2)->default(0)->after('club_base_usd');
            $table->decimal('descuento_cruces_usd', 15, 2)->default(0)->after('descuento_cruces_bs');
            $table->decimal('monto_pagado_ugavi_bs', 15, 2)->default(0)->after('descuento_cruces_usd');
            $table->decimal('monto_pagado_ugavi_usd', 15, 2)->default(0)->after('monto_pagado_ugavi_bs');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entregas', function (Blueprint $table) {
            $table->dropColumn([
                'total_bs',
                'total_usd',
                'ugavi_base_bs',
                'ugavi_base_usd',
                'club_base_bs',
                'club_base_usd',
                'descuento_cruces_bs',
                'descuento_cruces_usd',
                'monto_pagado_ugavi_bs',
                'monto_pagado_ugavi_usd'
            ]);
        });
    }
};
