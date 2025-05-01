<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentCompleted extends Notification
{
    use Queueable;

    protected $payment;
    protected $isAdmin;

    /**
     * Create a new notification instance.
     */
    public function __construct($payment, $isAdmin = false)
    {
        $this->payment = $payment;
        $this->isAdmin = $isAdmin;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->line('The introduction to the notification.')
            ->action('Notification Action', url('/'))
            ->line('Thank you for using our application!');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray($notifiable): array
    {
        return [
            'message' => $this->isAdmin ? "Payment completed for user ID: {$this->payment->subscription->user_id}" : 'Your payment has been completed.',
            'amount' => number_format($this->payment->amount, 2),
            'payment_reference' => $this->payment->payment_reference,
            'paid_at' => $this->payment->paid_at->toFormattedDateString(),
        ];
    }
    public function toBroadcast($notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->toArray($notifiable));
    }
}
