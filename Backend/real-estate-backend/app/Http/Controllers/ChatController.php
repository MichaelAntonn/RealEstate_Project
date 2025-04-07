<?php

namespace App\Http\Controllers;

use App\Events\NewChatMessage;
use App\Models\Message;
use App\Models\Conversation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function createConversation(Request $request)
    {
        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id|not_in:' . auth()->id(), // التأكد من أن المستقبل ليس المستخدم نفسه
            'property_id' => 'nullable|exists:properties,id', // اختياري: إذا كانت المحادثة مرتبطة بعقار
        ]);

        // التحقق من وجود محادثة سابقة بين المستخدمين
        $existingConversation = Conversation::where(function ($query) use ($validated) {
            $query->where('user1_id', auth()->id())
                  ->where('user2_id', $validated['receiver_id']);
        })->orWhere(function ($query) use ($validated) {
            $query->where('user1_id', $validated['receiver_id'])
                  ->where('user2_id', auth()->id());
        })->first();

        // إذا كانت هناك محادثة موجودة، قم بإرجاعها
        if ($existingConversation) {
            return response()->json([
                'status' => 'Conversation already exists',
                'conversation' => $existingConversation
            ]);
        }

        // إنشاء محادثة جديدة
        $conversation = Conversation::create([
            'user1_id' => auth()->id(),
            'user2_id' => $validated['receiver_id'],
            'property_id' => $validated['property_id'] ?? null, // اختياري
            'start_date' => now(),
            'last_message_date' => null, // سيتم تحديثه عند إرسال أول رسالة
        ]);

        return response()->json([
            'status' => 'Conversation created successfully',
            'conversation' => $conversation
        ], 201);
    }
    public function sendMessage(Request $request)
    {
        $validated = $request->validate([
            'conversation_id' => 'required|exists:conversations,id',
            'receiver_id' => 'required|exists:users,id',
            'message_text' => 'required|string|max:1000'
        ]);

        // جلب المحادثة
        $conversation = Conversation::find($validated['conversation_id']);
        if (!$conversation) {
            return response()->json(['error' => 'Conversation not found'], 404);
        }

        // التحقق من أن المرسل والمستقبل مشاركان في المحادثة
        $participantIds = [$conversation->user1_id, $conversation->user2_id];
        if (!in_array(auth()->id(), $participantIds) || !in_array($validated['receiver_id'], $participantIds)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        // إنشاء الرسالة
        $message = Message::create([
            'conversation_id' => $validated['conversation_id'],
            'sender_id' => auth()->id(),
            'receiver_id' => $validated['receiver_id'],
            'message_text' => $validated['message_text']
        ]);

        // تحديث تاريخ آخر رسالة في المحادثة
        $conversation->update(['last_message_date' => now()]);

        // بث الرسالة
        broadcast(new NewChatMessage($message))->toOthers();

        return response()->json([
            'status' => 'Message sent!',
            'message' => $message
        ]);
    }

    // تحديد الرسالة كمقروءة
    public function markAsRead(Message $message)
    {
        // التحقق من أن المستقبل هو المستخدم الحالي
        if ($message->receiver_id !== Auth::id()) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $message->update(['is_read' => true]);

        return response()->json(['status' => 'Message marked as read']);
    }

    // جلب كل رسائل محادثة معينة
    public function getMessages(Conversation $conversation)
    {
        // التحقق من أن المستخدم مشارك في المحادثة
        $participantIds = [$conversation->user1_id, $conversation->user2_id];
        if (!in_array(Auth::id(), $participantIds)) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $messages = $conversation->messages()
            ->with(['sender', 'receiver'])
            ->latest()
            ->paginate(20);

        return response()->json($messages);
    }
}