<?php

namespace App\Services;

use App\Models\ChatSession;
use App\Models\Product; // DÙNG MODEL Product của bạn
use App\Models\Store;   // DÙNG MODEL Store của bạn
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log; // Để debug

class ChatbotService
{
    protected $apiAiUrl;
    protected $apiAiKey;
    protected $frontendUrl; // ✅ MỚI: Thêm URL của Frontend

    public function __construct()
    {
        // Đọc config 'openai' (dùng cho Groq)
        $this->apiAiUrl = config('services.openai.url');
        $this->apiAiKey = config('services.openai.key');

        // ✅ MỚI: Đọc URL của Frontend (từ file .env)
        // Nó sẽ đọc biến APP_FRONTEND_URL=http://127.0.0.1:5173 của bạn
        $this->frontendUrl = rtrim(config('app.frontend_url', env('APP_FRONTEND_URL')), '/');
    }

    /**
     * Xử lý tin nhắn (Hàm này không đổi)
     */
    public function handleUserMessage(ChatSession $session, string $userMessage): string
    {
        // ... (Code 1-6 không đổi) ...
        
        // 1. Lưu tin nhắn của người dùng
        $session->messages()->create([
            'sender' => 'user',
            'message' => $userMessage
        ]);

        // 2. Phân loại ý định người dùng
        $intent = $this->detectIntent($userMessage);

        $contextData = null;
        
        // 3. (Retrieval) Truy xuất data dựa trên ý định
        if ($intent === 'PRODUCT_INQUIRY') {
            $contextData = $this->retrieveProductData($userMessage);
        } elseif ($intent === 'STORE_INQUIRY') {
            $contextData = $this->retrieveStoreData($userMessage);
        }
        
        // 4. (Augmented) Xây dựng prompt (dựa trên ý định)
        $promptMessages = $this->buildOpenAiMessages($session, $userMessage, $contextData, $intent);

        // 5. (Generation) Gọi API Groq
        $botResponse = $this->callAiApi($promptMessages);

        // 6. Lưu phản hồi của bot
        $session->messages()->create([
            'sender' => 'bot',
            'message' => $botResponse
        ]);

        return $botResponse;
    }

    /**
     * Phân loại ý định (Hàm này không đổi)
     */
    private function detectIntent(string $userMessage): string
    {
        // Chuyển tin nhắn về chữ thường để so sánh
        $lowerMessage = strtolower($userMessage);

        // Ưu tiên từ khóa về cửa hàng
        $storeKeywords = [
            'cửa hàng', 'địa chỉ', 'chi nhánh', 'store', 'location', 
            'ở đâu', 'hà nội', 'hồ chí minh', 'đà nẵng'
        ];
        foreach ($storeKeywords as $keyword) {
            if (str_contains($lowerMessage, $keyword)) {
                return 'STORE_INQUIRY';
            }
        }

        // Từ khóa về sản phẩm/thương hiệu
        $productKeywords = [
            'iphone', 'samsung', 'oppo', 'xiaomi', 'realme', 'vivo', 'nokia', 'asus',
            'giá', 'bán', 'mua', 'sản phẩm', 'điện thoại', 'máy tính', 'thương hiệu',
            'khuyến mãi', 'bảo hành', 'trả góp', 'ship', 'giao hàng'
        ];
        foreach ($productKeywords as $keyword) {
            if (str_contains($lowerMessage, $keyword)) {
                return 'PRODUCT_INQUIRY';
            }
        }

        // Nếu không -> Đây là câu hỏi chung
        return 'GENERAL_KNOWLEDGE';
    }


    /**
     * (Retrieval) Tìm sản phẩm & thương hiệu (Hàm này không đổi)
     * (Nó đã có 'slug' nên chúng ta không cần sửa)
     */
    private function retrieveProductData(string $userMessage)
    {
        $keywords = explode(' ', $userMessage);

        $products = Product::where(function ($query) use ($keywords) {
            foreach ($keywords as $keyword) {
                if (strlen($keyword) > 2) {
                    $query->orWhere('name', 'LIKE', '%' . $keyword . '%');
                }
            }
        })
        ->with(['brand']) // Lấy kèm thương hiệu
        ->limit(3)
        ->get();

        if ($products->isEmpty()) {
            return null;
        }

        return $products->map(function ($product) {
            return [
                'name' => $product->name,
                'brand' => $product->brand->name ?? 'N/A', // Data thương hiệu
                'slug' => $product->slug, // ✅ Đây là thứ chúng ta cần
                'price' => $product->price ?? 'Chưa có giá',
            ];
        })->toJson(JSON_UNESCAPED_UNICODE);
    }

