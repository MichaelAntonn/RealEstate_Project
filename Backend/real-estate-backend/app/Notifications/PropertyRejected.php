<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PropertyRejected extends Notification
{
    use Queueable;

    protected $property;
    protected $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct($property, $reason = null)
    {
        $this->property = $property;
        $this->reason = $reason;
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
        $data = [
            'message' => 'Your property "' . $this->property->title . '" has been rejected.',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'url' => url('/properties/' . $this->property->id),
        ];

        if ($this->reason) {
            $data['reason'] = $this->reason;
        }

        return $data;
    }
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        $data = [
            'message' => 'Your property "' . $this->property->title . '" has been rejected.',
            'property_id' => $this->property->id,
            'property_title' => $this->property->title,
            'url' => '/property-details/' . $this->property->slug,
        ];

        if ($this->reason) {
            $data['reason'] = $this->reason;
        }

        return new BroadcastMessage($data);
    }
}
