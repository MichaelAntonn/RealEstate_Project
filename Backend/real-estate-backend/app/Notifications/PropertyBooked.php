<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;


class PropertyBooked extends Notification
{
    use Queueable;
    protected $booking;
    protected $property;

    /**
     * Create a new notification instance.
     */
    public function __construct($booking, $property)
    {
        $this->booking = $booking;
        $this->property = $property;
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
    public function toArray(object $notifiable): array
    {
        return [
            'message' => 'Someone booked your property "' . $this->property->title . '"!',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'booking_id' => $this->booking->id,
            'booker_id' => $this->booking->user_id,
            'booking_date' => $this->booking->booking_date,
            'url' => url('/properties/' . $this->property->id),
        ];
    }
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => 'Someone booked your property "' . $this->property->title . '"!',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'booking_id' => $this->booking->id,
            'booker_id' => $this->booking->user_id,
            'booking_date' => $this->booking->booking_date,
            'url' => url('/properties/' . $this->property->id),
        ]);
    }
}
