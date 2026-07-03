<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RelacionesFamiliaresController extends Controller
{
    public function index()
    {
        $relaciones = DB::table('relaciones_familiares')->get();
        return response()->json($relaciones);
    }
}
