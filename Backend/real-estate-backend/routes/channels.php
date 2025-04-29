<?php

use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Log;
use App\Models\User;

// Broadcast::channel('Notifications.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

Broadcast::channel('Notifications.{id}', function ($user, $id) {
    Log::info('Channel auth attempt:', [
        'user_id' => $user ? $user->id : null,
        'requested_id' => $id,
        'user' => $user,
        'request_payload' => request()->all(),
    ]);
    if (!$user) {
        Log::error('No authenticated user for channel auth', ['id' => $id]);
        return false;
    }
    return (int) $user->id === (int) $id;
});
Log::info('Broadcast::channel defined for App.Models.User.{id}');
