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
use App\Http\Controllers\FavoriteController;
use App\Http\Controllers\SubscriptionController;
use App\Http\Controllers\SubscriptionPlanController;

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
        Route::get('/check-slug', [PropertyController::class, 'checkSlug'])->name('check-slug');
        Route::get('check-property-code', [PropertyController::class, 'checkPropertyCode'])->name('check-property-code');
        Route::get('/slug/{slug}', [PropertyController::class, 'showBySlug'])->name('showBySlug');
        Route::get('/{id}', [PropertyController::class, 'show'])->name('show');
    });

    // Search Route (public)
    Route::get('/search', [PropertyController::class, 'search'])->name('search.properties') /*->middleware('throttle:search')*/;

    // Cities Route (public)
    Route::get('/cities', [PropertyController::class, 'getCities'])->name('cities.index');

    Route::prefix('companies')->group(function () {
        Route::get('/', [CompanyController::class, 'index']);  // Get all companies
        Route::post('/', [CompanyController::class, 'store']); // Create a new company
        Route::get('/{company_id}', [CompanyController::class, 'show']); // Get a specific company
    });
    // Subscriptions Routes
    Route::prefix('subscription')->group(function () {
        // Public routes (accessible without authentication)
        Route::get('/plans', [SubscriptionController::class, 'getPlans'])->name('subscription.plans'); // Get all available subscription plans except trial
        Route::get('/plan/trial', [SubscriptionController::class, 'getTrialPlan'])->name('subscription.trialPlan'); // Get the trial subscription plan
        Route::get('/plans/all', [SubscriptionController::class, 'getAllPlansForRegistration'])->name('subscription.allPlansForRegistration'); // Get all plans including trial for registration
    });

    // Authenticated user routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/user', function (Request $request) {
            return $request->user();
        })->name('user.get-profile'); // two //user.profile

        Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');

        // Property Routes
        Route::prefix('properties')->name('properties.')->group(function () {
            Route::post('/', [PropertyController::class, 'store'])->name('store');
            Route::put('/{property}', [PropertyController::class, 'update'])->name('update');
            Route::delete('/{property}', [PropertyController::class, 'destroy'])->name('destroy');
            Route::put('/{property}/sell', [CommissionController::class, 'completeSale'])->name('sell');

            Route::prefix('favorites')->group(function () {
                Route::get('/all', [FavoriteController::class, 'index'])->name('favorites');
                Route::post('/{property}', [FavoriteController::class, 'store'])->name('add-favorite');
                Route::delete('/{property}', [FavoriteController::class, 'destroy'])->name('remove-favorite');
                Route::get('/{property}/is-favorite', [FavoriteController::class, 'check'])->name('check-favorite');
            });


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
            Route::get('/{id}', [BookingController::class, 'show'])->name('show');
            Route::post('/', [BookingController::class, 'store'])->name('store');
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
            Route::get('/profile', [UserDashboardController::class, 'getProfile'])->name('profile'); // one
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

        Route::prefix('companies')->name('company.')->group(function () {
            Route::put('/{company_id}', [CompanyController::class, 'update']); // Update a company
            Route::delete('/{company_id}', [CompanyController::class, 'destroy']); // Delete a company
        });
        Route::prefix('subscription')->group(function () {
            Route::post('/subscribe', [SubscriptionController::class, 'subscribe'])->name('subscription.subscribe'); // Subscribe a company to a plan
            Route::post('/subscribe/trial', [SubscriptionController::class, 'subscribeToTrial'])->name('subscription.subscribeTrial'); // Subscribe a company to a trial plan
            Route::get('/company/{id}/subscription', [SubscriptionController::class, 'show'])->name('subscription.show'); // Get a company's subscription details by company ID
            Route::post('/cancel', [SubscriptionController::class, 'cancelSubscription'])->name('subscription.cancel'); // Cancel the subscription for the authenticated company
            Route::put('/{id}', [SubscriptionController::class, 'updateSubscription'])->name('subscription.update'); // Update subscription details by subscription ID
            Route::get('/upcoming-expirations', [SubscriptionController::class, 'getUpcomingExpirations']); // get upcoming subscription expirations within a specific number of days
            Route::get('/current-subscription-status', [SubscriptionController::class, 'getCurrentSubscriptionStatus']); // get the current subscription status of the authenticated company

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

            // Bookings Routes
            Route::prefix('bookings')->name('bookings.')->group(function () {
                Route::get('/pending', [BookingController::class, 'getPending'])->name('pending');
                Route::get('/confirmed', [BookingController::class, 'getConfirmed'])->name('confirmed');
                Route::get('/canceled', [BookingController::class, 'getCanceled'])->name('canceled');
                Route::put('/{id}/status', [BookingController::class, 'updateStatus'])->name('update.status');
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
                    Route::post('/monthly', [SettingController::class, 'createMonthlyGoal'])->name('monthly.create'); // Create a monthly goal
                    Route::get('/monthly/target', [SettingController::class, 'getMonthlyTarget'])->name('monthly.target'); // Get a monthly goal
                    Route::put('/monthly/{goalId}', [SettingController::class, 'updateMonthlyGoal'])->name('monthly.update'); // Update a monthly goal
                    Route::post('/yearly', [SettingController::class, 'createYearlyGoal'])->name('yearly.create');  // Create a yearly goal
                    Route::get('/yearly/target', [SettingController::class, 'getYearlyTarget'])->name('yearly.target'); // Get a yearly goal
                    Route::put('/yearly/{goalId}', [SettingController::class, 'updateYearlyGoal'])->name('yearly.update'); // Update a yearly goal
                    Route::delete('/{goal}', [SettingController::class, 'deleteGoal'])->name('delete'); // Delete a Goal
                });
                Route::prefix('subscription')->group(function () {
                    Route::get('/plan/{id}', [SubscriptionPlanController::class, 'show'])->name('settings.subscriptions.plan.show'); // Get details of a specific subscription plan by ID
                    Route::get('/plans', [SubscriptionPlanController::class, 'index'])->name('settings.subscriptions.index'); // Get all subscription plans
                    Route::post('/plan', [SubscriptionPlanController::class, 'store'])->name('settings.subscriptions.store'); // Create a new subscription plan
                    Route::put('/plan/{id}', [SubscriptionPlanController::class, 'update'])->name('settings.subscriptions.update'); // Update an existing subscription plan by ID
                    Route::delete('/plan/{id}', [SubscriptionPlanController::class, 'destroy'])->name('settings.subscriptions.destroy'); // Delete a subscription plan by ID
                    Route::get('/check-expired-subscriptions', [SubscriptionController::class, 'checkExpiredSubscriptions']);  // check expired subscriptions and update their status
                    Route::get('/subscription-reports', [SubscriptionController::class, 'getSubscriptionReports']);  // get subscription reports (total, active, expired, canceled, etc.)

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
Route::get('/company/{company_id}', [CompanyController::class, 'show']);
Route::put('/company/{company_id}', [CompanyController::class, 'update']);
Route::delete('/company/{company_id}', [CompanyController::class, 'destroy']);
