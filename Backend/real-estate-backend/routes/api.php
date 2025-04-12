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
use App\Http\Controllers\CostController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\CompanyController;

// Public routes
Route::get('/home', [HomeController::class, 'index'])->name('home.index');

Route::prefix('v1')->group(function () {
    // Authentication routes (public)
    Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/login', [AuthController::class, 'login'])->name('auth.login')->middleware('throttle:login');

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

    // Property Routes (public)
    Route::prefix('properties')->name('properties.')->group(function () {
        Route::get('/', [PropertyController::class, 'index'])->name('index');
        Route::get('/{id}', [PropertyController::class, 'show'])->name('show');
    });

    // Search Route (public)
    Route::get('/search', [PropertyController::class, 'search'])->name('search.properties') /*->middleware('throttle:search')*/;

    // Cities Route (public)
    Route::get('/cities', [PropertyController::class, 'getCities'])->name('cities.index');

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        })->name('user.profile');

        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // Property Routes
        Route::prefix('properties')->name('properties.')->group(function () {
            Route::post('/', [PropertyController::class, 'store'])->name('store');
            Route::put('/{property}', [PropertyController::class, 'update'])->name('update');
            Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('destroy');
            Route::put('/{property}/sell', [CommissionController::class, 'completeSale'])->name('sell');

            // Status Routes
            Route::prefix('status')->group(function () {
                Route::get('/pending', [PropertyController::class, 'getPendingProperties'])->name('pending');
                Route::get('/accepted', [PropertyController::class, 'getAcceptedProperties'])->name('accepted');
                Route::get('/rejected', [PropertyController::class, 'getRejectedProperties'])->name('rejected');
            });

            // Media Routes
            Route::prefix('/{property}/media')->name('media.')->group(function () {
                Route::get('/', [PropertyController::class, 'getMedia'])->name('index');
                Route::post('/', [PropertyController::class, 'addMedia'])->name('store');
                Route::delete('/{media}', [PropertyController::class, 'deleteMedia'])->name('delete');
            });
        });



        // Booking routes
        Route::prefix('bookings')->name('bookings.')->group(function () {
            Route::get('/', [BookingController::class, 'index'])->name('index');
            Route::get('/pending', [BookingController::class, 'getPending'])->name('pending');
            Route::get('/confirmed', [BookingController::class, 'getConfirmed'])->name('confirmed');
            Route::get('/canceled', [BookingController::class, 'getCanceled'])->name('canceled');
            Route::get('/{id}', [BookingController::class, 'show'])->name('show');
            Route::post('/', [BookingController::class, 'store'])->name('store');
            Route::put('/{id}/status', [BookingController::class, 'updateStatus'])->name('update.status');
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
            Route::prefix('properties')->name('properties.')->group(function () {
                Route::put('/{id}/accept', [PropertyController::class, 'acceptProperty'])->name('accept');
                Route::put('/{id}/reject', [PropertyController::class, 'rejectProperty'])->name('reject');
            });

            // Commission Routes
            Route::prefix('commissions')->name('commissions.')->group(function () {
                Route::get('/monthly-profit', [CommissionController::class, 'monthlyProfitMargin'])->name('monthly-profit'); // Returns the monthly profit margin analysis
                Route::post('/complete-sale/{id}', [CommissionController::class, 'completeSale'])->name('complete-sale'); // Completes the property sale and calculates the commission
                Route::get('/overview', [CommissionController::class, 'commissionsOverview'])->name('overview'); // Provides an overview of the commissions
                Route::get('/property-statistics', [CommissionController::class, 'propertyStatistics'])->name('property-statistics'); // Displays property statistics
                Route::get('/agent-performance', [CommissionController::class, 'agentPerformance'])->name('agent-performance'); // Shows the performance of the top agents
                Route::get('/yearly-summary/{year?}', [CommissionController::class, 'yearlySummary'])->name('yearly-summary'); // Provides a yearly summary of sales, commissions, and new properties
                Route::get('/cost-analysis', [CommissionController::class, 'costAnalysis'])->name('cost-analysis'); // Analyzes costs by category
                Route::get('/yearly-goal-progress/{year}', [CommissionController::class, 'getYearlyGoalProgress'])->name('yearly-goal-progress'); // Shows progress towards achieving yearly goals
                Route::get('/cost-trends', [CommissionController::class, 'costTrends'])->name('cost-trends'); // Analyzes cost trends over the past months
                Route::get('/profit-analysis/{year?}', [CommissionController::class, 'profitAnalysis'])->name('profit-analysis'); // Analyzes yearly profits and compares them with costs
            });

            // Goals Routes
            Route::prefix('goals')->name('goals.')->group(function () {
                Route::get('/monthly-progress/{year}/{month}', [GoalController::class, 'getMonthlyGoalProgress'])->name('monthly-progress');
                Route::get('/yearly-progress/{year}', [GoalController::class, 'getYearlyGoalProgress'])->name('yearly-progress');
                Route::get('/monthly-breakdown/{year}', [GoalController::class, 'getMonthlyBreakdown'])->name('monthly-breakdown');
            });

            // Costs Routes
            Route::prefix('costs')->name('costs.')->group(function () {

                Route::get('/', [CostController::class, 'index']); // Retrieve all costs (with optional filters: search, month, year, type)
                Route::post('/', [CostController::class, 'store']); // Create a new cost entry
                // Additional cost routes
                Route::get('/summary', [CostController::class, 'summary']); // Get a cost summary for a specific month and year
                Route::get('/categories', [CostController::class, 'usedCategories']); // Get distinct categories used in existing cost records
                // Individual cost routes
                Route::get('/{cost}', [CostController::class, 'show']); // Show details of a specific cost by ID
                Route::put('/{cost}', [CostController::class, 'update']); // Update an existing cost
                Route::delete('/{cost}', [CostController::class, 'destroy']); // Delete a cost by ID
            });

            // Settings Routes
            Route::prefix('settings')->name('settings.')->group(function () {
                Route::get('/financial', [SettingController::class, 'getFinancialSettings'])->name('financial');
                Route::post('/financial', [SettingController::class, 'updateCommissionRate'])->name('commission-rate');
                Route::prefix('goals')->name('goals.')->group(function () {
                    Route::post('/monthly', [SettingController::class, 'createMonthlyGoal'])->name('monthly-goal'); // Create a monthly goal
                    Route::get('/monthly/target', [SettingController::class, 'getMonthlyTarget'])->name('monthly-goal'); // Get a monthly goal
                    Route::post('/yearly', [SettingController::class, 'createYearlyGoal'])->name('yearly-goal');  // Create a yearly goal
                    Route::get('/yearly/target', [SettingController::class, 'getYearlyTarget'])->name('yearly-goal'); // Get a yearly goal
                    Route::put('/monthly/{goalId}', [SettingController::class, 'updateMonthlyGoal'])->name('monthly-goal'); // Update a monthly goal
                    Route::put('/yearly/{goalId}', [SettingController::class, 'updateYearlyGoal'])->name('yearly-goal'); // Update a yearly goal
                    Route::delete('/{goal}', [SettingController::class, 'deleteGoal']); // Delete a Goal
                });
            });
        });
    });
});

// routes/api.php
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/messages/send', [ChatController::class, 'sendMessage']);
    Route::get('/conversations/{conversation}/messages', [ChatController::class, 'getMessages']);
    Route::post('/conversations', [ChatController::class, 'createConversation'])->middleware('auth:sanctum');
});
// routes/Company
Route::post('/company/register', [CompanyController::class, 'store']);

