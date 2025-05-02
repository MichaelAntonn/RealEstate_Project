<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SubscriptionRenewed extends Notification implements ShouldQueue
{
    use Queueable;

    protected $subscription;
    protected $isAdmin;

    public function __construct($subscription, $isAdmin = false)
    {
        $this->subscription = $subscription;
        $this->isAdmin = $isAdmin;
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject($this->isAdmin ? 'Subscription Renewed (Admin Notification)' : 'Your Subscription Has Been Renewed')
            ->line($this->isAdmin ? 'A subscription has been renewed.' : 'Your subscription has been successfully renewed!')
            ->line('Plan: ' . $this->subscription->plan_name)
            ->line('Price: $' . $this->subscription->price)
            ->line('New End Date: ' . $this->subscription->ends_at->toFormattedDateString());

        if (!$this->isAdmin) {
            $message->action('View Subscription', url('/subscriptions'));
        }

        return $message;
    }

    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->isAdmin ? "Subscription renewed for user ID: {$this->subscription->user_id}" : 'Your subscription has been renewed.',
            'plan_name' => $this->subscription->plan_name,
            'ends_at' => $this->subscription->ends_at->toFormattedDateString(),
        ];
    }

    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
