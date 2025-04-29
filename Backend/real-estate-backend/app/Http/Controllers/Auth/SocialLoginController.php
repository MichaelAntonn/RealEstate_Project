<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;
use Illuminate\Support\Facades\Log;

class SocialLoginController extends Controller
{
    public function redirectToGoogle()
    {
        // Force account selection prompt
        /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
        $driver = Socialite::driver('google');
        return $driver->stateless()->with(['prompt' => 'select_account'])->redirect();
    }
    public function handleGoogleCallback()
    {
        try {
            // Use stateless mode to avoid session-based token caching
            /** @var \Laravel\Socialite\Two\GoogleProvider $driver */
            $driver = Socialite::driver('google');
            $googleUser = $driver->stateless()->user();
    
            // Validate Google user data
            if (!$googleUser || !$googleUser->email) {
                throw new \Exception('Failed to retrieve valid Google user data.');
            }
    
            // Log Google user details for debugging
            Log::info('Google user data retrieved', [
                'email' => $googleUser->email,
                'id' => $googleUser->id,
                'name' => $googleUser->name,
                'avatar' => $googleUser->avatar,
            ]);
    
            // Extract the first name and last name from the Google user's name
            $nameParts = explode(' ', $googleUser->name, 2);
            $firstName = $nameParts[0] ?? 'Unknown';
            $lastName = $nameParts[1] ?? '';
    
            // Find or create the user
            $user = User::updateOrCreate(
                [
                    'email' => $googleUser->email,
                ],
                [
                    'first_name' => $firstName,
                    'last_name' => $lastName,
                    'email' => $googleUser->email,
                    'provider_id' => $googleUser->id,
                    'provider' => 'google',
                    'password' => null,
                    'profile_image' => $googleUser->avatar,
                    'email_verified_at' => now(),
                    'terms_and_conditions' => true,
                    'user_type' => 'user',
                    'account_status' => 'active',
                    'phone_number' => ' ', 
                    'address' => null,
                    'country' => null,
                    'city' => null,
                    'identity_document' => null,
                ]
            );
    
            // Log user creation/update
            Log::info('User processed', [
                'user_id' => $user->id,
                'email' => $user->email,
                'provider_id' => $user->provider_id,
            ]);
    
            $token = $user->createToken('google-token')->plainTextToken;
    
            // Log token generation
            Log::info('Token generated', [
                'user_id' => $user->id,
                'token' => $token,
            ]);
    
            // Redirect to frontend with token
            return redirect('http://localhost:4200/#/home?access_token=' . urlencode($token));
        } catch (\Exception $e) {
            // Log the exception details
            Log::error('Google login failed', [
                'message' => $e->getMessage(),
                'exception' => get_class($e),
                'stack_trace' => $e->getTraceAsString(),
            ]);
            return redirect('http://localhost:4200/#/login?error=google_login_failed&message=' . urlencode($e->getMessage()));
        }
    }
}