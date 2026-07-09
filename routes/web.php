<?php

use Illuminate\Support\Facades\Route;

// Ruta 'login' nombrada para manejar casos donde el frontend no envíe Accept: application/json
// Laravel redirige aquí por defecto en middlewares de autenticación cuando falla.
Route::get('/personal/login', function () {
    return response()->json(['message' => 'Unauthenticated.'], 401);
})->name('login');

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');

