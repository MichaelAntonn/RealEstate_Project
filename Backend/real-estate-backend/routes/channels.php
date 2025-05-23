<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;

Broadcast::channel('Notifications.{id}', function ($user, $id) {
    Log::info('Broadcast::channel defined'.$user. $id);
    return (int) $user->id === (int) $id;
});
