<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PropertyController;
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

    // Social Login Routes
    Route::prefix('social')->name('social.')->group(function () {
        Route::get('/auth/google', [SocialLoginController::class, 'redirectToGoogle'])->name('googleRedirect');
        Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback'])->name('googleCallback');
    });

    // Password Reset Routes
    Route::prefix('password')->name('password.')->group(function () {
        Route::post('/forgot-password', [ResetPasswordController::class, 'submitForgetPasswordForm'])->name('forgot-password');
        Route::post('/reset-password', [ResetPasswordController::class, 'submitResetPasswordForm'])->name('reset-password');
    });

    // Admin Routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

        // Authenticated Admin Routes
        Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            // Route for creating admins (only accessible by super-admin)
            Route::post('/create-admin', [DashboardController::class, 'createAdmin'])->name('create-admin');

            // Route for deleting regular users (accessible by both super-admin and admin)
            Route::delete('/users/{userId}', [DashboardController::class, 'destroyUser'])->name('destroy-user');

            // Route for deleting admins (accessible only by super-admin)
            Route::delete('/admins/{adminId}', [DashboardController::class, 'destroyAdmin'])->name('destroy-admin');

            // Route to show all users (accessible by super-admin and admin)
            Route::get('/users', [DashboardController::class, 'showUsers'])->name('show-users');

            // Route to show all admins (accessible only by super-admin)
            Route::get('/admins', [DashboardController::class, 'showAdmins'])->name('show-admins');

            // Route for editing profile (accessible by both admin and super-admin)
            Route::put('/edit-profile', [DashboardController::class, 'editProfile'])->name('edit-profile');
        });
    });

    // Property Routes
    Route::prefix('properties')->name('properties.')->group(function () {
        // List all properties with filters (accessible by everyone)
        Route::get('/', [PropertyController::class, 'index'])->name('index');

        // Show a specific property (accessible by everyone)
        Route::get('/{id}', [PropertyController::class, 'show'])->name('show');

        // Add a new property
        Route::post('/', [PropertyController::class, 'store'])->name('store');

        // Update a property (accessible by admins, super-admins, and property owners)
        Route::put('/{id}', [PropertyController::class, 'update'])->name('update');

        // Delete a property (accessible by admins, super-admins, and property owners)
        Route::delete('/{id}', [PropertyController::class, 'destroy'])->name('destroy');

        // Accept a property (accessible by admins and super-admins)
        Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
            Route::put('/{id}/accept', [PropertyController::class, 'acceptProperty'])->name('accept');
            Route::put('/{id}/reject', [PropertyController::class, 'rejectProperty'])->name('reject');
        });
    });
});
