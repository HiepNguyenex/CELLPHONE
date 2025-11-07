<?php
// === FILE: app/Http/Controllers/AuthController.php ===

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    // ============= REGISTER =============
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:255'],
            'email'    => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
        ]);

        // TTL từ config .env có thể là string -> ép int
        // sanctum.expiration (phút) mặc định null = không hết hạn
        $ttlMinutes = config('sanctum.expiration');
        $ttlMinutes = is_null($ttlMinutes) ? 0 : (int)$ttlMinutes; // 0 => không set expiresAt

        $expiresAt = $ttlMinutes > 0 ? now()->copy()->addMinutes($ttlMinutes) : null;

        $plainTextToken = $user->createToken('web', ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
            'token'   => $plainTextToken,
            'expires_at' => $expiresAt,
        ], 201);
    }

    // ============= LOGIN (API alias) =============
    public function apiLogin(Request $request)
    {
        $data = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $data['email'])->first();

        if (!$user || !Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Thông tin đăng nhập không đúng.'],
            ]);
        }

        // Ép kiểu TTL như trên
        $ttlMinutes = config('sanctum.expiration');
        $ttlMinutes = is_null($ttlMinutes) ? 0 : (int)$ttlMinutes;
        $expiresAt  = $ttlMinutes > 0 ? now()->copy()->addMinutes($ttlMinutes) : null;

        $plainTextToken = $user->createToken('web', ['*'], $expiresAt)->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user'    => $user,
            'token'   => $plainTextToken,
            'expires_at' => $expiresAt,
        ]);
    }

    // ============= USER INFO =============
    public function user(Request $request)
    {
        return response()->json($request->user());
    }

    // ============= LOGOUT (API alias) =============
    public function apiLogout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();
        if ($token) {
            $token->delete();
        }
        return response()->json(['message' => 'Đã đăng xuất']);
    }
}
