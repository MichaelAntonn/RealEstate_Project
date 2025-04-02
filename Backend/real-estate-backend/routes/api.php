<?php

use App\Http\Controllers\Auth\AdminAuthController;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\SocialLoginController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\CommissionController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PropertyController;
use App\Http\Middleware\AdminMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ReviewController;

// Public routes
Route::get('/home', [HomeController::class, 'index']);
Route::get('/search', [PropertyController::class, 'search']);

Route::prefix('v1')->group(function () {

    // Authentication routes (public)
    Route::post('/register', [AuthController::class, 'register'])->name('register');
    Route::post('/login', [AuthController::class, 'login'])->name('login');
    
    // Password Reset Routes (public)
    Route::prefix('password')->name('password.')->group(function () {
        Route::post('/forgot-password', [ResetPasswordController::class, 'submitForgetPasswordForm'])
            ->name('forgot-password')
            ->middleware('throttle:3,1');
        Route::post('/reset-password', [ResetPasswordController::class, 'submitResetPasswordForm'])
            ->name('reset-password')
            ->middleware('throttle:3,1');
    });

    // Social Login Routes (public)
    Route::prefix('social')->name('social.')->group(function () {
        Route::get('/auth/google', [SocialLoginController::class, 'redirectToGoogle'])->name('googleRedirect');
        Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback'])->name('googleCallback');
    });

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        });
        
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Property Routes
        Route::prefix('properties')->group(function () {
            Route::get('/', [PropertyController::class, 'index']);
            Route::get('/{id}', [PropertyController::class, 'show']);
            Route::post('/', [PropertyController::class, 'store']);
            Route::put('/{id}', [PropertyController::class, 'update']);
            Route::delete('/{id}', [PropertyController::class, 'destroy']);
            Route::put('/{id}/sell', [CommissionController::class, 'completeSale']);

            // Booking routes
            Route::prefix('bookings')->group(function () {
                Route::get('/', [BookingController::class, 'index']);
                Route::get('/{id}', [BookingController::class, 'show']);
                Route::post('/', [BookingController::class, 'store']);
                Route::put('/{id}/status', [BookingController::class, 'updateStatus']);
                Route::get('/pending', [BookingController::class, 'getPending']);
                Route::get('/confirmed', [BookingController::class, 'getConfirmed']);
                Route::get('/canceled', [BookingController::class, 'getCanceled']);
            });

            // Review routes
            Route::prefix('reviews')->group(function () {
                Route::get('/by-property/{propertyId}', [ReviewController::class, 'getByProperty']);
                Route::post('/', [ReviewController::class, 'store']);
                Route::delete('/{id}', [ReviewController::class, 'destroy']);
            });
        });
    });

    // Admin routes
    Route::prefix('admin')->middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login'])->name('admin.login');
        Route::post('/logout', [AdminAuthController::class, 'logout'])->name('admin.logout');
        Route::get('/dashboard', [DashboardController::class, 'index'])->name('admin.dashboard');

        // Admin management
        Route::post('/create-admin', [DashboardController::class, 'createAdmin'])->name('admin.create-admin');
        Route::delete('/users/{userId}', [DashboardController::class, 'destroyUser'])->name('admin.destroy-user');
        Route::delete('/admins/{adminId}', [DashboardController::class, 'destroyAdmin'])->name('admin.destroy-admin');
        Route::get('/users', [DashboardController::class, 'showUsers'])->name('admin.show-users');
        Route::get('/admins', [DashboardController::class, 'showAdmins'])->name('admin.show-admins');
        Route::put('/edit-profile', [DashboardController::class, 'editProfile'])->name('admin.edit-profile');

        // Property management
        Route::prefix('properties')->group(function () {
            Route::put('/{id}/accept', [PropertyController::class, 'acceptProperty']);
            Route::put('/{id}/reject', [PropertyController::class, 'rejectProperty']);
            
            // Admin booking routes
            Route::prefix('bookings')->group(function () {
                Route::get('/', [BookingController::class, 'index']);
                Route::get('/{id}', [BookingController::class, 'show']);
                Route::put('/{id}/status', [BookingController::class, 'updateStatus']);
                Route::get('/pending', [BookingController::class, 'getPending']);
                Route::get('/confirmed', [BookingController::class, 'getConfirmed']);
                Route::get('/canceled', [BookingController::class, 'getCanceled']);
            });

            // Admin review routes
            Route::prefix('reviews')->group(function () {
                Route::get('/', [ReviewController::class, 'index']);
                Route::get('/{id}', [ReviewController::class, 'show']);
            });
        });

        // Commission and statistics
        Route::get('/commissions', [CommissionController::class, 'commissionsOverview']);
        Route::get('/commissions/monthly-profit', [CommissionController::class, 'monthlyProfitMargin']);
        
        Route::prefix('statistics')->group(function () {
            Route::get('/', [DashboardController::class, 'generalStatistics']);
            Route::get('/latest-properties', [DashboardController::class, 'latestProperties']);
            Route::get('/user-activities', [DashboardController::class, 'userActivities']);
        });
    });
    Route::prefix('user')->middleware('auth:sanctum')->group(function () {
        Route::get('/dashboard', [DashboardController::class, 'index']);
        Route::get('/statistics', [DashboardController::class, 'userStatistics']);
    });
});