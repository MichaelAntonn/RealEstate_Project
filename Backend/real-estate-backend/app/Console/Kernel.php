<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    protected $commands = [
    ];

    protected function schedule(Schedule $schedule)
    {
        $schedule->command('subscriptions:auto-renew')->daily();
    }

    protected function commands()
    {
        require base_path('routes/console.php');
    }
}
