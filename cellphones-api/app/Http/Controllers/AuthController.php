<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Models\User;

class AuthController extends Controller
{
    // ========== Đăng ký (public) ==========
    public function register(Request $request)
    {
        $data = $request->validate([
            'name'     => ['required','string','max:255'],
            'email'    => ['required','email','max:255','unique:users,email'],
            'password' => ['required','string','min:6'],
        ]);

        $user = User::create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'password' => Hash::make($data['password']),
            'role'     => 'user',
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công',
            'user'    => $user,
        ], 201);
    }

    // ========== (Giữ) Session-based login nếu sau này dùng chung eTLD ==========
    public function login(Request $request)
    {
        $cred = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        if (!Auth::attempt($cred)) {
            throw ValidationException::withMessages([
                'email' => ['Sai email hoặc mật khẩu.'],
            ]);
        }

        $request->session()->regenerate();

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'user'    => Auth::user(),
        ], 200);
    }

    public function logout(Request $request)
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    // ========== Bearer token login (KHÔNG cần CSRF) – DÙNG CHO PROD ==========
    public function apiLogin(Request $request)
    {
        $cred = $request->validate([
            'email'    => ['required','email'],
            'password' => ['required','string'],
        ]);

        $user = User::where('email', $cred['email'])->first();

        if (!$user || !Hash::check($cred['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Sai email hoặc mật khẩu.'],
            ]);
        }

        // Tạo personal access token cho client
        $token = $user->createToken('user_token')->plainTextToken;

        return response()->json([
            'message' => 'Đăng nhập thành công',
            'token'   => $token,
            'user'    => $user,
        ]);
    }

    public function apiLogout(Request $request)
    {
        // Xoá token hiện tại (route có middleware auth:sanctum)
        $token = $request->user()->currentAccessToken();
        if ($token) {
            $token->delete();
        }

        return response()->json(['message' => 'Đăng xuất thành công']);
    }

    // ========== Lấy user hiện tại ==========
    public function user(Request $request)
    {
        return response()->json($request->user());
    }
}
