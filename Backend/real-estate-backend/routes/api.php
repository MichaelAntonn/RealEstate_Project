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
use App\Http\Controllers\UserDashboardController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\SettingController;

// Public routes
Route::get('/home', [HomeController::class, 'index'])->name('home.index');
Route::get('/search', [PropertyController::class, 'search'])->name('search.properties');

Route::prefix('v1')->group(function () {
    // Authentication routes (public)
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

    // Password Reset Routes (public)
    Route::prefix('password')->name('password.')->group(function () {
        Route::post('/forgot-password', [ResetPasswordController::class, 'submitForgetPasswordForm'])->name('forgot');
        Route::post('/reset-password', [ResetPasswordController::class, 'submitResetPasswordForm'])->name('reset');
    });

    // Social Login Routes (public)
    Route::prefix('social')->name('social.')->group(function () {
        Route::get('/auth/google', [SocialLoginController::class, 'redirectToGoogle'])->name('google.redirect');
        Route::get('/auth/google/callback', [SocialLoginController::class, 'handleGoogleCallback'])->name('google.callback');
    });

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        })->name('user.profile');

        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // Property Routes
        Route::prefix('properties')->name('properties.')->group(function () {
            Route::get('/', [PropertyController::class, 'index'])->name('index');
            Route::get('/{id}', [PropertyController::class, 'show'])->name('show');
            Route::post('/', [PropertyController::class, 'store'])->name('store');
            Route::put('/{id}', [PropertyController::class, 'update'])->name('update');
            Route::delete('/{id}', [PropertyController::class, 'destroy'])->name('destroy');
            Route::put('/{id}/sell', [CommissionController::class, 'completeSale'])->name('sell');
        });

        // Booking routes
        Route::prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', [BookingController::class, 'index'])->name('index');
            Route::get('/{id}', [BookingController::class, 'show'])->name('show');
            Route::post('/', [BookingController::class, 'store'])->name('store');
            Route::put('/{id}/status', [BookingController::class, 'updateStatus'])->name('update.status');
            Route::get('/pending', [BookingController::class, 'getPending'])->name('pending');
            Route::get('/confirmed', [BookingController::class, 'getConfirmed'])->name('confirmed');
            Route::get('/canceled', [BookingController::class, 'getCanceled'])->name('canceled');
        });

        // Review routes
        Route::prefix('reviews')->name('reviews.')->group(function () {
            Route::get('/by-property/{propertyId}', [ReviewController::class, 'getByProperty'])->name('by.property');
            Route::post('/', [ReviewController::class, 'store'])->name('store');
            Route::delete('/{id}', [ReviewController::class, 'destroy'])->name('destroy');
        });

        // User dashboard routes
        Route::prefix('user')->name('user.')->group(function () {
            Route::get('/dashboard', [UserDashboardController::class, 'dashboard'])->name('dashboard');
            Route::get('/statistics', [UserDashboardController::class, 'userStatistics'])->name('statistics');
            Route::get('/profile', [UserDashboardController::class, 'getProfile'])->name('profile');
            Route::put('/profile', [UserDashboardController::class, 'updateProfile'])->name('profile.update');
            Route::post('/change-password', [UserDashboardController::class, 'changePassword'])->name('change.password');
            Route::delete('/account', [UserDashboardController::class, 'deleteAccount'])->name('account.delete');
        });

        // Chat routes
        Route::prefix('messages')->name('messages.')->group(function () {
            Route::post('/send', [ChatController::class, 'sendMessage'])
                ->middleware('auth:sanctum');
            Route::patch('/{message}/read', [ChatController::class, 'markAsRead'])
                ->middleware('auth:sanctum');
            Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages'])
                ->middleware('auth:sanctum');
        });
    });

    // Admin routes
    Route::prefix('admin')->name('admin.')->group(function () {
        Route::post('/login', [AdminAuthController::class, 'login'])->name('login');

        // Authenticated Admin Routes
        Route::middleware(['auth:sanctum', AdminMiddleware::class])->group(function () {
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

            // Admin management
            Route::post('/create-admin', [DashboardController::class, 'createAdmin'])->name('create.admin');
            Route::delete('/users/{userId}', [DashboardController::class, 'destroyUser'])->name('destroy.user');
            Route::delete('/admins/{adminId}', [DashboardController::class, 'destroyAdmin'])->name('destroy.admin');
            Route::get('/users', [DashboardController::class, 'showUsers'])->name('show.users');
            Route::get('/admins', [DashboardController::class, 'showAdmins'])->name('show.admins');
            Route::put('/edit-profile', [DashboardController::class, 'editProfile'])->name('edit.profile');

            // Commission Routes
            Route::prefix('commissions')->group(function () {
                Route::get('/monthly-profit', [CommissionController::class, 'monthlyProfitMargin']);
                Route::get('/overview', [CommissionController::class, 'commissionsOverview']);
                Route::get('/property-stats', [CommissionController::class, 'propertyStatistics']);
                Route::get('/agent-performance', [CommissionController::class, 'agentPerformance']);
                Route::get('/yearly-summary/{year?}', [CommissionController::class, 'yearlySummary']);
                Route::get('/cost-analysis', [CommissionController::class, 'costAnalysis']);
                Route::post('/complete-sale/{id}', [CommissionController::class, 'completeSale']);
            });
            
            // Settings Routes 
            Route::prefix('settings')->group(function () {
                Route::get('/financial', [SettingController::class, 'getFinancialSettings']);
                Route::post('/commission-rate', [SettingController::class, 'updateCommissionRate']);
            });
        });
    });
});
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/messages/send', [ChatController::class, 'sendMessage']);


    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
});
