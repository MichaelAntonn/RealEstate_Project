<?php

use App\Http\Controllers\Auth\SocialLoginController;use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});



Route::get('/auth/google', [SocialLoginController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback']);

use Illuminate\Support\Facades\Mail;

// Route::get('/test-mail', function () {
//     Mail::raw('Hello World!', function ($message) {
//         $message->to('michaelanton343@gmail.com')
//                 ->subject('Test Email from Laravel');
//     });

//     return 'Email sent';
// });
