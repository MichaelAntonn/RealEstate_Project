<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::prefix('v1')->group(function () {
   // User Routes
Route::name('user.')->group(function () {
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout'])->name('logout');
});

// Admin Routes
Route::prefix('admin')->name('admin.')->group(function () {
    Route::post('/login', [AdminAuthController::class, 'login'])->name('login');
    Route::middleware(['auth:admin-api', AdminMiddleware::class])->post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
    Route::middleware(['auth:admin-api', AdminMiddleware::class])->get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
});

// Redirect to Google for authentication
Route::get('/auth/google', [SocialLoginController ::class, 'redirectToGoogle'])->name('googleRedirect');
// Handle Google callback
Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback'])->name('googleCallback');


});
