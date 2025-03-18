<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class SocialLoginController extends Controller
{
    public function redirectToGoogle()
    {
        return Socialite::driver('google')->redirect();
    }

    // Handle Google callback
    public function handleGoogleCallback()
    {
        $googleUser = Socialite::driver('google')->user();
 // Extract the first name and last name from the Google user's name
 $nameParts = explode(' ', $googleUser->name, 2);
 $firstName = $nameParts[0] ?? 'Unknown'; // Default to 'Unknown' if first name is missing
 $lastName = $nameParts[1] ?? ''; // Default to empty string if last name is missing

 // Find or create the user
 $user = User::updateOrCreate(
     [
         'email' => $googleUser->email, // Use email as a unique identifier
     ],
     [
         'first_name' => $firstName,
         'last_name' => $lastName,
         'email' => $googleUser->email,
         'provider_id' => $googleUser->id, // Store provider ID
         'provider' => 'google', // Store provider name
         'password' => null, // No password for OAuth users
         'profile_image' => $googleUser->avatar, // Use Google's profile image as the avatar
         'email_verified_at' => now(), // Mark email as verified
         'terms_and_conditions' => true, // Assume the user agrees to terms and conditions
         'user_type' => 'user', // Default user type
         'account_status' => 'active', // Default account status
         'phone_number' => ' ', // Default to null (or provide a default value if required)
         'address' => null, // Default to null (or provide a default value if required)
         'country' => null, // Default to null (or provide a default value if required)
         'city' => null, // Default to null (or provide a default value if required)
         'identity_document' => null, // Default to null (or provide a default value if required)
     ]
 );

 $token = $user->createToken('google-token')->plainTextToken;
 return response()->json([
     'access_token' => $token,
     'user' => $user,
 ]);
    }
}