    /**
     * (Retrieval) Hàm tìm kiếm Cửa hàng (Hàm này không đổi)
     */
    private function retrieveStoreData(string $userMessage)
    {
        $keywords = explode(' ', $userMessage);
        
        $stores = Store::where(function ($query) use ($keywords) {
            foreach ($keywords as $keyword) {
                if (strlen($keyword) > 2 && !in_array($keyword, ['cửa', 'hàng', 'địa', 'chỉ'])) {
                    $query->orWhere('name', 'LIKE', '%' . $keyword . '%')
                          ->orWhere('address', 'LIKE', '%' . $keyword . '%');
                }
            }
        })
        ->limit(5)
        ->get();

        if ($stores->isEmpty()) {
            return null;
        }
        
        return $stores->map(fn($store) => [
            'name' => $store->name,
            'address' => $store->address,
            'phone' => $store->phone ?? 'Chưa có SĐT'
        ])->toJson(JSON_UNESCAPED_UNICODE);
    }


    /**
     * ✅ NÂNG CẤP: Dạy AI cách tạo link Markdown
     */
    private function buildOpenAiMessages(ChatSession $session, string $userMessage, $contextData, string $intent)
    {
        $systemMessage = "";
        $contextSection = null;

        if ($intent === 'PRODUCT_INQUIRY') {
            // Lấy URL của frontend (ví dụ: http://127.0.0.1:5173)
            $baseUrl = $this->frontendUrl;
            
            // ✅ NÂNG CẤP: Thêm chỉ dẫn tạo link Markdown
            $systemMessage = "Bạn là trợ lý ảo của CELLPHONES-API. Trả lời câu hỏi về SẢN PHẨM VÀ THƯƠNG HIỆU.
CHỈ được trả lời dựa trên thông tin được cung cấp. Không bịa đặt.
QUAN TRỌNG: Khi bạn tìm thấy một sản phẩm, bạn PHẢI trả về nó dưới dạng link Markdown.
Ví dụ: [Tên Sản Phẩm]($baseUrl/product/slug-san-pham)
Hãy dùng chính xác cấu trúc link này: `$baseUrl/product/{slug}`.
Luôn trả lời bằng Tiếng Việt.";
            
            $contextSection = $contextData
                ? "Dữ liệu SẢN PHẨM (đã bao gồm 'slug'):\n" . $contextData
                : "Không tìm thấy sản phẩm nào trong database liên quan đến câu hỏi này.";
        
        } elseif ($intent === 'STORE_INQUIRY') {
            // (Không đổi)
            $systemMessage = "Bạn là trợ lý ảo của CELLPHONES-API. Trả lời câu hỏi về CỬA HÀNG VÀ ĐỊA CHỈ.
CHỈ được trả lời dựa trên thông tin được cung cấp. Không bịa đặt. Luôn trả lời bằng Tiếng Việt.";
            $contextSection = $contextData
                ? "Dữ liệu CỬA HÀNG từ database:\n" . $contextData
                : "Không tìm thấy cửa hàng nào trong database liên quan đến câu hỏi này.";
        
        } else {
            // (Không đổi)
            $systemMessage = "Bạn là một trợ lý AI hữu ích. Hãy trả lời câu hỏi của người dùng một cách ngắn gọn, chính xác.
Tuy nhiên, HÃY ƯU TIÊN, nếu câu hỏi có vẻ liên quan đến điện thoại (ví dụ: 'tôi nên mua điện thoại gì?'), 
hãy gợi ý rằng bạn có thể kiểm tra sản phẩm của CELLPHONES-API nếu họ muốn.";
        }

        // Lấy lịch sử chat
        $history = $session->messages()->latest()->limit(4)->get()->reverse();
        $chatHistory = [];
        foreach ($history as $msg) {
            $role = ($msg->sender === 'user') ? 'user' : 'assistant';
            $chatHistory[] = ['role' => $role, 'content' => $msg->message];
        }

        $messages = [
            ['role' => 'system', 'content' => $systemMessage],
        ];

        // Chỉ thêm context nếu nó tồn tại
        if ($contextSection) {
            $messages[] = ['role' => 'system', 'content' => $contextSection];
        }
        
        $messages = array_merge($messages, $chatHistory);
        $messages[] = ['role' => 'user', 'content' => $userMessage];

        return $messages;
    }

    /**
     * (Generation) Gọi API OpenAI/Groq (Hàm này không đổi)
     */
    private function callAiApi(array $messages)
    {
        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiAiKey, // Dùng Bearer Token
                'Content-Type' => 'application/json',
            ])->post($this->apiAiUrl, [
                'model' => 'llama-3.1-8b-instant', // Model Groq
                'messages' => $messages,
                'max_tokens' => 350,
                'temperature' => 0.5,
            ]);

            if ($response->successful()) {
                return $response->json()['choices'][0]['message']['content'];
            }

            // Ghi log lỗi từ Groq
            Log::error('Chatbot Groq API Error: ' . $response->body());
            return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật (Groq API Error).';

        } catch (\Exception $e) {
            Log::error('Chatbot Service Exception: ' . $e->getMessage());
            return 'Xin lỗi, tôi đang gặp sự cố kỹ thuật (Exception).';
        }
    }
}