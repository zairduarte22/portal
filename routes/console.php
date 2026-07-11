<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Programar la actualización de la tasa de cambio del dólar (DolarAPI)
Schedule::call(function () {
    Artisan::call('app:fetch-tasa');
})->dailyAt('00:00');

// Programar la generacion masiva de facturas mensuales (el dia 1 de cada mes a la 1:00 AM)
Schedule::call(function () {
    Artisan::call('invoices:generate-monthly');
})->monthlyOn(1, '01:00');
