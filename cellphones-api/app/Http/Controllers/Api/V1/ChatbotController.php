<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Services\ChatbotService; // Import service
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    protected $chatbotService;

    // "Inject" (tiêm) service vào controller
    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Bắt đầu một phiên chat mới
     */
    public function startSession(Request $request)
    {
        $user = $request->user('sanctum'); // Lấy user nếu họ đã đăng nhập

        $session = ChatSession::create([
            'user_id' => $user ? $user->id : null,
            'session_uuid' => (string) Str::uuid(),
        ]);

        return response()->json([
            'session_id' => $session->session_uuid,
            'message' => 'Xin chào, tôi là trợ lý ảo của CELLPHONES-API. Tôi có thể giúp gì cho bạn?'
        ]);
    }

    /**
     * Gửi một tin nhắn trong phiên chat
     */
    public function sendMessage(Request $request, $sessionId)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $session = ChatSession::where('session_uuid', $sessionId)->firstOrFail();

        $userMessage = $request->input('message');

        // Gọi service để xử lý
        $botResponse = $this->chatbotService->handleUserMessage($session, $userMessage);

        return response()->json(['response' => $botResponse]);
    }

    /**
     * Lấy lịch sử của một phiên chat
     */
    public function getHistory($sessionId)
    {
        $session = ChatSession::where('session_uuid', $sessionId)->firstOrFail();

        $messages = $session->messages()->orderBy('created_at', 'asc')->get([
            'sender', 
            'message', 
            'created_at'
        ]);

        return response()->json(['history' => $messages]);
    }
}