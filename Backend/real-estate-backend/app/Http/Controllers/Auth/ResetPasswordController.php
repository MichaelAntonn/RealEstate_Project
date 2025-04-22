<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ResetPasswordController extends Controller
{
    public function submitForgetPasswordForm(Request $request)
    {
        $request->validate([
            'email' => 'required|email|exists:users',
        ]);

        // Generate a unique token
        $token = Str::random(64);

        // Delete any existing tokens for this email
        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        // Insert the new token into the database
        DB::table('password_reset_tokens')->insert([
            'email' => $request->email,
            'token' => Hash::make($token),
            'created_at' => Carbon::now(),
        ]);

        // Find the user
        $user = User::where('email', $request->email)->first();

        // Send the notification
        $user->notify(new ResetPasswordNotification($token));

        // Return a JSON response
        return response()->json(['success' => 'We have emailed your password reset link!'], 200);
    }

    // Handle the submission of the new password
    public function submitResetPasswordForm(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
            'password' => 'required|string|min:8|confirmed|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/',
            'password_confirmation' => 'required',
            'token' => 'required',
        ]);

        // Find the token in the database
        $tokenData = DB::table('password_reset_tokens')
            ->where([
                'email' => $request->email,
                'token' => $request->token,
            ])
            ->first();

        // If the token is invalid, return a JSON error response
        if (!$tokenData || !Hash::check($request->token, $tokenData->token)) {
            return response()->json(['error' => 'Invalid token!'], 400);
        }

        $tokenExpired = Carbon::parse($tokenData->created_at)->addMinutes(30)->isPast();
        if ($tokenExpired) {
            return response()->json(['error' => 'Token has expired!'], 400);
        }
        // Update the user's password
        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        // Delete the token after the password has been reset
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Return a JSON success response
        return response()->json(['success' => 'Your password has been reset!'], 200);
    }
}
