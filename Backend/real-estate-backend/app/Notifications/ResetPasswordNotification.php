<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Log;

class ResetPasswordNotification extends Notification implements ShouldQueue
{
    use Queueable;
    protected $token;
    /**
     * Create a new notification instance.
     */
    public function __construct($token)
{
    $this->token = $token;
}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable)
    {
        // $resetUrl = route('password.reset.token', ['token' => $this->token]);
        $resetUrl = 'https://RealEstate.com/reset-password/' . $this->token;
        Log::info($notifiable);
        return (new MailMessage)
    ->subject('Reset Password')
    ->markdown('emails.reset-password', [
        'resetUrl' => $resetUrl,
    ]);

    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
