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
        // Broadcast::routes(['middleware' => ['auth:api']]);
        Broadcast::routes(['middleware' => ['auth:sanctum']]);
        require base_path('routes/channels.php');
    }
}
