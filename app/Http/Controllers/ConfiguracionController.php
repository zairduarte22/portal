<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class ConfiguracionController extends Controller
{
    public function getUsuarios(Request $request)
    {
        return response()->json(User::all());
    }

    public function storeUsuario(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users',
            'password' => 'required|string|min:4',
            'modules' => 'nullable|array'
        ]);

        $user = User::create([
            'name' => $request->name,
            'username' => $request->username,
            'email' => $request->username . '@admin.com',
            'password' => Hash::make($request->password),
            'is_master' => false,
            'modules' => $request->modules ? json_encode($request->modules) : null
        ]);

        return response()->json($user, 201);
    }

    public function updateUsuario(Request $request, $id)
    {
        $user = User::findOrFail($id);

        if ($user->is_master && !$request->user()->is_master) {
            return response()->json(['error' => 'No autorizado para editar al master'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'username' => 'required|string|max:255|unique:users,username,' . $id,
            'password' => 'nullable|string|min:4',
            'modules' => 'nullable|array'
        ]);

        $user->name = $request->name;
        $user->username = $request->username;
        
        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }
        
        $user->modules = $request->modules ? json_encode($request->modules) : null;
        $user->save();

        return response()->json($user);
    }

    public function destroyUsuario(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        if ($user->is_master) {
            return response()->json(['error' => 'No se puede eliminar al master'], 403);
        }

        $user->delete();
        return response()->json(['message' => 'Eliminado']);
    }
}
