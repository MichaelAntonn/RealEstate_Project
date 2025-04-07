<?php

namespace App\Providers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // Register any application services here.
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {

        // Custom rate limit for login route
        RateLimiter::for('login', function (Request $request) {
            return RateLimiter::perMinute(10); // Allow 10 requests per minute
        });

        // Custom rate limit for search route
        RateLimiter::for('search', function (Request $request) {
            return RateLimiter::perMinute(5); // Allow 5 searches per minute
        });
    }
}