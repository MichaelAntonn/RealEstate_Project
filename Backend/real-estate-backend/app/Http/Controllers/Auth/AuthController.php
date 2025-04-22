<?php

namespace App\Http\Controllers\Auth;

use App\Constants\UserType;
use App\Http\Controllers\Controller;
use App\Http\Requests\RegisterFormRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterFormRequest $request)
    {
        // Validate the form data

        $user = User::create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'country' => $request->country,
            'city' => $request->city,
            'address' => $request->address,
            'terms_and_conditions' => $request->terms_and_conditions,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'user' => $user,
        ]);
    }

    // Login an existing user
    public function login(Request $request)
    {
         // Validate the request
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    // Find the user by email
    $user = User::where('email', $request->email)->first();

    // Check if the user exists and the password is correct
    if (!$user || !Hash::check($request->password, $user->password)) {
        return response()->json([
            'error' => 'Invalid email or password',
        ], 401);
    }
    if ($user->user_type !== UserType::USER) {
        return response()->json([
            'error' => 'You are not authorized to login from this portal.',
        ], 403);
    }
    // Create a token for the user
    $token = $user->createToken('auth_token')->plainTextToken;

    // Return the token and user details
    return response()->json([
        'success' => ' logged in successfully',
        'access_token' => $token,
        'user' => $user,
    ]);
    }


    // Logout the user
    public function logout(Request $request)
    {
        // Revoke the current user's token
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully'], 200);
    }

}
