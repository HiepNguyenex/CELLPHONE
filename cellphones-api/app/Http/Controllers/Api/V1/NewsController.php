<?php
// === FILE: app/Http/Controllers/Api/V1/NewsController.php ===

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\News;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NewsController extends Controller
{
    public function index(Request $request)
    {
        $limit = max(1, (int) $request->integer('limit', 10));
        $page  = max(1, (int) $request->integer('page', 1));

        $q = News::query()
            ->when($request->filled('q'), fn ($qq) =>
                $qq->where('title', 'like', '%' . $request->q . '%'))
            ->orderByDesc('published_at')
            ->orderByDesc('id');

        $total = (clone $q)->count();
        $data  = $q->forPage($page, $limit)->get();

        return response()->json([
            'data' => $data,
            'meta' => ['page' => $page, 'limit' => $limit, 'total' => $total],
        ]);
    }

    public function show(string $slugOrId)
    {
        $item = News::query()
            ->when(is_numeric($slugOrId),
                fn ($q) => $q->where('id', $slugOrId),
                fn ($q) => $q->where('slug', $slugOrId)
            )->firstOrFail();

        return response()->json($item);
    }

    // n8n POST vào đây
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title'        => 'required|string|max:255',
            'slug'         => 'nullable|string|max:180',
            'excerpt'      => 'nullable|string|max:500',
            'content_html' => 'required|string',
            'image_url'    => 'nullable|url|max:255',
            'source_url'   => 'nullable|url|max:255',
            'source_name'  => 'nullable|string|max:100',
            'published_at' => 'nullable|date',
            'tags'         => 'nullable',
            'status'       => 'nullable|in:publish,draft',
        ]);

        // slug cơ sở
        $baseSlug = Str::of($validated['slug'] ?? $validated['title'])
            ->slug('-')->limit(180, '')->toString();
        if ($baseSlug === '') {
            $baseSlug = Str::lower(Str::random(12));
        }

        // map tiếng Việt cho source_name nếu thiếu
        $sourceName = trim((string)($validated['source_name'] ?? ''));
        if ($sourceName === '' && !empty($validated['source_url'])) {
            $sourceName = $this->mapSourceNameFromUrl($validated['source_url']);
        }

        // tags: nhận array hoặc json
        $tags = $validated['tags'] ?? [];
        if (is_string($tags)) {
            $decoded = json_decode($tags, true);
            $tags = is_array($decoded) ? $decoded : [];
        }

        // ✅ Khoá ưu tiên: source_url (nếu có) để tránh unique violation
        $key = [];
        if (!empty($validated['source_url'])) {
            $key = ['source_url' => $validated['source_url']];
        } else {
            $key = ['slug' => $this->ensureUniqueSlug($baseSlug)];
        }

        $payload = [
            'title'        => $validated['title'],
            'slug'         => $key['slug'] ?? $this->ensureUniqueSlug($baseSlug),
            'excerpt'      => $validated['excerpt']      ?? null,
            'content_html' => $validated['content_html'],
            'image_url'    => $validated['image_url']    ?? null,
            'source_url'   => $validated['source_url']   ?? null,
            'source_name'  => $sourceName ?: null,
            'published_at' => $validated['published_at'] ?? now(),
            'tags'         => $tags,
            'status'       => $validated['status']       ?? 'publish',
        ];

        $news = News::updateOrCreate($key, $payload);

        return response()->json($news, 201);
    }

    private function ensureUniqueSlug(string $base): string
    {
        $slug = $base;
        $i = 0;
        while (News::where('slug', $slug)->exists()) {
            $i++;
            $slug = Str::limit($base . '-' . Str::lower(Str::random(6)), 180, '');
            if ($i > 5) break;
        }
        return $slug;
    }

    private function mapSourceNameFromUrl(string $url): string
    {
        $host = parse_url($url, PHP_URL_HOST) ?: '';
        $host = preg_replace('/^www\./', '', strtolower($host));

        $map = [
            'vnexpress.net' => 'VnExpress',
            'zingnews.vn'   => 'ZingNews',
            'tuoitre.vn'    => 'Tuổi Trẻ',
            'thanhnien.vn'  => 'Thanh Niên',
            'genk.vn'       => 'GenK',
            'dantri.com.vn' => 'Dân Trí',
            'vietnamnet.vn' => 'VietNamNet',
            'cafef.vn'      => 'CafeF',
            'vietcetera.com'=> 'Vietcetera',
        ];

        return $map[$host] ?? $host;
    }
}
// === KẾT FILE: app/Http/Controllers/Api/V1/NewsController.php ===
