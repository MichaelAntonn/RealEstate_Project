<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

class BroadcastServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        Log::info('BroadcastServiceProvider booted');
        Broadcast::routes(['middleware' => ['auth:sanctum']]);
        Log::info('Loading routes/channels.php');
        require base_path('routes/channels.php');
        Log::info('routes/channels.php loaded successfully');
    }
}
