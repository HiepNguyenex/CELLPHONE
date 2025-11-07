<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Product;
use App\Models\Store;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ChatbotService
{
    protected ?string $apiAiUrl;
    protected ?string $apiAiKey;
    protected string $frontendUrl;

    public function __construct()
    {
        // Đọc cấu hình endpoint & key (Groq theo format OpenAI)
        $this->apiAiUrl = config('services.openai.url'); // env: GROQ_API_URL
        $this->apiAiKey = config('services.openai.key'); // env: GROQ_API_KEY

        // URL FE để bot sinh link Markdown đúng dạng {FE}/product/{slug}
        $this->frontendUrl = rtrim(config('app.frontend_url', env('APP_FRONTEND_URL', 'http://127.0.0.1:5173')), '/');
    }

    /**
     * Xử lý tin nhắn người dùng cho một phiên chat.
     * Lưu lịch sử (user -> bot), dựng prompt theo intent, gọi LLM, rồi trả về text bot.
     */
    public function handleUserMessage(ChatSession $session, string $userMessage): string
    {
        $userMessage = trim($userMessage ?? '');

        // 1) Lưu user message (nếu có)
        if ($userMessage !== '') {
            $session->messages()->create([
                'sender'  => 'user',
                'message' => $userMessage,
            ]);
        }

        // 2) Nhận diện intent
        $intent = $this->detectIntent($userMessage);
        $contextData = null;

        // 3) Truy xuất dữ liệu theo intent (RAG nhẹ)
        if ($intent === 'PRODUCT_INQUIRY') {
            $contextData = $this->retrieveProductData($userMessage);
        } elseif ($intent === 'STORE_INQUIRY') {
            $contextData = $this->retrieveStoreData($userMessage);
        }

        // 4) Dựng messages cho LLM
        $messages = $this->buildOpenAiMessages($session, $userMessage, $contextData, $intent);

        // 5) Gọi LLM
        $botResponse = $this->callAiApi($messages);

        // 6) Lưu bot message
        $session->messages()->create([
            'sender'  => 'bot',
            'message' => $botResponse,
        ]);

        return $botResponse;
    }

    /**
     * Phân loại intent rất nhẹ để gợi ý truy xuất data.
     */
    private function detectIntent(string $msg): string
    {
        $m = mb_strtolower($msg);

        // Ưu tiên keyword về CỬA HÀNG
        foreach (['cửa hàng','địa chỉ','chi nhánh','store','location','ở đâu','hà nội','hồ chí minh','đà nẵng'] as $k) {
            if (str_contains($m, $k)) {
                return 'STORE_INQUIRY';
            }
        }

        // Keyword về SẢN PHẨM/THƯƠNG HIỆU
        foreach ([
            'iphone','samsung','oppo','xiaomi','realme','vivo','nokia','asus',
            'giá','bán','mua','sản phẩm','điện thoại','máy tính','khuyến mãi','trả góp','bảo hành'
        ] as $k) {
            if (str_contains($m, $k)) {
                return 'PRODUCT_INQUIRY';
            }
        }

        return 'GENERAL_KNOWLEDGE';
    }

    /**
     * Truy xuất 1 vài sản phẩm liên quan để LLM tham chiếu.
     * Trả về JSON chứa name/brand/slug/price (LLM sẽ dựa vào slug để tạo link FE).
     */
    private function retrieveProductData(string $userMessage): ?string
    {
        $keywords = preg_split('/\s+/', $userMessage, -1, PREG_SPLIT_NO_EMPTY);

        $products = Product::where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    if (mb_strlen($kw) > 2) {
                        $q->orWhere('name', 'like', '%'.$kw.'%');
                    }
                }
            })
            ->with('brand')
            ->limit(3)
            ->get();

        if ($products->isEmpty()) {
            return null;
        }

        return $products->map(function ($p) {
            return [
                'name'  => $p->name,
                'brand' => $p->brand->name ?? 'N/A',
                'slug'  => $p->slug,
                'price' => $p->price,
            ];
        })->toJson(JSON_UNESCAPED_UNICODE);
    }

    /**
     * Truy xuất danh sách cửa hàng gần đúng theo từ khóa.
     */
    private function retrieveStoreData(string $userMessage): ?string
    {
        $keywords = preg_split('/\s+/', $userMessage, -1, PREG_SPLIT_NO_EMPTY);

        $stores = Store::where(function ($q) use ($keywords) {
                foreach ($keywords as $kw) {
                    $kwl = mb_strtolower($kw);
                    if (mb_strlen($kwl) > 2 && !in_array($kwl, ['cửa','hàng','địa','chỉ'])) {
                        $q->orWhere('name', 'like', '%'.$kw.'%')
                          ->orWhere('address', 'like', '%'.$kw.'%');
                    }
                }
            })
            ->limit(5)
            ->get();

        if ($stores->isEmpty()) {
            return null;
        }

        return $stores->map(fn($s) => [
            'name'    => $s->name,
            'address' => $s->address,
            'phone'   => $s->phone ?? 'Chưa có SĐT',
        ])->toJson(JSON_UNESCAPED_UNICODE);
    }

    /**
     * Dựng messages theo chuẩn Chat Completions cho Groq/OpenAI.
     * - Tiêm policy: khi có slug sản phẩm, BẮT BUỘC trả link Markdown: {FE}/product/{slug}
     * - Kèm context (nếu có) dưới role=system để “neo” sự thật.
     * - Lấy 4 message gần nhất để giữ ngữ cảnh.
     */
    private function buildOpenAiMessages(ChatSession $session, string $userMessage, ?string $contextData, string $intent): array
    {
        $system = '';
        $context = null;

        if ($intent === 'PRODUCT_INQUIRY') {
            $base = $this->frontendUrl;
            $system = "Bạn là trợ lý của CELLPHONES-API và CHỈ trả lời dựa trên dữ liệu cung cấp.
QUAN TRỌNG: Khi có sản phẩm (có 'slug'), bạn PHẢI trả về link Markdown: [$base/product/{slug}].
Ví dụ: [iPhone 15]($base/product/iphone-15). Luôn dùng tiếng Việt, ngắn gọn, rõ ràng.";
            $context = $contextData
                ? "DỮ LIỆU SẢN PHẨM (có 'slug'):\n".$contextData
                : "KHÔNG CÓ sản phẩm khớp trong database.";
        } elseif ($intent === 'STORE_INQUIRY') {
            $system = "Bạn là trợ lý của CELLPHONES-API. Trả lời về CỬA HÀNG/ĐỊA CHỈ dựa trên dữ liệu cung cấp. Không bịa. Dùng tiếng Việt.";
            $context = $contextData
                ? "DỮ LIỆU CỬA HÀNG:\n".$contextData
                : "KHÔNG CÓ cửa hàng phù hợp trong database.";
        } else {
            $system = "Bạn là một trợ lý AI hữu ích. Trả lời ngắn gọn, chính xác bằng tiếng Việt.
Nếu nội dung liên quan mua điện thoại, gợi ý mình có thể kiểm tra sản phẩm tại CELLPHONES-API.";
        }

        // Lấy lịch sử: 4 tin gần nhất để giữ ngữ cảnh
        $history = $session->messages()->latest()->limit(4)->get()->reverse();
        $hist = [];
        foreach ($history as $m) {
            $role = $m->sender === 'user' ? 'user' : 'assistant';
            $hist[] = ['role' => $role, 'content' => $m->message];
        }

        $messages = [['role' => 'system', 'content' => $system]];
        if ($context) {
            $messages[] = ['role' => 'system', 'content' => $context];
        }
        $messages = array_merge($messages, $hist);
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $messages;
    }

    /**
     * Gọi Groq (hoặc OpenAI tương thích) theo API Chat Completions.
     * Graceful fallback khi thiếu KEY/URL.
     */
    private function callAiApi(array $messages): string
    {
        try {
            if (!$this->apiAiUrl || !$this->apiAiKey) {
                // Chưa cấu hình LLM -> trả lời lịch sự để FE vẫn hoạt động
                return 'Hiện tại mình chưa kết nối được mô hình AI. Bạn có thể hỏi về sản phẩm/cửa hàng, mình sẽ tra trong dữ liệu có sẵn nhé.';
            }

            $res = Http::withHeaders([
                'Authorization' => 'Bearer '.$this->apiAiKey,
                'Content-Type'  => 'application/json',
            ])->post($this->apiAiUrl, [
                'model'       => 'llama-3.1-8b-instant', // Groq
                'messages'    => $messages,
                'max_tokens'  => 350,
                'temperature' => 0.5,
            ]);

            if ($res->successful()) {
                return $res->json('choices.0.message.content') ?? 'Mình ở đây để hỗ trợ bạn.';
            }

            Log::error('Chatbot Groq API Error: '.$res->body());
            return 'Xin lỗi, mình đang gặp sự cố kỹ thuật (Groq API Error).';
        } catch (\Throwable $e) {
            Log::error('Chatbot Service Exception: '.$e->getMessage());
            return 'Xin lỗi, mình đang gặp sự cố kỹ thuật (Exception).';
        }
    }
}
