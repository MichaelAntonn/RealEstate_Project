<?php

namespace App\Http\Controllers;

use App\Events\NewChatMessage;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
 

public function sendMessage(Request $request) {
    $validated = $request->validate([
        'conversation_id' => 'required|exists:conversations,id',
        'receiver_id' => 'required|exists:users,id',
        'message_text' => 'required|string|max:1000'
    ]);

    $message = Message::create([
        'conversation_id' => $validated['conversation_id'],
        'sender_id' => auth()->id(),
        'receiver_id' => $validated['receiver_id'],
        'message_text' => $validated['message_text']
    ]);

    return response()->json([
        'status' => 'Message sent!',
        'message' => $message
    ]);
}

    // تحديد الرسالة كمقروءة (اختياري)
    public function markAsRead(Message $message)
    {
        // التحقق من أن المستقبل هو المستخدم الحالي
        if ($message->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update(['is_read' => true]);

        return response()->json(['status' => 'Message marked as read']);
    }

    // جلب كل رسائل محادثة معينة (اختياري)
    public function getMessages(Conversation $conversation)
    {
        // التحقق من أن المستخدم مشارك في المحادثة
        if (!in_array(Auth::id(), [$conversation->user1_id, $conversation->user2_id])) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with(['sender', 'receiver'])
            ->latest()
            ->paginate(20);

        return response()->json($messages);
    }
}
