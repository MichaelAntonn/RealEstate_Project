<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use App\Models\Message;

class NewChatMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $message;

    public function __construct(Message $message)
    {
        // تحميل العلاقات مع المرسل والمستقبل والمحادثة
        $this->message = $message->load('sender', 'receiver', 'conversation');
    }

    // تحديد القناة التي سيُبث عليها الحدث (قناة خاصة بالمحادثة)
    public function broadcastOn()
    {
        return new Channel('chat.conversation.' . $this->message->conversation_id);
    }

    // (اختياري) تحديد اسم الحدث الذي سيُرسل للعميل
    public function broadcastAs()
    {
        return 'new.message';
    }

    // (اختياري) تحديد البيانات المرسلة للعميل
    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'sender' => $this->message->sender,
            'receiver' => $this->message->receiver
        ];
    }
}