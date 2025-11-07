<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ChatSession;
use App\Services\ChatbotService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ChatbotController extends Controller
{
    protected $chatbotService;

    public function __construct(ChatbotService $chatbotService)
    {
        $this->chatbotService = $chatbotService;
    }

    /**
     * Idempotent: nếu đã có phiên "open" của user -> trả về luôn.
     * Nếu chưa có -> tạo mới. Khách chưa đăng nhập sẽ 401 do group auth:sanctum.
     */
    public function startSession(Request $request)
    {
        $user = $request->user('sanctum');

        // Tìm phiên mở gần nhất của user
        $existing = ChatSession::where('user_id', $user->id)
            ->where('status', 'open')
            ->orderByDesc('updated_at')
            ->first();

        if ($existing) {
            return response()->json([
                'session_id' => $existing->id,
                'message'    => 'Tiếp tục phiên chat hiện có.',
            ]);
        }

        // ✅ Fix: ép kiểu TTL sang int để tránh lỗi Carbon (string => int)
        $ttl = (int) config('chat.ttl_minutes', 120);

        // Tạo mới
        $session = ChatSession::create([
            'id'              => (string) Str::uuid(),   // UUID là khóa chính
            'user_id'         => $user->id,
            'status'          => 'open',
            'last_activity_at'=> now(),
            'expires_at'      => now()->addMinutes($ttl),
            'meta'            => [],
        ]);

        return response()->json([
            'session_id' => $session->id,
            'message'    => 'Xin chào, tôi là trợ lý ảo của CELLPHONES-API. Tôi có thể giúp gì cho bạn?',
        ]);
    }

    public function sendMessage(Request $request, $sessionId)
    {
        $request->validate([
            'message' => 'required|string|max:1000'
        ]);

        $session = ChatSession::where('id', $sessionId)->firstOrFail();
        // Bảo vệ: chỉ chủ sở hữu mới được gửi
        if ($request->user('sanctum')->id !== $session->user_id) {
            abort(403, 'Forbidden');
        }

        $userMessage = $request->input('message');
        $botResponse = $this->chatbotService->handleUserMessage($session, $userMessage);

        // Cập nhật hoạt động
        $session->update(['last_activity_at' => now()]);

        return response()->json(['response' => $botResponse]);
    }

    public function getHistory(Request $request, $sessionId)
    {
        $session = ChatSession::where('id', $sessionId)->firstOrFail();
        if ($request->user('sanctum')->id !== $session->user_id) {
            abort(403, 'Forbidden');
        }

        $messages = $session->messages()
            ->orderBy('created_at', 'asc')
            ->get(['sender','message','created_at']);

        return response()->json(['history' => $messages]);
    }
}
