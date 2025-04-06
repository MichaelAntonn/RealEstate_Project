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
            Route::get('/user/activities', [DashboardController::class, 'userActivities'])->name('Activities');;
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
            Route::get('/statistics', [DashboardController::class, 'generalStatistics'])->name('statistics');
            Route::get('/latest-properties', [DashboardController::class, 'latestProperties'])->name('latest-properties');
            Route::get('/user-activities/{userId?}', [DashboardController::class, 'userActivities'])->name('user-activities');

            // Property Routes
            Route::prefix('properties')->group(function () {
                Route::put('/{id}/accept', [PropertyController::class, 'acceptProperty'])->name('properties.accept');
                Route::put('/{id}/reject', [PropertyController::class, 'rejectProperty'])->name('properties.reject');
            });

            // Commission Routes
            Route::prefix('commissions')->group(function () {
                Route::get('/monthly-profit', [CommissionController::class, 'monthlyProfitMargin'])->name('commissions.monthly-profit');
                Route::get('/overview', [CommissionController::class, 'commissionsOverview'])->name('commissions.overview');
                Route::get('/property-stats', [CommissionController::class, 'propertyStatistics'])->name('commissions.property-stats');
                Route::get('/agent-performance', [CommissionController::class, 'agentPerformance'])->name('commissions.agent-performance');
                Route::get('/yearly-summary/{year?}', [CommissionController::class, 'yearlySummary'])->name('commissions.yearly-summary');
                Route::get('/cost-analysis', [CommissionController::class, 'costAnalysis'])->name('commissions.cost-analysis');
                Route::post('/complete-sale/{id}', [CommissionController::class, 'completeSale'])->name('commissions.complete-sale');

                // Goal routes
                Route::post('/set-goal', [CommissionController::class, 'setSalesGoal'])->name('commissions.set-goal');
                Route::get('/goals-progress', [CommissionController::class, 'getGoalsProgress'])->name('commissions.goals-progress');
                Route::get('/monthly-profit-with-goals', [CommissionController::class, 'monthlyProfitMarginWithGoals'])->name('commissions.monthly-profit-with-goals');
                Route::get('/goal-details/{id}', [CommissionController::class, 'getGoalDetails'])->name('commissions.goal-details');

                // Yearly Goals Routes
                Route::post('/yearly-goals', [CommissionController::class, 'createYearlyGoal'])->name('commissions.create.yearly-goal');
                Route::get('/yearly-goals', [CommissionController::class, 'getYearlyGoals'])->name('commissions.get.yearly-goals');
                Route::get('/yearly-goals/{year}', [CommissionController::class, 'getYearlyGoalDetails'])->name('commissions.get.yearly-goal-details');
                Route::put('/yearly-goals/{id}', [CommissionController::class, 'updateYearlyGoal'])->name('commissions.update.yearly-goal');
                Route::delete('/yearly-goals/{id}', [CommissionController::class, 'deleteYearlyGoal'])->name('commissions.delete.yearly-goal');
                Route::get('/yearly-goals/{year}/progress', [CommissionController::class, 'getYearlyGoalProgress'])->name('commissions.get.yearly-goal-progress');
                
            });

            // Settings Routes 
            Route::prefix('settings')->group(function () {
                Route::get('/financial', [SettingController::class, 'getFinancialSettings'])->name('settings.financial');
                Route::post('/commission-rate', [SettingController::class, 'updateCommissionRate'])->name('settings.commission-rate');
            });
        });
    });
});
// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/messages/send', [ChatController::class, 'sendMessage']);


    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
});
