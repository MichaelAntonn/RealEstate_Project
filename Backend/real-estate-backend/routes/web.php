<?php

use App\Http\Controllers\Auth\SocialLoginController;use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});



Route::get('/auth/google/redirect', [SocialLoginController::class, 'redirectToGoogle']);
Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback']);
