<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Notifications\Messages\BroadcastMessage;

class NewPropertySubmitted extends Notification
{
    use Queueable;

    protected $property;

    /**
     * Create a new notification instance.
     */
    public function __construct($property)
    {
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
            'message' => 'A new property "' . $this->property->title . '" has been submitted for review.',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'submitted_by' => $this->property->user->name,
            'url' => '/property-details/' . $this->property->slug,
        ];
    }
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'message' => 'A new property "' . $this->property->title . '" has been submitted for review.',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'submitted_by' => $this->property->user->name,
            'url' => '/property-details/' . $this->property->slug,
        ]);
    }
}
