<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // Register new user (role = user)
    public function register(Request $request)
    {
        $fields = $request->validate([
            'name' => 'required|string|max:100',
            'telephone' => 'string|max:20',
            'email' => 'required|string|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $fields['name'],
            'email' => $fields['email'],
            'telephone' => $fields['telephone'],
            'password' => bcrypt($fields['password']),
            'role' => 'user', // تلقائي
        ]);

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token
        ], 201);
    }

    // Login user
    public function login(Request $request)
    {
        $fields = $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $fields['email'])->first();

        if (!$user || !Hash::check($fields['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        $token = $user->createToken('api_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'role' => $user->role, // 👈 نزيد هذي
            'token' => $token
        ]);
    }

    // Logout
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully'
        ]);
    }

    // Get profile
    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    // Admin assigns role
    public function assignRole(Request $request, User $user)
    {
        $request->validate([
            'role' => 'required|in:user,hotel,admin',
        ]);

        $user->role = $request->role;
        $user->save();

        return response()->json([
            'message' => 'Role updated successfully',
            'user' => $user
        ]);
    }
}

