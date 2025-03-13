<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminAuthController extends Controller
{
    public function login(Request $request)
    {
        // Validate the request
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Find the admin user by email
        $admin = Admin::where('email', $credentials['email'])->first();

        // Check if the admin exists and the password is correct
        if ($admin && Hash::check($credentials['password'], $admin->password)) {
            // Check if the user is an admin
            if ($admin->user_type === 'admin') {
                // Create a token for the admin
                $token = $admin->createToken('admin-token')->plainTextToken;

                return response()->json([
                    'success' => 'Admin logged in successfully',
                    'token' => $token,
                ], 200);
            } else {
                return response()->json(['error' => 'Unauthorized. Admin access only.'], 403);
            }
        }

        // If credentials are invalid
        return response()->json(['error' => 'Invalid credentials'], 401);
    }

    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->tokens()->delete();

        return response()->json(['success' => 'Admin logged out successfully'], 200);
    }
}
